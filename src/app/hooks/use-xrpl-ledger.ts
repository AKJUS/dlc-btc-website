import { useContext, useState } from 'react';

import Xrp from '@ledgerhq/hw-app-xrp';
import Transport from '@ledgerhq/hw-transport-webusb';
import { LEDGER_APPS_MAP } from '@models/ledger';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { LedgerXRPHandler } from 'dlc-btc-lib';
import { LedgerError, RawVault } from 'dlc-btc-lib/models';
import { delay, shiftValue } from 'dlc-btc-lib/utilities';
import AppClient from 'ledger-bitcoin';

interface useXRPLLedgerReturnType {
  isLoading: [boolean, string];
  connectLedgerWallet: (
    derivationPath: string
  ) => Promise<{ xrpHandler: LedgerXRPHandler; userAddress: string }>;
  handleCreateCheck: (vault: RawVault, withdrawAmount: number) => Promise<any>;
  handleSetTrustLine: () => Promise<any>;
}

type TransportInstance = Awaited<ReturnType<typeof Transport.create>>;

export function useXRPLLedger(): useXRPLLedgerReturnType {
  const {
    rippleClient,
    rippleNetworkConfiguration: { rippleAttestorChainID },
  } = useContext(RippleNetworkConfigurationContext);

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
    setIsLoading([true, `Opening Ledger ${appName} App`]);
    const transport = await Transport.create();
    const ledgerApp = new AppClient(transport);
    const appAndVersion = await ledgerApp.getAppAndVersion();

    if (appAndVersion.name === appName) {
      setIsLoading([false, '']);
      return new AppClient(transport);
    }

    if (appAndVersion.name === LEDGER_APPS_MAP.MAIN_MENU) {
      setIsLoading([true, `Open ${appName} App on your Ledger Device`]);
      await openApp(transport, appName);
      await delay(1500);
      setIsLoading([false, '']);
      return new AppClient(await Transport.create());
    }

    if (appAndVersion.name !== appName) {
      await quitApp(await Transport.create());
      await delay(1500);
      setIsLoading([true, `Open ${appName} App on your Ledger Device`]);
      await openApp(await Transport.create(), appName);
      await delay(1500);
      setIsLoading([false, '']);
      return new AppClient(await Transport.create());
    }

    throw new LedgerError(`Could not open Ledger ${appName} App`);
  }

  async function connectLedgerWallet(derivationPath: string) {
    try {
      setIsLoading([true, 'Connecting To Ledger Wallet']);

      await getLedgerApp(LEDGER_APPS_MAP.XRP);
      const transport = await Transport.create();
      const xrplWallet = new Xrp(transport);
      const xrplAddress = await xrplWallet.getAddress(derivationPath);
      const xrpHandler = new LedgerXRPHandler(
        xrplWallet,
        derivationPath,
        rippleClient,
        appConfiguration.rippleIssuerAddress,
        xrplAddress.address,
        xrplAddress.publicKey
      );

      return { xrpHandler, userAddress: xrplAddress.address };
    } catch (error) {
      throw new LedgerError(`Error connecting to Ledger Wallet: ${error}`);
    } finally {
      setIsLoading([false, '']);
    }
  }

  async function handleCreateCheck(vault: RawVault, withdrawAmount: number) {
    try {
      const { xrpHandler: currentXRPHandler } = await connectLedgerWallet("44'/144'/0'/0/0");

      setIsLoading([true, 'Creating Check']);

      const formattedWithdrawAmount = BigInt(shiftValue(withdrawAmount));

      const createCheckRequest = await currentXRPHandler.createCheck(
        formattedWithdrawAmount.toString(),
        vault.uuid.slice(2)
      );

      setIsLoading([true, 'Sign Check on your Ledger Device']);

      const txHash = await currentXRPHandler.signAndSubmitCheck(createCheckRequest);

      setIsLoading([true, 'Waiting for Check to be processed']);

      return await currentXRPHandler.sendCheckTXHash(
        appConfiguration.coordinatorURL,
        txHash,
        rippleAttestorChainID
      );
    } catch (error) {
      throw new LedgerError(`Error creating Check: ${error}`);
    } finally {
      setIsLoading([false, '']);
    }
  }

  async function handleSetTrustLine() {
    try {
      const { xrpHandler: currentXRPHandler } = await connectLedgerWallet("44'/144'/0'/0/0");

      setIsLoading([true, 'Set Trust Line on your Ledger Device']);

      return await currentXRPHandler.setTrustLine();
    } catch (error) {
      throw new LedgerError(`Error setting Trust Line: ${error}`);
    } finally {
      setIsLoading([false, '']);
    }
  }

  return {
    isLoading,
    connectLedgerWallet,
    handleCreateCheck,
    handleSetTrustLine,
  };
}
