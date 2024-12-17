/** @format */
import { useContext, useState } from 'react';

import Transport from '@ledgerhq/hw-transport-webusb';
import { LedgerError } from '@models/error-types';
import { LEDGER_APPS_MAP } from '@models/ledger';
import { SupportedPaymentType } from '@models/supported-payment-types';
import { BitcoinWalletAction, BitcoinWalletType } from '@models/wallet';
import { bytesToHex } from '@noble/hashes/utils';
import {
  BitcoinWalletContext,
  BitcoinWalletContextState,
} from '@providers/bitcoin-wallet-context-provider';
import { LedgerDLCHandler } from 'dlc-btc-lib';
import { getBalance, getBitcoinAddressFromExtendedPublicKey } from 'dlc-btc-lib/bitcoin-functions';
import { Network, RawVault, Transaction } from 'dlc-btc-lib/models';
import { delay, shiftValue, unshiftValue } from 'dlc-btc-lib/utilities';
import { AppClient } from 'ledger-bitcoin';
import { range } from 'ramda';

import { BITCOIN_NETWORK_MAP, walletLoadingState } from '@shared/constants/bitcoin.constants';

type TransportInstance = Awaited<ReturnType<typeof Transport.create>>;

export interface BitcoinAddressInformation {
  index: number;
  address: string;
  balance: number;
}

interface UseLedgerReturnType {
  getAllLedgerAddressesWithBalances: (
    accountIndex: number,
    startIndex: number
  ) => Promise<{
    nativeSegwitAddresses: BitcoinAddressInformation[];
    taprootAddresses: BitcoinAddressInformation[];
  }>;
  connectLedgerWallet: (
    walletAccountIndex: number,
    walletAddressIndex: number,
    paymentType: SupportedPaymentType
  ) => Promise<void>;
  handleFundingTransaction: (
    dlcHandler: LedgerDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ) => Promise<Transaction>;
  handleDepositTransaction: (
    dlcHandler: LedgerDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ) => Promise<Transaction>;
  handleWithdrawTransaction: (
    dlcHandler: LedgerDLCHandler,
    vault: RawVault,
    withdrawAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ) => Promise<string>;
  isLoading: [boolean, string];
}

