import { useContext } from 'react';

import { BitcoinError } from '@models/error-types';
import { XRPWalletType } from '@models/wallet';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { XRPWalletContext } from '@providers/xrp-wallet-context-provider';
import { GemXRPHandler } from 'dlc-btc-lib';
import { getRippleVault } from 'dlc-btc-lib/ripple-functions';

import { useGemWallet } from './use-xrpl-gem';
import { useXRPLLedger } from './use-xrpl-ledger';

interface UseXRPWalletReturnType {
  handleCreateCheck: (vaultUUID: string, withdrawAmount: number) => Promise<void>;
  handleSetTrustLine: () => Promise<void>;
  isLoading: [boolean, string];
}

export function useXRPWallet(): UseXRPWalletReturnType {
  const { rippleClient } = useContext(RippleNetworkConfigurationContext);
  const { xrpWalletType, xrpHandler } = useContext(XRPWalletContext);

  const {
    handleCreateCheck: handleCreateCheckWithLedger,
    handleSetTrustLine: handleSetTrustLineWithLedger,
    isLoading: isLedgerLoading,
  } = useXRPLLedger();

  const {
    handleCreateCheck: handleCreateCheckWithGem,
    handleSetTrustLine: handleSetTrustLineWithGem,
    isLoading: isGemLoading,
  } = useGemWallet();

  async function handleCreateCheck(vaultUUID: string, withdrawAmount: number): Promise<void> {
    try {
      if (!xrpHandler) throw new Error('XRP Handler is not setup');

      const vault = await getRippleVault(
        rippleClient,
        appConfiguration.rippleIssuerAddress,
        vaultUUID
      );

      switch (xrpWalletType) {
        case 'Ledger':
          await handleCreateCheckWithLedger(vault, withdrawAmount);
          break;
        case 'Gem':
          await handleCreateCheckWithGem(xrpHandler as GemXRPHandler, vault, withdrawAmount);
          break;
        default:
          throw new Error('Invalid XRP Wallet Type');
      }
    } catch (error) {
      throw new BitcoinError(`Error signing Funding Transaction: ${error}`);
    }
  }

  async function handleSetTrustLine(): Promise<void> {
    try {
      if (!xrpHandler) throw new Error('XRP Handler is not setup');

      switch (xrpWalletType) {
        case 'Ledger':
          await handleSetTrustLineWithLedger();
          break;
        case 'Gem':
          await handleSetTrustLineWithGem(xrpHandler as GemXRPHandler);
          break;
        default:
          throw new Error('Invalid XRP Wallet Type');
      }
    } catch (error) {
      throw new BitcoinError(`Error signing Withdraw Transaction: ${error}`);
    }
  }

  const loadingStates = {
    [XRPWalletType.Ledger]: isLedgerLoading,
    [XRPWalletType.Gem]: isGemLoading,
  };

  return {
    handleCreateCheck,
    handleSetTrustLine,
    isLoading: xrpWalletType ? loadingStates[xrpWalletType] : [false, ''],
  };
}
