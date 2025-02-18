import { useContext } from 'react';

import { getExtendedAttestorGroupPublicKey } from '@functions/netlify-fetch.functions';
import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { getAttestorGroupPublicKey } from 'dlc-btc-lib/ethereum-functions';

import { NetworkType } from '@shared/constants/network.constants';

export function useExtendedAttestorGroupPublicKey(): UseQueryResult<string, Error> {
  const { networkType } = useContext(NetworkConfigurationContext);

  const { coordinatorURL } = appConfiguration;

  const {
    ethereumNetworkConfiguration: { dlcManagerContract },
  } = useContext(EthereumNetworkConfigurationContext);

  const fetchEVMExtendedAttestorGroupPublicKey = async (): Promise<string> => {
    return await getAttestorGroupPublicKey(dlcManagerContract);
  };

  const fetchXRPLExtendedAttestorGroupPublicKey = async (): Promise<string> => {
    return await getExtendedAttestorGroupPublicKey(coordinatorURL);
  };

  const fetchExtendedAttestorGroupPublicKey = async (): Promise<string> => {
    if (appConfiguration.appEnvironment === 'localhost') {
      return appConfiguration.localAttestorExtendedGroupPublicKey!;
    }

    try {
      switch (networkType) {
        case NetworkType.EVM:
          return fetchEVMExtendedAttestorGroupPublicKey();
        case NetworkType.XRPL:
          return fetchXRPLExtendedAttestorGroupPublicKey();
      }
    } catch (error) {
      throw new Error('Error getting Extended Attestor Group Public Key: ' + error);
    }
  };

  return useQuery<string, Error>({
    queryKey: ['extendedAttestorGroupPublicKey', networkType],
    queryFn: fetchExtendedAttestorGroupPublicKey,
    enabled: !!networkType,
  });
}
