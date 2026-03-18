import { useContext } from 'react';
import { useDispatch } from 'react-redux';

import { formatVault } from '@functions/vault.functions';
import { BitcoinError } from '@models/error-types';
import {
  HandlerType,
  PSBTSubmissionParams,
  TransactionHandlers,
  TransactionParams,
  TransactionType,
} from '@models/transaction.models';
import { BitcoinWalletType } from '@models/wallet';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { BitcoinWalletContext } from '@providers/bitcoin-wallet-context-provider';
import { mintUnmintActions } from '@store/slices/mintunmint/mintunmint.actions';
import { RedeemSteps } from '@store/slices/mintunmint/mintunmint.slice';
import { modalActions } from '@store/slices/modal/modal.actions';
import { LeatherDLCHandler, LedgerDLCHandler, UnisatFordefiDLCHandler } from 'dlc-btc-lib';
import {
  getBitsafeAddress,
  submitBitsafeWithdrawPSBT,
  submitFundingPSBT,
  submitWithdrawDepositPSBT,
} from 'dlc-btc-lib/attestor-request-functions';
import {
  fetchBitcoinTransaction,
  getVaultFundingBitcoinAddress,
  getVaultPayment,
} from 'dlc-btc-lib/bitcoin-functions';
import { VaultState } from 'dlc-btc-lib/models';
import { shiftValue } from 'dlc-btc-lib/utilities';
import { equals } from 'ramda';

import { BITCOIN_NETWORK_MAP } from '@shared/constants/bitcoin.constants';

import { useAttestorChainID } from './use-attestor-chain-id';
import { useExtendedAttestorGroupPublicKey } from './use-extended-attestor-group-public-key';
import { useFeeRecipient } from './use-fee-recipient';
import { useFetchVault } from './use-get-vault';
import { useLeather } from './use-leather';
import { useLedger } from './use-ledger';
import { useUnisatFordefi } from './use-unisat-fordefi';
import { useUserAddress } from './use-user-address';

interface RequiredDependencies {
  dlcHandler: LeatherDLCHandler | LedgerDLCHandler | UnisatFordefiDLCHandler;
  bitcoinWalletType: BitcoinWalletType;
  userAddress: string;
}

interface UsePSBTReturnType {
  handleSignDepositTransaction: (vaultUUID: string, depositAmount: number) => Promise<void>;
  handleSignWithdrawTransaction: (vaultUUID: string, withdrawAmount: number) => Promise<void>;
  handleSignBitsafeWithdrawTransaction: (
    vaultUUID: string,
    withdrawAmount: number
  ) => Promise<void>;
  isLoading: [boolean, string] | undefined;
}

