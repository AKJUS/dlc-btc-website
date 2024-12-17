import { useContext, useState } from 'react';

import { ALL_SUPPORTED_BITCOIN_NETWORK_PREFIX } from '@models/configuration';
import { UnisatFordefiError } from '@models/error-types';
import { BitcoinTaprootAccount } from '@models/software-wallet.models';
import { BitcoinWalletAction, BitcoinWalletType } from '@models/wallet';
import { bytesToHex } from '@noble/hashes/utils';
import {
  BitcoinWalletContext,
  BitcoinWalletContextState,
} from '@providers/bitcoin-wallet-context-provider';
import { UnisatFordefiDLCHandler } from 'dlc-btc-lib';
import { RawVault, Transaction } from 'dlc-btc-lib/models';
import { shiftValue } from 'dlc-btc-lib/utilities';

import { BITCOIN_NETWORK_MAP, walletLoadingState } from '@shared/constants/bitcoin.constants';

interface UseUnisatFordefiReturnType {
  connectUnisatOrFordefiWallet: (isFordefi?: boolean) => Promise<void>;
  handleFundingTransaction: (
    dlcHandler: UnisatFordefiDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ) => Promise<Transaction>;
  handleDepositTransaction: (
    dlcHandler: UnisatFordefiDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ) => Promise<Transaction>;
  handleWithdrawTransaction: (
    dlcHandler: UnisatFordefiDLCHandler,
    vault: RawVault,
    withdrawAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ) => Promise<string>;
  isLoading: [boolean, string];
}

