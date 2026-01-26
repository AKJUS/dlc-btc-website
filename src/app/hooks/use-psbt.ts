import { useContext } from 'react';

import { BitcoinError } from '@models/error-types';
import {
  HandlerType,
  PSBTSubmissionParams,
  TransactionHandlers,
  TransactionParams,
  TransactionType,
} from '@models/transaction.models';
import { BitcoinWalletType } from '@models/wallet';
import { bytesToHex } from '@noble/hashes/utils';
import { BitcoinWalletContext } from '@providers/bitcoin-wallet-context-provider';
import { LeatherDLCHandler, LedgerDLCHandler, UnisatFordefiDLCHandler } from 'dlc-btc-lib';
import {
  getBitsafeAddress,
  submitBitsafeWithdrawPSBT,
  submitFundingPSBT,
  submitWithdrawDepositPSBT,
} from 'dlc-btc-lib/attestor-request-functions';
import { VaultState } from 'dlc-btc-lib/models';
import { shiftValue } from 'dlc-btc-lib/utilities';
import { equals } from 'ramda';

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
  handleSignBitsafeWithdrawTransaction: (vaultUUID: string, withdrawAmount: number) => Promise<void>;
  isLoading: [boolean, string] | undefined;
}

export function usePSBT(): UsePSBTReturnType {
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
      try {
        const { dlcHandler, bitcoinWalletType, userAddress } = getRequiredDependencies();

        const {
          vault,
          amount,
          extendedAttestorGroupPublicKey,
          feeRecipient,
          bitcoinFeeRateMultiplier,
        } = await getPSBTParameters(vaultUUID, value);

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
        throwTransactionError(type, error);
      }
    };

  const handleSignBitsafeWithdrawTransaction = async (
    vaultUUID: string,
    withdrawAmount: number
  ): Promise<void> => {
    try {
      const { dlcHandler } = getRequiredDependencies();

      const {
        vault,
        extendedAttestorGroupPublicKey,
        feeRecipient,
        bitcoinFeeRateMultiplier,
      } = await getPSBTParameters(vaultUUID, withdrawAmount);

      // Fetch the Bitsafe destination address from the attestor
      const bitsafeAddress = await getBitsafeAddress(coordinatorURL);

      const formattedWithdrawAmount = BigInt(shiftValue(withdrawAmount));

      // Create the withdraw PSBT with Bitsafe destination address
      const withdrawTransaction = await dlcHandler.createWithdrawPSBT(
        vault,
        formattedWithdrawAmount,
        extendedAttestorGroupPublicKey,
        vault.fundingTxId,
        feeRecipient,
        bitcoinFeeRateMultiplier,
        undefined, // customFeeRate
        bitsafeAddress // destinationAddress
      );

      // Sign the transaction
      const signedTransaction = await dlcHandler.signPSBT(withdrawTransaction, 'withdraw');

      const transactionPSBT = bytesToHex(signedTransaction.toPSBT());

      // Submit via the Bitsafe-specific endpoint
      await submitBitsafeWithdrawPSBT([coordinatorURL], {
        vaultUUID: vault.uuid,
        withdrawDepositPSBT: transactionPSBT,
      });

      resetBitcoinWalletContext();
    } catch (error) {
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
