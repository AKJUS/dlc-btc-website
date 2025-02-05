import { useContext, useState } from 'react';

import { LeatherError } from '@models/error-types';
import {
  Account,
  BitcoinAccount,
  BitcoinAccounts,
  BitcoinNativeSegwitAccount,
  BitcoinTaprootAccount,
  RpcResponse,
} from '@models/software-wallet.models';
import { BitcoinWalletAction, BitcoinWalletType } from '@models/wallet';
import { bytesToHex } from '@noble/hashes/utils';
import {
  BitcoinWalletContext,
  BitcoinWalletContextState,
} from '@providers/bitcoin-wallet-context-provider';
import { LeatherDLCHandler } from 'dlc-btc-lib';
import { RawVault, Transaction } from 'dlc-btc-lib/models';
import { shiftValue } from 'dlc-btc-lib/utilities';

import { BITCOIN_NETWORK_MAP, walletLoadingState } from '@shared/constants/bitcoin.constants';

interface UseLeatherReturnType {
  connectLeatherWallet: () => Promise<void>;
  handleFundingTransaction: (
    dlcHandler: LeatherDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRecipient: string,
    feeRateMultiplier: number
  ) => Promise<Transaction>;
  handleDepositTransaction: (
    dlcHandler: LeatherDLCHandler,
    vault: RawVault,
    bitcoinAmount: number,
    attestorGroupPublicKey: string,
    feeRecipient: string,
    feeRateMultiplier: number
  ) => Promise<Transaction>;
  handleWithdrawTransaction: (
    dlcHandler: LeatherDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRecipient: string,
    feeRateMultiplier: number
  ) => Promise<string>;
  isLoading: [boolean, string];
}

