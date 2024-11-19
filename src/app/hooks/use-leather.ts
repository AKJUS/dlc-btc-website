import { useContext, useState } from 'react';

import { LeatherError } from '@models/error-types';
import {
  Account,
  BitcoinAccount,
  BitcoinAccounts,
  BitcoinNativeSegwitAccount,
  BitcoinTaprootAccount,
  RpcResponse,
  SignPsbtRequestParams,
} from '@models/software-wallet.models';
import { BitcoinWalletType } from '@models/wallet';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import {
  BitcoinWalletContext,
  BitcoinWalletContextState,
} from '@providers/bitcoin-wallet-context-provider';
import { SoftwareWalletDLCHandler } from 'dlc-btc-lib';
import { finalizeUserInputs } from 'dlc-btc-lib/bitcoin-functions';
import { RawVault, Transaction } from 'dlc-btc-lib/models';
import { shiftValue } from 'dlc-btc-lib/utilities';

import { BITCOIN_NETWORK_MAP } from '@shared/constants/bitcoin.constants';

interface UseLeatherReturnType {
  connectLeatherWallet: () => Promise<void>;
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

export function useLeather(): UseLeatherReturnType {
  const { setDLCHandler, setBitcoinWalletContextState, setBitcoinWalletType } =
    useContext(BitcoinWalletContext);

  const [isLoading, setIsLoading] = useState<[boolean, string]>([false, '']);

  /**
   * Requests the user's Leather Wallet to sign the PSBT.
   *
   * @param psbt - The PSBT to sign.
   * @returns A promise that resolves to the signed PSBT.
   */
  async function signPSBT(psbt: Uint8Array): Promise<string> {
    try {
      const requestParams: SignPsbtRequestParams = {
        hex: bytesToHex(psbt),
      };
      const result = await window.btc.request('signPsbt', requestParams);
      return result.result.hex;
    } catch (error) {
      throw new LeatherError(`Error signing PSBT: ${error}`);
    }
  }

  /**
   * Checks if the user's Leather Wallet is on the same network as the app.
   *
   * @param userNativeSegwitAddress - The user's native segwit address.
   * @throws BitcoinError - If the user's wallet is not on the same network as the app.
   */
  function checkUserWalletNetwork(userNativeSegwitAddress: Account): void {
    if (!userNativeSegwitAddress.address.startsWith(appConfiguration.bitcoinNetworkPreFix))
      throw new LeatherError(`User wallet is not on [${appConfiguration.bitcoinNetwork}] Network`);
  }

  /**
   * Fetches the user's native segwit and taproot addresses from the user's wallet. Taproot address is required for the user's public key, which is used in the multisig transaction.
   * Current implementation is using Leather Wallet.
   *
   * @returns A promise that resolves to the user's native segwit and taproot addresses.
   */
  async function getBitcoinAddresses(): Promise<BitcoinAccounts> {
    try {
      const rpcResponse: RpcResponse = await window.btc?.request('getAddresses');
      const userAddresses = rpcResponse.result.addresses;

      checkUserWalletNetwork(userAddresses[0]);

      const bitcoinAddresses = userAddresses.filter(
        address => address.symbol === 'BTC'
      ) as BitcoinAccount[];

      const nativeSegwitAccount = bitcoinAddresses.find(
        address => address.type === 'p2wpkh'
      ) as BitcoinNativeSegwitAccount;

      const taprootAccount = bitcoinAddresses.find(
        address => address.type === 'p2tr'
      ) as BitcoinTaprootAccount;

      return { nativeSegwitAccount, taprootAccount };
    } catch (error) {
      throw new LeatherError(`Error getting bitcoin addresses: ${error}`);
    }
  }

  /**
   * Fetches the User's Leather Wallet Information, including the User's Native Segwit and Taproot Addresses.
   *
   * @param vaultUUID - The UUID of the Vault.
   * @returns A promise that resolves to the User's Native Segwit and Taproot Addresses.
   */
  async function connectLeatherWallet(): Promise<void> {
    try {
      setIsLoading([true, 'Connecting To Leather Wallet']);
      const { nativeSegwitAccount, taprootAccount } = await getBitcoinAddresses();

      const leatherDLCHandler = new SoftwareWalletDLCHandler(
        nativeSegwitAccount.publicKey,
        taprootAccount.publicKey,
        'wpkh',
        BITCOIN_NETWORK_MAP[appConfiguration.bitcoinNetwork],
        appConfiguration.bitcoinBlockchainURL,
        appConfiguration.bitcoinBlockchainFeeEstimateURL
      );

      setDLCHandler(leatherDLCHandler);
      setBitcoinWalletType(BitcoinWalletType.Leather);
      setBitcoinWalletContextState(BitcoinWalletContextState.READY);
      setIsLoading([false, '']);
    } catch (error) {
      setIsLoading([false, '']);
      throw new LeatherError(`Error getting Leather Wallet Information: ${error}`);
    }
  }

  /**
   * Creates the Funding Transaction and signs it with Leather Wallet.
   * @param vaultUUID The Vault UUID.
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

      setIsLoading([true, 'Sign Funding Transaction in your Leather Wallet']);
      // ==> Sign Funding PSBT with Ledger
      const fundingTransactionHex = await signPSBT(fundingPSBT.toPSBT());

      // ==> Finalize Funding Transaction
      const fundingTransaction = Transaction.fromPSBT(hexToBytes(fundingTransactionHex));
      fundingTransaction.finalize();

      setIsLoading([false, '']);
      return fundingTransaction;
    } catch (error) {
      setIsLoading([false, '']);
      throw new LeatherError(`Error handling Funding Transaction: ${error}`);
    }
  }

  /**
   * Creates a Deposit Transaction and signs it with Leather Wallet.
   * @param vaultUUID The Vault UUID.
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
        throw new LeatherError('Deposit Payment is not set');
      }
      setIsLoading([true, 'Sign Deposit Transaction in your Leather Wallet']);

      // ==> Sign Deposibt PSBT with Leather
      const depositTransactionHex = await signPSBT(depositPSBT.toPSBT());

      // ==> Finalize Deposit Transaction's Additional Deposit Input
      const depositTransaction = Transaction.fromPSBT(hexToBytes(depositTransactionHex));
      finalizeUserInputs(depositTransaction, depositPayment);

      setIsLoading([false, '']);
      return depositTransaction;
    } catch (error) {
      setIsLoading([false, '']);
      throw new LeatherError(`Error handling Deposit Transaction: ${error}`);
    }
  }

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

      setIsLoading([true, 'Sign Withdrawal Transaction in your Leather Wallet']);
      // ==> Sign Withdrawal PSBT with Ledger
      const withdrawalTransactionHex = await signPSBT(withdrawalTransaction.toPSBT());

      setIsLoading([false, '']);
      return withdrawalTransactionHex;
    } catch (error) {
      setIsLoading([false, '']);
      throw new LeatherError(`Error handling Withdrawal Transaction: ${error}`);
    }
  }

  return {
    connectLeatherWallet,
    handleFundingTransaction,
    handleDepositTransaction,
    handleWithdrawalTransaction,
    isLoading,
  };
}
