import { useContext, useState } from 'react';

import { ALL_SUPPORTED_BITCOIN_NETWORK_PREFIX } from '@models/configuration';
import { UnisatError } from '@models/error-types';
import {
  BitcoinTaprootAccount,
  UnisatSignPsbtRequestOptions,
  UnisatToSignInput,
} from '@models/software-wallet.models';
import { BitcoinWalletType } from '@models/wallet';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import {
  BitcoinWalletContext,
  BitcoinWalletContextState,
} from '@providers/bitcoin-wallet-context-provider';
import { SoftwareWalletDLCHandler } from 'dlc-btc-lib';
import { finalizeUserInputs, getInputIndicesByScript } from 'dlc-btc-lib/bitcoin-functions';
import { RawVault, Transaction } from 'dlc-btc-lib/models';
import { shiftValue } from 'dlc-btc-lib/utilities';

import { BITCOIN_NETWORK_MAP } from '@shared/constants/bitcoin.constants';

interface UseUnisatReturnType {
  connectUnisatWallet: (isFordefi?: boolean) => Promise<void>;
  handleFundingTransaction: (
    dlcHandler: SoftwareWalletDLCHandler,
    vault: RawVault,
    bitcoinAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ) => Promise<Transaction>;
  handleDepositTransaction: (
    dlcHandler: SoftwareWalletDLCHandler,
    vault: RawVault,
    bitcoinAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ) => Promise<Transaction>;
  handleWithdrawalTransaction: (
    dlcHandler: SoftwareWalletDLCHandler,
    withdrawAmount: number,
    attestorGroupPublicKey: string,
    vault: RawVault,
    feeRateMultiplier: number
  ) => Promise<string>;
  isLoading: [boolean, string];
}