export function usePSBT(): UsePSBTReturnType {
  const dispatch = useDispatch();

  const { dlcHandler, bitcoinWalletType, resetBitcoinWalletContext } =
    useContext(BitcoinWalletContext);

  const { coordinatorURL, bitcoinFeeRateMultiplier } = appConfiguration;

  const { data: feeRecipient } = useFeeRecipient();
  const { data: extendedAttestorGroupPublicKey } = useExtendedAttestorGroupPublicKey();

  const { fetchVault } = useFetchVault();

  const { data: userAddress } = useUserAddress();

  const attestorChainID = useAttestorChainID();

  const ledgerTransactionHandler = useLedger();
  const leatherTransactionHandler = useLeather();
  const unisatFordefiTransactionHandler = useUnisatFordefi();

  const transactionHandlers: TransactionHandlers = {
    handleFundingTransaction: {
      [BitcoinWalletType.Leather]: leatherTransactionHandler.handleFundingTransaction,
      [BitcoinWalletType.Ledger]: ledgerTransactionHandler.handleFundingTransaction,
      [BitcoinWalletType.Unisat]: unisatFordefiTransactionHandler.handleFundingTransaction,
      [BitcoinWalletType.Fordefi]: unisatFordefiTransactionHandler.handleFundingTransaction,
    },
    handleWithdrawTransaction: {
      [BitcoinWalletType.Leather]: leatherTransactionHandler.handleWithdrawTransaction,
      [BitcoinWalletType.Ledger]: ledgerTransactionHandler.handleWithdrawTransaction,
      [BitcoinWalletType.Unisat]: unisatFordefiTransactionHandler.handleWithdrawTransaction,
      [BitcoinWalletType.Fordefi]: unisatFordefiTransactionHandler.handleWithdrawTransaction,
    },
    handleDepositTransaction: {
      [BitcoinWalletType.Leather]: leatherTransactionHandler.handleDepositTransaction,
      [BitcoinWalletType.Ledger]: ledgerTransactionHandler.handleDepositTransaction,
      [BitcoinWalletType.Unisat]: unisatFordefiTransactionHandler.handleDepositTransaction,
      [BitcoinWalletType.Fordefi]: unisatFordefiTransactionHandler.handleDepositTransaction,
    },
  };

  const submitPSBT = async ({
    transaction,
    vault,
    userAddress,
    dlcHandler,
    coordinatorURL,
    attestorChainID,
  }: PSBTSubmissionParams): Promise<void> => {
    const transactionPSBT = bytesToHex(transaction.toPSBT());

    switch (equals(vault.status, VaultState.READY)) {
      case true:
        return submitFundingPSBT([coordinatorURL], {
          vaultUUID: vault.uuid,
          fundingPSBT: transactionPSBT,
          userEthereumAddress: userAddress,
          userBitcoinTaprootPublicKey: dlcHandler.getUserTaprootPublicKey(),
          attestorChainID,
        });
      default:
        return submitWithdrawDepositPSBT([coordinatorURL], {
          vaultUUID: vault.uuid,
          withdrawDepositPSBT: transactionPSBT,
        });
    }
  };

  const getPSBTParameters = async (
    vaultUUID: string,
    amount: number
  ): Promise<TransactionParams> => {
    if (!feeRecipient) throw new Error('Fee Recipient is not setup');
    if (!extendedAttestorGroupPublicKey)
      throw new Error('Extended Attestor Group Public Key is not setup');

    const vault = await fetchVault(vaultUUID);

    return {
      vault,
      amount,
      extendedAttestorGroupPublicKey,
      feeRecipient,
      bitcoinFeeRateMultiplier,
    };
  };

  const getRequiredDependencies = (): RequiredDependencies => {
    if (!dlcHandler) throw new Error('DLC Handler is not setup');
    if (!bitcoinWalletType) throw new BitcoinError('Bitcoin Wallet Type is not setup');
    if (!userAddress) throw new Error('User Address is not setup');

    return { dlcHandler, bitcoinWalletType, userAddress };
  };

  const getFundingAddress = async (
    vault: TransactionParams['vault']
  ): Promise<string | undefined> => {
    try {
      const payment = getVaultPayment(
        vault.uuid,
        vault.taprootPubKey,
        extendedAttestorGroupPublicKey!,
        BITCOIN_NETWORK_MAP[appConfiguration.bitcoinNetwork as keyof typeof BITCOIN_NETWORK_MAP]
      );
      const bitcoinTransaction = await fetchBitcoinTransaction(
        vault.fundingTxId,
        appConfiguration.bitcoinBlockchainURL
      );
      return getVaultFundingBitcoinAddress(payment, bitcoinTransaction, feeRecipient!);
    } catch {
      return undefined;
    }
  };

  const throwTransactionError = (type: TransactionType, error: any): never => {
    if (error instanceof Error) {
      throw new BitcoinError(`Error signing ${type} Transaction: ${error.message}`);
    }
    throw new BitcoinError(`Unknown error signing ${type} Transaction`);
  };

  const handlerTypeMap = {
    withdraw: (): HandlerType => 'handleWithdrawTransaction',
    deposit: (valueLocked: number): HandlerType =>
      equals(valueLocked, 0) ? 'handleFundingTransaction' : 'handleDepositTransaction',
  } as const;

  const createTransactionHandler =
    (type: TransactionType) =>
    async (vaultUUID: string, value: number): Promise<void> => {
      let vault: TransactionParams['vault'] | undefined;
      try {
        const { dlcHandler, bitcoinWalletType, userAddress } = getRequiredDependencies();

        const psbtParams = await getPSBTParameters(vaultUUID, value);
        vault = psbtParams.vault;
        const { amount, extendedAttestorGroupPublicKey, feeRecipient, bitcoinFeeRateMultiplier } =
          psbtParams;

        const handlerType = handlerTypeMap[type](vault.valueLocked.toNumber());

        const transactionHandler = transactionHandlers[handlerType][bitcoinWalletType];

        const transaction = await transactionHandler(
          vault,
          amount,
          extendedAttestorGroupPublicKey,
          feeRecipient,
          bitcoinFeeRateMultiplier
        );

        await submitPSBT({
          transaction,
          vault,
          userAddress,
          dlcHandler,
          coordinatorURL,
          attestorChainID,
        });

        resetBitcoinWalletContext();
      } catch (error) {
        if (
          vault &&
          error instanceof Error &&
          error.message.includes('Could not find Funding Transaction Output Index')
        ) {
          const fundingAddress = await getFundingAddress(vault);
          if (fundingAddress) {
            throwTransactionError(
              type,
              new Error(
                `${error.message}. Please verify you're signing with the BTC wallet that matches the Funding BTC Address: ${fundingAddress}`
              )
            );
          }
        }
        throwTransactionError(type, error);
      }
    };

  const handleSignBitsafeWithdrawTransaction = async (
    vaultUUID: string,
    withdrawAmount: number
  ): Promise<void> => {
    let vault: TransactionParams['vault'] | undefined;
    try {
      const { dlcHandler } = getRequiredDependencies();

      const psbtParams = await getPSBTParameters(vaultUUID, withdrawAmount);
      vault = psbtParams.vault;
      const { amount, extendedAttestorGroupPublicKey, feeRecipient, bitcoinFeeRateMultiplier } =
        psbtParams;

      const bitsafeAddress = await getBitsafeAddress(coordinatorURL);

      const withdrawPSBT = await dlcHandler.createWithdrawPSBT(
        vault,
        BigInt(shiftValue(amount)),
        extendedAttestorGroupPublicKey,
        vault.fundingTxId,
        feeRecipient,
        bitcoinFeeRateMultiplier,
        undefined,
        bitsafeAddress
      );

      const signedTransaction = await dlcHandler.signPSBT(withdrawPSBT, 'withdraw');

      const btcTxId = bytesToHex(sha256(sha256(signedTransaction.unsignedTx)).reverse());

      const transactionPSBT = bytesToHex(signedTransaction.toPSBT());
      await submitBitsafeWithdrawPSBT([coordinatorURL], {
        vaultUUID: vault.uuid,
        withdrawDepositPSBT: transactionPSBT,
      });

      dispatch(
        modalActions.toggleSuccessfulFlowModalVisibility({
          vaultUUID: vault.uuid,
          vault: formatVault(vault),
          flow: 'bitsafe',
          assetAmount: amount,
          btcTxId,
        })
      );

      dispatch(mintUnmintActions.setUnmintStep({ step: RedeemSteps.BURN, vault: undefined }));
      dispatch(mintUnmintActions.setIsBitsafeWithdraw(false));

      resetBitcoinWalletContext();
    } catch (error) {
      if (
        vault &&
        error instanceof Error &&
        error.message.includes('Could not find Funding Transaction Output Index')
      ) {
        const fundingAddress = await getFundingAddress(vault);
        if (fundingAddress) {
          throwTransactionError(
            'withdraw',
            new Error(
              `${error.message}. Please verify you're signing with the BTC wallet that matches the Funding BTC Address: ${fundingAddress}`
            )
          );
        }
      }
      throwTransactionError('withdraw', error);
    }
  };

  const loadingStates = {
    [BitcoinWalletType.Ledger]: ledgerTransactionHandler.isLoading,
    [BitcoinWalletType.Leather]: leatherTransactionHandler.isLoading,
    [BitcoinWalletType.Unisat]: unisatFordefiTransactionHandler.isLoading,
    [BitcoinWalletType.Fordefi]: unisatFordefiTransactionHandler.isLoading,
  };

  return {
    handleSignDepositTransaction: createTransactionHandler('deposit'),
    handleSignWithdrawTransaction: createTransactionHandler('withdraw'),
    handleSignBitsafeWithdrawTransaction,
    isLoading: loadingStates[bitcoinWalletType!],
  };
}
