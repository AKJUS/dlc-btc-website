import { useContext } from 'react';

import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { getRawVault } from 'dlc-btc-lib/ethereum-functions';
import { RawVault } from 'dlc-btc-lib/models';
import { getRippleVault } from 'dlc-btc-lib/ripple-functions';

import { NetworkType } from '@shared/constants/network.constants';

interface UseFetchVault {
  fetchVault: (vaultUUID: string) => Promise<RawVault>;
}

export function useFetchVault(): UseFetchVault {
  const { networkType } = useContext(NetworkConfigurationContext);

  const {
    ethereumNetworkConfiguration: { dlcManagerContract },
  } = useContext(EthereumNetworkConfigurationContext);

  const { rippleClient } = useContext(RippleNetworkConfigurationContext);

  const fetchEVMVault = async (vaultUUID: string): Promise<RawVault> => {
    return await getRawVault(dlcManagerContract, vaultUUID);
  };

  const fetchXRPLVault = async (vaultUUID: string): Promise<RawVault> => {
    return await getRippleVault(rippleClient, appConfiguration.rippleIssuerAddress, vaultUUID);
  };

  const fetchVault = async (vaultUUID: string): Promise<RawVault> => {
    try {
      switch (networkType) {
        case NetworkType.EVM:
          return fetchEVMVault(vaultUUID);
        case NetworkType.XRPL:
          return fetchXRPLVault(vaultUUID);
      }
    } catch (error) {
      throw new Error('Error getting Vault: ' + error);
    }
  };

  return {
    fetchVault,
  };
}