export function useLedger(): UseLedgerReturnType {
  const { setBitcoinWalletContextState, setDLCHandler, bitcoinWalletType } =
    useContext(BitcoinWalletContext);

  const [ledgerApp, setLedgerApp] = useState<AppClient | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<[boolean, string]>([false, '']);

  // Reference: https://github.com/LedgerHQ/ledger-live/blob/v22.0.1/src/hw/quitApp.ts\
  /**
   * Quits the Ledger App.
   * @param transport The Ledger Transport.
   * @returns A Promise that resolves when the Ledger App is quit.
   */
  async function quitApp(transport: TransportInstance): Promise<void> {
    await transport.send(0xb0, 0xa7, 0x00, 0x00);
  }

  // Reference: https://github.com/LedgerHQ/ledger-live/blob/v22.0.1/src/hw/openApp.ts
  /**
   * Opens the Ledger App.
   * @param transport The Ledger Transport.
   * @param name The name of the Ledger App.
   * @returns A Promise that resolves when the Ledger App is opened.
   */
  async function openApp(transport: TransportInstance, name: string): Promise<void> {
    await transport.send(0xe0, 0xd8, 0x00, 0x00, Buffer.from(name, 'ascii'));
  }

  /**
   * Gets the Ledger App.
   * @param appName The name of the Ledger App.
   * @returns The Ledger App.
   */
  async function getLedgerApp(appName: string): Promise<AppClient> {
    const transport = await Transport.create();
    const ledgerApp = new AppClient(transport);
    const appAndVersion = await ledgerApp.getAppAndVersion();

    if (appAndVersion.name === appName) {
      return new AppClient(transport);
    }
    setIsLoading(walletLoadingState(BitcoinWalletAction.OPEN_APP, BitcoinWalletType.Ledger));

    if (appAndVersion.name === LEDGER_APPS_MAP.MAIN_MENU) {
      await openApp(transport, appName);
      await delay(1500);
      return new AppClient(await Transport.create());
    }

    if (appAndVersion.name !== appName) {
      await quitApp(await Transport.create());
      await delay(1500);
      await openApp(await Transport.create(), appName);
      await delay(1500);
      return new AppClient(await Transport.create());
    }

    throw new LedgerError(`Could not open Ledger ${appName} App`);
  }

  /**
   * Fetches all Ledger Addresses with Balances from the user's Ledger Wallet for the given account index and displayed addresses start index.
   *
   * @param walletAccountIndex - The index of the wallet account.
   * @param displayedAddressesStartIndex - The start index of the displayed addresses.
   *
   * @returns A promise that resolves to all native segwit and taproot addresses with balances according to the given account index and displayed addresses start index.
   */
  async function getAllLedgerAddressesWithBalances(
    walletAccountIndex: number,
    displayedAddressesStartIndex: number
  ): Promise<{
    nativeSegwitAddresses: BitcoinAddressInformation[];
    taprootAddresses: BitcoinAddressInformation[];
  }> {
    try {
      setIsLoading(walletLoadingState(BitcoinWalletAction.OPENING_APP, BitcoinWalletType.Ledger));

      const bitcoinNetwork = BITCOIN_NETWORK_MAP[appConfiguration.bitcoinNetwork];
      const ledgerApp = await getLedgerApp(appConfiguration.ledgerApp);
      setLedgerApp(ledgerApp);

      setIsLoading(
        walletLoadingState(BitcoinWalletAction.LOADING_ADDRESSES, BitcoinWalletType.Ledger)
      );

      const nativeSegwitAddresses = await getLedgerAddressesWithBalances(
        ledgerApp,
        bitcoinNetwork,
        SupportedPaymentType.NATIVE_SEGWIT,
        walletAccountIndex,
        displayedAddressesStartIndex
      );
      const taprootAddresses = await getLedgerAddressesWithBalances(
        ledgerApp,
        bitcoinNetwork,
        SupportedPaymentType.TAPROOT,
        walletAccountIndex,
        displayedAddressesStartIndex
      );

      return { nativeSegwitAddresses, taprootAddresses };
    } catch (error: any) {
      throw new LedgerError(`Error getting all Ledger Addresses with Balances: ${error}`);
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  /**
   * Fetches Ledger Addresses with Balances from the user's Ledger Wallet for the given account index and displayed addresses start index.
   *
   * @param ledgerApp - The Ledger App.
   * @param bitcoinNetwork - The Bitcoin Network.
   * @param paymentType - The Payment Type.
   * @param accountIndex - The Account Index.
   * @param startIndex - The Start Index.
   *
   * @returns The Ledger Addresses with Balances.
   */
  async function getLedgerAddressesWithBalances(
    ledgerApp: AppClient,
    bitcoinNetwork: Network,
    paymentType: SupportedPaymentType,
    accountIndex: number,
    startIndex: number
  ): Promise<BitcoinAddressInformation[]> {
    const derivationPath = `${paymentType === 'wpkh' ? '84' : '86'}'/${appConfiguration.bitcoinNetworkIndex}'/${accountIndex}'`;
    const extendedPublicKey = await ledgerApp.getExtendedPubkey(`m/${derivationPath}`);

    const addresses: BitcoinAddressInformation[] = [];
    for (const i of range(startIndex, startIndex + 5)) {
      const address = getBitcoinAddressFromExtendedPublicKey(
        extendedPublicKey,
        bitcoinNetwork,
        i,
        paymentType
      );

      addresses.push({
        index: i,
        address: address,
        balance: 0,
      });
    }

    const addressesWithBalances: BitcoinAddressInformation[] = await Promise.all(
      addresses.map(async addressInformation => {
        const balance = unshiftValue(
          await getBalance(addressInformation.address, appConfiguration.bitcoinBlockchainURL)
        );
        addressInformation.balance = balance;

        return addressInformation;
      })
    );

    return addressesWithBalances;
  }

  /**
   * Fetches the User's Ledger Wallet Information.
   *
   * @param walletAccountIndex - The Wallet Account Index.
   * @param walletAddressIndex - The Wallet Address Index.
   * @param paymentType - The Payment Type.
   *
   * @returns A promise that resolves to set the Bitcoin Wallet Context State to Ready.
   */
  async function connectLedgerWallet(
    walletAccountIndex: number,
    walletAddressIndex: number,
    paymentType: SupportedPaymentType
  ): Promise<void> {
    try {
      setIsLoading(walletLoadingState(BitcoinWalletAction.CONNECTING, BitcoinWalletType.Ledger));

      if (!ledgerApp) {
        throw new LedgerError('Ledger App not initialized');
      }
      const masterFingerprint = await ledgerApp.getMasterFingerprint();

      const ledgerDLCHandler = new LedgerDLCHandler(
        ledgerApp,
        masterFingerprint,
        walletAccountIndex,
        walletAddressIndex,
        paymentType,
        BITCOIN_NETWORK_MAP[appConfiguration.bitcoinNetwork],
        appConfiguration.bitcoinBlockchainURL,
        appConfiguration.bitcoinBlockchainFeeEstimateURL
      );

      setDLCHandler(ledgerDLCHandler);
      setBitcoinWalletContextState(BitcoinWalletContextState.READY);
    } catch (error: any) {
      throw new LedgerError(`Error getting Ledger Wallet Information: ${error}`);
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  /**
   * Creates the Funding Transaction and signs it with Ledger Wallet.
   * @param dlcHandler The DLC Handler.
   * @param vault The Vault to interact with.
   * @param depositAmount The Bitcoin Amount to fund the Vault.
   * @param attestorGroupPublicKey The Attestor Group Public Key.
   * @param feeRateMultiplier The Fee Rate Multiplier for the Transaction.
   *
   * @returns The Signed Funding Transaction.
   */
  async function handleFundingTransaction(
    dlcHandler: LedgerDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ): Promise<Transaction> {
    try {
      setIsLoading(
        walletLoadingState(BitcoinWalletAction.ACCEPT_MULTI_SIG_WALLET_POLICY, bitcoinWalletType)
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

      const fundingTransaction = await dlcHandler.signPSBT(fundingPSBT, 'funding');

      return fundingTransaction;
    } catch (error) {
      throw new LedgerError(`Error handling Funding Transaction: ${error}`);
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  /**
   * Creates a Deposit Transaction and signs it with Ledger Wallet.
   * @param dlcHandler The DLC Handler.
   * @param vault The Vault to interact with.
   * @param depositAmount The Bitcoin Amount to deposit into the Vault.
   * @param attestorGroupPublicKey The Attestor Group Public Key.
   * @param feeRateMultiplier The Fee Rate Multiplier for the Transaction.
   *
   * @returns The Signed Deposit Transaction.
   */
  async function handleDepositTransaction(
    dlcHandler: LedgerDLCHandler,
    vault: RawVault,
    depositAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ): Promise<Transaction> {
    try {
      setIsLoading(
        walletLoadingState(BitcoinWalletAction.ACCEPT_MULTI_SIG_WALLET_POLICY, bitcoinWalletType)
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
      throw new LedgerError(`Error handling Deposit Transaction: ${error}`);
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  /**
   * Creates a Withdraw Transaction and signs it with Ledger Wallet.
   * @param dlcHandler The DLC Handler.
   * @param vault The Vault to interact with.
   * @param withdrawAmount The Bitcoin Amount to withdraw from the Vault.
   * @param attestorGroupPublicKey The Attestor Group Public Key.
   * @param feeRateMultiplier The Fee Rate Multiplier.
   *
   * @returns The Signed Withdraw Transaction.
   */
  async function handleWithdrawTransaction(
    dlcHandler: LedgerDLCHandler,
    vault: RawVault,
    withdrawAmount: number,
    attestorGroupPublicKey: string,
    feeRateMultiplier: number
  ): Promise<string> {
    try {
      setIsLoading(
        walletLoadingState(BitcoinWalletAction.ACCEPT_MULTI_SIG_WALLET_POLICY, bitcoinWalletType)
      );

      const formattedWithdrawAmount = BigInt(shiftValue(withdrawAmount));

      const withdrawalPSBT = await dlcHandler.createWithdrawPSBT(
        vault,
        formattedWithdrawAmount,
        attestorGroupPublicKey,
        vault.fundingTxId,
        feeRateMultiplier
      );

      setIsLoading(
        walletLoadingState(BitcoinWalletAction.SIGNING_TRANSACTION, bitcoinWalletType, 'Withdraw')
      );

      const withdrawalTransaction = await dlcHandler.signPSBT(withdrawalPSBT, 'withdraw');

      return bytesToHex(withdrawalTransaction.toPSBT());
    } catch (error) {
      throw new LedgerError(`Error handling Withdrawal Transaction: ${error}`);
    } finally {
      setIsLoading(walletLoadingState(BitcoinWalletAction.NONE));
    }
  }

  return {
    getAllLedgerAddressesWithBalances,
    connectLedgerWallet,
    handleFundingTransaction,
    handleDepositTransaction,
    handleWithdrawTransaction,
    isLoading,
  };
}