export function useLeather(): UseLeatherReturnType {
  const { setDLCHandler, setBitcoinWalletContextState, setBitcoinWalletType, bitcoinWalletType } =
    useContext(BitcoinWalletContext);

  const [isLoading, setIsLoading] = useState<[boolean, string]>([false, '']);

  /**
   * Checks if the user's Leather Wallet is on the same network as the app.
   *
   * @param userNativeSegwitAddress - The user's native segwit address.
   *
   * @returns Throws an error if the user's wallet is not on the same network as the app.
   */
  function checkUserWalletNetwork(userNativeSegwitAddress: Account): void {
    if (!userNativeSegwitAddress.address.startsWith(appConfiguration.bitcoinNetworkPreFix))
      throw new LeatherError(`User wallet is not on [${appConfiguration.bitcoinNetwork}] Network`);
  }

  /**
   * Fetches the user's native segwit and taproot address from the user's wallet.
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
   * Fetches the User's Leather Wallet Information.
   *
   * @returns A promise that resolves to set the Bitcoin Wallet Context State to Ready.
   */
  async function connectLeatherWallet(): Promise<void> {
    try {
      setIsLoading(walletLoadingState(BitcoinWalletAction.CONNECTING, BitcoinWalletType.Leather));

      const { nativeSegwitAccount, taprootAccount } = await getBitcoinAddresses();

      const leatherDLCHandler = new LeatherDLCHandler(
        'wpkh',
        BITCOIN_NETWORK_MAP[appConfiguration.bitcoinNetwork],
        appConfiguration.bitcoinBlockchainURL,
        appConfiguration.bitcoinBlockchainFeeEstimateURL,
        nativeSegwitAccount.publicKey,
        taprootAccount.publicKey
      );

      setDLCHandler(leatherDLCHandler);
      setBitcoinWalletType(BitcoinWalletType.Leather);
      setBitcoinWalletContextState(BitcoinWalletContextState.READY);
    } catch (error) {
      throw new LeatherError(`Error getting Leather Wallet Information: ${error}`);
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  /**
   * Creates the Funding Transaction and signs it with Leather Wallet.
   * @param dlcHandler The DLC Handler.
   * @param vault The Vault to interact with.
   * @param bitcoinAmount The Bitcoin Amount to fund the Vault.
   * @param attestorGroupPublicKey The Attestor Group Public Key.
   * @param feeRateMultiplier The Fee Rate Multiplier for the Transaction.
   *
   * @returns The Signed Funding Transaction.
   */
  async function handleFundingTransaction(
    dlcHandler: LeatherDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRecipient: string,
    feeRateMultiplier: number
  ): Promise<Transaction> {
    try {
      setIsLoading(
        walletLoadingState(BitcoinWalletAction.CREATING_TRANSACTION, bitcoinWalletType, 'Funding')
      );
      const formattedDepositAmount = BigInt(shiftValue(depositAmount));

      const fundingPSBT = await dlcHandler?.createFundingPSBT(
        vault,
        formattedDepositAmount,
        attestorGroupPublicKey,
        feeRecipient,
        feeRateMultiplier
      );

      setIsLoading(
        walletLoadingState(BitcoinWalletAction.SIGNING_TRANSACTION, bitcoinWalletType, 'Funding')
      );

      const signedFundingTransaction = await dlcHandler.signPSBT(fundingPSBT, 'funding');

      return signedFundingTransaction;
    } catch (error) {
      throw new LeatherError(`Error handling Funding Transaction: ${error}`);
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  /**
   * Creates a Deposit Transaction and signs it with Leather Wallet.
   * @param dlcHandler The DLC Handler.
   * @param vault The Vault to interact with.
   * @param depositAmount The Bitcoin Amount to deposit into the Vault.
   * @param attestorGroupPublicKey The Attestor Group Public Key.
   * @param feeRateMultiplier The Fee Rate Multiplier for the Transaction.
   *
   * @returns The Signed Deposit Transaction.
   */
  async function handleDepositTransaction(
    dlcHandler: LeatherDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRecipient: string,
    feeRateMultiplier: number
  ): Promise<Transaction> {
    try {
      setIsLoading(
        walletLoadingState(BitcoinWalletAction.CREATING_TRANSACTION, bitcoinWalletType, 'Deposit')
      );

      const formattedDepositAmount = BigInt(shiftValue(depositAmount));

      const depositPSBT = await dlcHandler?.createDepositPSBT(
        vault,
        formattedDepositAmount,
        attestorGroupPublicKey,
        vault.fundingTxId,
        feeRecipient,
        feeRateMultiplier
      );

      setIsLoading(
        walletLoadingState(BitcoinWalletAction.SIGNING_TRANSACTION, bitcoinWalletType, 'Deposit')
      );

      const signedDepositTransaction = await dlcHandler.signPSBT(depositPSBT, 'deposit');

      return signedDepositTransaction;
    } catch (error) {
      throw new LeatherError(`Error handling Deposit Transaction: ${error}`);
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  /**
   * Creates a Withdraw Transaction and signs it with Unisat or Fordefi Wallet.
   * @param dlcHandler The DLC Handler.
   * @param vault The Vault to interact with.
   * @param withdrawAmount The Bitcoin Amount to withdraw from the Vault.
   * @param attestorGroupPublicKey The Attestor Group Public Key.
   * @param feeRateMultiplier The Fee Rate Multiplier.
   *
   * @returns The Signed Withdraw Transaction.
   */
  async function handleWithdrawTransaction(
    dlcHandler: LeatherDLCHandler,
    vault: RawVault,
    withdrawAmount: number,
    attestorGroupPublicKey: string,
    feeRecipient: string,
    feeRateMultiplier: number
  ): Promise<string> {
    try {
      setIsLoading(
        walletLoadingState(BitcoinWalletAction.CREATING_TRANSACTION, bitcoinWalletType, 'Withdraw')
      );

      const formattedWithdrawAmount = BigInt(shiftValue(withdrawAmount));

      const withdrawalTransaction = await dlcHandler.createWithdrawPSBT(
        vault,
        formattedWithdrawAmount,
        attestorGroupPublicKey,
        vault.fundingTxId,
        feeRecipient,
        feeRateMultiplier
      );

      setIsLoading(
        walletLoadingState(BitcoinWalletAction.SIGNING_TRANSACTION, bitcoinWalletType, 'Withdraw')
      );

      const signedWithdrawTransaction = await dlcHandler.signPSBT(
        withdrawalTransaction,
        'withdraw'
      );

      return bytesToHex(signedWithdrawTransaction.toPSBT());
    } catch (error) {
      throw new LeatherError(`Error handling Withdrawal Transaction: ${error}`);
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  return {
    connectLeatherWallet,
    handleFundingTransaction,
    handleDepositTransaction,
    handleWithdrawTransaction,
    isLoading,
  };
}