export function useUnisatFordefi(): UseUnisatFordefiReturnType {
  const { setDLCHandler, setBitcoinWalletContextState, setBitcoinWalletType, bitcoinWalletType } =
    useContext(BitcoinWalletContext);

  const [isLoading, setIsLoading] = useState<[boolean, string]>([false, '']);

  /**
   * Checks if the user's Unisat or Fordefi Wallet is on the same network as the app and if the address is a taproot address.
   *
   * @param userAddress - The user's address.
   *
   * @returns Throws an error if the user's wallet is not on the same network as the app or if the address is not a taproot address.
   */
  function checkUserWalletNetworkAndAddressType(userAddress: string): void {
    if (
      !ALL_SUPPORTED_BITCOIN_NETWORK_PREFIX.some(prefix => userAddress.startsWith(`${prefix}p`))
    ) {
      throw new UnisatFordefiError('User wallet is not a Taproot address');
    }
    if (!userAddress.startsWith(appConfiguration.bitcoinNetworkPreFix)) {
      throw new UnisatFordefiError(
        `User wallet is not on [${appConfiguration.bitcoinNetwork}] Network`
      );
    }
  }

  /**
   * Fetches the user's taproot address from the user's wallet.
   *
   * @param isFordefi - If the user is connecting to the Fordefi Wallet.
   *
   * @returns A promise that resolves to the user's taproot address.
   */
  async function getBitcoinAddresses(isFordefi: boolean = false): Promise<BitcoinTaprootAccount> {
    try {
      if (!window.unisat) {
        throw new UnisatFordefiError(
          isFordefi ? 'Fordefi Wallet is Not Installed' : 'Unisat Wallet is Not Installed'
        );
      } else if (isFordefi && !window?.unisat?.is_fordefi) {
        throw new UnisatFordefiError('Please disable Unisat Wallet and enable Fordefi Wallet');
      } else if (!isFordefi && window?.unisat?.is_fordefi) {
        throw new UnisatFordefiError('Please disable Fordefi Wallet and enable Unisat Wallet');
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
      throw new UnisatFordefiError(`Error getting bitcoin addresses: ${error}`);
    }
  }

  /**
   * Fetches the User's Unisat or Fordefi Wallet Information.
   *
   * @param isFordefi - If the user is connecting to the Fordefi Wallet.
   *
   * @returns A promise that resolves to set the Bitcoin Wallet Context State to Ready.
   */
  async function connectUnisatOrFordefiWallet(isFordefi: boolean = false): Promise<void> {
    try {
      setIsLoading(
        walletLoadingState(
          BitcoinWalletAction.CONNECTING,
          isFordefi ? BitcoinWalletType.Fordefi : BitcoinWalletType.Unisat
        )
      );

      const taprootAccount = await getBitcoinAddresses(isFordefi);

      const unisatDLCHandler = new UnisatFordefiDLCHandler(
        'tr',
        BITCOIN_NETWORK_MAP[appConfiguration.bitcoinNetwork],
        appConfiguration.bitcoinBlockchainURL,
        appConfiguration.bitcoinBlockchainFeeEstimateURL,
        taprootAccount.publicKey,
        taprootAccount.publicKey
      );

      setDLCHandler(unisatDLCHandler);
      setBitcoinWalletType(BitcoinWalletType.Unisat);
      setBitcoinWalletContextState(BitcoinWalletContextState.READY);
    } catch (error) {
      throw new UnisatFordefiError(
        `Error getting ${isFordefi ? BitcoinWalletType.Fordefi : BitcoinWalletType.Unisat} Wallet Information: ${error}`
      );
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  /**
   * Creates the Funding Transaction and signs it with Unisat or Fordefi Wallet.
   * @param dlcHandler The DLC Handler.
   * @param vault The Vault to interact with.
   * @param depositAmount The Bitcoin Amount to fund the Vault.
   * @param attestorGroupPublicKey The Attestor Group Public Key.
   * @param feeRateMultiplier The Fee Rate Multiplier for the Transaction.
   *
   * @returns The Signed Funding Transaction.
   */
  async function handleFundingTransaction(
    dlcHandler: UnisatFordefiDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ): Promise<Transaction> {
    try {
      setIsLoading(
        walletLoadingState(BitcoinWalletAction.CREATING_TRANSACTION, bitcoinWalletType, 'Funding')
      );

      const formattedDepositAmount = BigInt(shiftValue(depositAmount));

      const fundingPSBT = await dlcHandler.createFundingPSBT(
        vault,
        formattedDepositAmount,
        attestorGroupPublicKey,
        feeRateMultiplier
      );

      setIsLoading(
        walletLoadingState(BitcoinWalletAction.SIGNING_TRANSACTION, bitcoinWalletType, 'Funding')
      );

      const signedFundingTransaction = await dlcHandler.signPSBT(fundingPSBT, 'funding');

      return signedFundingTransaction;
    } catch (error) {
      throw new UnisatFordefiError(`Error handling Funding Transaction: ${error}`);
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  /**
   * Creates a Deposit Transaction and signs it with Unisat or Fordefi Wallet.
   * @param dlcHandler The DLC Handler.
   * @param vault The Vault to interact with.
   * @param depositAmount The Bitcoin Amount to deposit into the Vault.
   * @param attestorGroupPublicKey The Attestor Group Public Key.
   * @param feeRateMultiplier The Fee Rate Multiplier for the Transaction.
   *
   * @returns The Signed Deposit Transaction.
   */
  async function handleDepositTransaction(
    dlcHandler: UnisatFordefiDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ): Promise<Transaction> {
    try {
      setIsLoading(
        walletLoadingState(BitcoinWalletAction.CREATING_TRANSACTION, bitcoinWalletType, 'Deposit')
      );

      const formattedDepositAmount = BigInt(shiftValue(depositAmount));

      const depositPSBT = await dlcHandler.createDepositPSBT(
        vault,
        formattedDepositAmount,
        attestorGroupPublicKey,
        vault.fundingTxId,
        feeRateMultiplier
      );

      setIsLoading(
        walletLoadingState(BitcoinWalletAction.SIGNING_TRANSACTION, bitcoinWalletType, 'Deposit')
      );

      const signedDepositTransaction = await dlcHandler.signPSBT(depositPSBT, 'deposit');

      return signedDepositTransaction;
    } catch (error) {
      throw new UnisatFordefiError(`Error handling Deposit Transaction: ${error}`);
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
    dlcHandler: UnisatFordefiDLCHandler,
    vault: RawVault,
    withdrawAmount: number,
    attestorGroupPublicKey: string,
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
      throw new UnisatFordefiError(`Error handling Withdraw Transaction: ${error}`);
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  return {
    connectUnisatOrFordefiWallet,
    handleFundingTransaction,
    handleDepositTransaction,
    handleWithdrawTransaction,
    isLoading,
  };
}