export function useUnisat(): UseUnisatReturnType {
  const { setDLCHandler, setBitcoinWalletContextState, setBitcoinWalletType } =
    useContext(BitcoinWalletContext);

  const [isLoading, setIsLoading] = useState<[boolean, string]>([false, '']);

  /**
   * Requests the user's Unisat Wallet to sign the PSBT.
   *
   * @param psbt - The PSBT to sign.
   * @param inputsToSign - The inputs to sign.
   * @returns A promise that resolves to the signed PSBT.
   */
  async function signPSBT(
    psbt: Uint8Array,
    inputsToSign: { index: number; address?: string; publicKey?: string }[]
  ): Promise<string> {
    try {
      const options: UnisatSignPsbtRequestOptions = {
        autoFinalized: false,
        toSignInputs: inputsToSign,
      };
      const result = await window.unisat.signPsbt(bytesToHex(psbt), options);
      return result;
    } catch (error) {
      throw new UnisatError(`Error signing PSBT: ${error}`);
    }
  }

  /**
   * Gets the inputs to sign for the given transaction.
   *
   * @param dlcHandler - The DLC Handler.
   * @param transaction - The transaction to sign.
   * @returns The inputs to sign.
   */
  function getInputsToSign(
    dlcHandler: SoftwareWalletDLCHandler,
    transaction: Transaction
  ): UnisatToSignInput[] {
    if (!dlcHandler.payment) {
      throw new UnisatError('Payment information is not set in the DLC handler.');
    }

    const { multisigPayment, fundingPayment } = dlcHandler.payment;

    const multisigInputIndices = getInputIndicesByScript(multisigPayment.script, transaction);
    const fundingInputIndices = getInputIndicesByScript(fundingPayment.script, transaction);

    const multisigInputsToSign: UnisatToSignInput[] = multisigInputIndices.map(index => ({
      index,
      publicKey: dlcHandler.getTaprootDerivedPublicKey(),
      disableTweakSigner: true,
    }));

    const fundingInputsToSign: UnisatToSignInput[] = fundingInputIndices.map(index => ({
      index,
      address: fundingPayment.address,
    }));

    return multisigInputsToSign.concat(fundingInputsToSign);
  }

  /**
   * Checks if the user's Unisat Wallet is on the same network as the app and if the address is a taproot address.
   *
   * @param userAddress - The user's address.
   * @throws UnisatError - If the user's wallet is not on the same network as the app or if the address is not a taproot address.
   */
  function checkUserWalletNetworkAndAddressType(userAddress: string): void {
    if (
      !ALL_SUPPORTED_BITCOIN_NETWORK_PREFIX.some(prefix => userAddress.startsWith(`${prefix}p`))
    ) {
      throw new UnisatError('User wallet is not a Taproot address');
    }
    if (!userAddress.startsWith(appConfiguration.bitcoinNetworkPreFix)) {
      throw new UnisatError(`User wallet is not on [${appConfiguration.bitcoinNetwork}] Network`);
    }
  }

  /**
   * Fetches the user's taproot address from the user's wallet. A Taproot address is necessary for both the deposit transaction and the user's public key, which is utilized in the multisig transaction.
   *
   * @returns A promise that resolves to the user's taproot address.
   */
  async function getBitcoinAddresses(isFordefi: boolean = false): Promise<BitcoinTaprootAccount> {
    try {
      if (!window.unisat) {
        throw new UnisatError(
          isFordefi ? 'Fordefi Wallet is Not Installed' : 'Unisat Wallet is Not Installed'
        );
      } else if (isFordefi && !window?.unisat?.is_fordefi) {
        throw new UnisatError('Please disable Unisat Wallet and enable Fordefi Wallet');
      } else if (!isFordefi && window?.unisat?.is_fordefi) {
        throw new UnisatError('Please disable Fordefi Wallet and enable Unisat Wallet');
      }

      const userAddresses: string[] = await window.unisat.requestAccounts();

      checkUserWalletNetworkAndAddressType(userAddresses[0]);

      const publicKey = await window.unisat.getPublicKey();

      return {
        type: 'p2tr',
        publicKey,
        address: userAddresses[0],
        symbol: 'BTC',
      };
    } catch (error) {
      throw new UnisatError(`Error getting bitcoin addresses: ${error}`);
    }
  }

  /**
   * Fetches the User's Unisat Wallet Information.
   *
   * @returns A promise that resolves to the User's Taproot Address.
   */
  async function connectUnisatWallet(isFordefi: boolean = false): Promise<void> {
    try {
      setIsLoading([true, 'Connecting To Unisat Wallet']);

      const taprootAccount = await getBitcoinAddresses(isFordefi);

      const unisatDLCHandler = new SoftwareWalletDLCHandler(
        taprootAccount.publicKey,
        taprootAccount.publicKey,
        'tr',
        BITCOIN_NETWORK_MAP[appConfiguration.bitcoinNetwork],
        appConfiguration.bitcoinBlockchainURL,
        appConfiguration.bitcoinBlockchainFeeEstimateURL
      );

      setDLCHandler(unisatDLCHandler);
      setBitcoinWalletType(BitcoinWalletType.Unisat);
      setBitcoinWalletContextState(BitcoinWalletContextState.READY);
      setIsLoading([false, '']);
    } catch (error) {
      setIsLoading([false, '']);
      throw new UnisatError(`Error getting Unisat Wallet Information: ${error}`);
    }
  }

  /**
   * Creates the Funding Transaction and signs it with Unisat Wallet.
   * @param dlcHandler The DLC Handler.
   * @param vault The Vault to interact with.
   * @param bitcoinAmount The Bitcoin Amount to fund the Vault.
   * @param attestorGroupPublicKey The Attestor Group Public Key.
   * @param feeRateMultiplier The Fee Rate Multiplier for the Transaction.
   * @returns The Signed Funding Transaction.
   */
  async function handleFundingTransaction(
    dlcHandler: SoftwareWalletDLCHandler,
    vault: RawVault,
    bitcoinAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ): Promise<Transaction> {
    try {
      setIsLoading([true, 'Creating Deposit Transaction']);

      // ==> Create Funding Transaction
      const fundingPSBT = await dlcHandler?.createFundingPSBT(
        vault,
        BigInt(shiftValue(bitcoinAmount)),
        attestorGroupPublicKey,
        feeRateMultiplier
      );

      setIsLoading([true, 'Sign Funding Transaction in your Unisat Wallet']);

      // ==> Sign Funding PSBT with Unisat
      const fundingTransactionHex = await signPSBT(
        fundingPSBT.toPSBT(),
        getInputsToSign(dlcHandler, fundingPSBT)
      );

      // ==> Finalize Funding Transaction
      const fundingTransaction = Transaction.fromPSBT(hexToBytes(fundingTransactionHex));
      fundingTransaction.finalize();

      setIsLoading([false, '']);
      return fundingTransaction;
    } catch (error) {
      setIsLoading([false, '']);
      throw new UnisatError(`Error handling Funding Transaction: ${error}`);
    }
  }

  /**
   * Creates a Deposit Transaction and signs it with Unisat Wallet.
   * @param dlcHandler The DLC Handler.
   * @param vault The Vault to interact with.
   * @param bitcoinAmount The Bitcoin Amount to deposit into the Vault.
   * @param attestorGroupPublicKey The Attestor Group Public Key.
   * @param feeRateMultiplier The Fee Rate Multiplier for the Transaction.
   * @returns The Signed Deposit Transaction.
   */
  async function handleDepositTransaction(
    dlcHandler: SoftwareWalletDLCHandler,
    vault: RawVault,
    bitcoinAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ): Promise<Transaction> {
    try {
      setIsLoading([true, 'Creating Deposit Transaction']);

      // ==> Create Deposit Transaction
      const depositPSBT = await dlcHandler?.createDepositPSBT(
        BigInt(shiftValue(bitcoinAmount)),
        vault,
        attestorGroupPublicKey,
        vault.fundingTxId,
        feeRateMultiplier
      );

      const depositPayment = dlcHandler.payment?.fundingPayment;

      if (!depositPayment) {
        throw new UnisatError('Deposit Payment is not set');
      }
      setIsLoading([true, 'Sign Deposit Transaction in your Unisat Wallet']);

      // ==> Sign Deposibt PSBT with Unisat
      const depositTransactionHex = await signPSBT(
        depositPSBT.toPSBT(),
        getInputsToSign(dlcHandler, depositPSBT)
      );

      // ==> Finalize Deposit Transaction's Additional Deposit Input
      const depositTransaction = Transaction.fromPSBT(hexToBytes(depositTransactionHex));
      getInputIndicesByScript(depositPayment.script, depositTransaction);
      finalizeUserInputs(depositTransaction, depositPayment);

      setIsLoading([false, '']);
      return depositTransaction;
    } catch (error) {
      setIsLoading([false, '']);
      throw new UnisatError(`Error handling Deposit Transaction: ${error}`);
    }
  }

  /**
   * Creates a Withdrawal Transaction and signs it with Unisat Wallet.
   * @param dlcHandler The DLC Handler.
   * @param withdrawAmount The Withdrawal Amount to withdraw from the Vault.
   * @param attestorGroupPublicKey The Attestor Group Public Key.
   * @param vault The Vault to interact with.
   * @param feeRateMultiplier The Fee Rate Multiplier.
   * @returns The Signed Withdrawal Transaction.
   */
  async function handleWithdrawalTransaction(
    dlcHandler: SoftwareWalletDLCHandler,
    withdrawAmount: number,
    attestorGroupPublicKey: string,
    vault: RawVault,
    feeRateMultiplier: number
  ): Promise<string> {
    try {
      setIsLoading([true, 'Creating Withdrawal Transaction']);

      const withdrawalTransaction = await dlcHandler.createWithdrawPSBT(
        vault,
        BigInt(shiftValue(withdrawAmount)),
        attestorGroupPublicKey,
        vault.fundingTxId,
        feeRateMultiplier
      );

      setIsLoading([true, 'Sign Withdrawal Transaction in your Unisat Wallet']);

      // ==> Sign Withdrawal PSBT with Unisat
      const withdrawalTransactionHex = await signPSBT(
        withdrawalTransaction.toPSBT(),
        getInputsToSign(dlcHandler, withdrawalTransaction)
      );

      setIsLoading([false, '']);
      return withdrawalTransactionHex;
    } catch (error) {
      setIsLoading([false, '']);
      throw new UnisatError(`Error handling Withdrawal Transaction: ${error}`);
    }
  }

  return {
    connectUnisatWallet,
    handleFundingTransaction,
    handleDepositTransaction,
    handleWithdrawalTransaction,
    isLoading,
  };
}
