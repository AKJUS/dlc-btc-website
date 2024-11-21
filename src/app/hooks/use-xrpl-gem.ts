import { useContext, useState } from 'react';

import { getAddress, isInstalled } from '@gemwallet/api';
import { GemError } from '@models/error-types';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { GemXRPHandler } from 'dlc-btc-lib';
import { RawVault } from 'dlc-btc-lib/models';
import { shiftValue } from 'dlc-btc-lib/utilities';

interface useXRPLGemReturnType {
  isLoading: [boolean, string];
  connectGemWallet: () => Promise<{ xrpHandler: GemXRPHandler; userAddress: string }>;
  handleCreateCheck: (
    xrpHandler: GemXRPHandler,
    vault: RawVault,
    withdrawAmount: number
  ) => Promise<any>;
  handleSetTrustLine: (xrpHandler: GemXRPHandler) => Promise<any>;
}

export function useGemWallet(): useXRPLGemReturnType {
  const {
    rippleClient,
    rippleNetworkConfiguration: { rippleAttestorChainID },
  } = useContext(RippleNetworkConfigurationContext);

  const [isLoading, setIsLoading] = useState<[boolean, string]>([false, '']);

  async function connectGemWallet() {
    try {
      setIsLoading([true, 'Connecting To Gem Wallet']);

      const isGemWalletInstalled = await isInstalled();
      if (!isGemWalletInstalled.result.isInstalled) {
        throw new GemError('Gem Wallet is not Installed');
      }

      const getAddressResponse = await getAddress();

      if (!getAddressResponse.result) {
        throw new GemError('No User Address Found');
      }

      const xrpHandler = new GemXRPHandler(
        rippleClient,
        appConfiguration.rippleIssuerAddress,
        getAddressResponse.result.address
      );

      return { xrpHandler, userAddress: getAddressResponse.result.address };
    } catch (error) {
      throw new GemError(`Error connecting to Gem Wallet: ${error}`);
    } finally {
      setIsLoading([false, '']);
    }
  }

  async function handleCreateCheck(
    xrpHandler: GemXRPHandler,
    vault: RawVault,
    withdrawAmount: number
  ) {
    try {
      setIsLoading([true, 'Creating Check']);

      const formattedWithdrawAmount = BigInt(shiftValue(withdrawAmount));

      const createCheckRequest = await xrpHandler.createCheck(
        formattedWithdrawAmount.toString(),
        vault.uuid.slice(2)
      );

      setIsLoading([true, 'Sign Check in your Gem Wallet']);

      const txHash = await xrpHandler.signAndSubmitCheck(createCheckRequest);

      setIsLoading([true, 'Waiting for Check to be processed']);

      return await xrpHandler.sendCheckTXHash(
        appConfiguration.coordinatorURL,
        txHash,
        rippleAttestorChainID
      );
    } catch (error) {
      throw new GemError(`Error creating Check: ${error}`);
    } finally {
      setIsLoading([false, '']);
    }
  }

  async function handleSetTrustLine(xrpHandler: GemXRPHandler) {
    try {
      setIsLoading([true, 'Set Trust Line in your Gem Wallet']);

      return await xrpHandler.setTrustLine();
    } catch (error) {
      throw new GemError(`Error setting Trust Line: ${error}`);
    } finally {
      setIsLoading([false, '']);
    }
  }

  return {
    isLoading,
    connectGemWallet,
    handleCreateCheck,
    handleSetTrustLine,
  };
}
