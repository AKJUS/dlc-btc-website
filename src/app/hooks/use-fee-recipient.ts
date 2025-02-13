import { useContext } from 'react';

import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { getAttestorConfigurationForChain } from 'dlc-btc-lib/attestor-request-functions';
import { getFeeRecipient } from 'dlc-btc-lib/ethereum-functions';

import { NetworkType } from '@shared/constants/network.constants';

import { useAttestorChainID } from './use-attestor-chain-id';

export function useFeeRecipient(): UseQueryResult<string, Error> {
  const { networkType } = useContext(NetworkConfigurationContext);

  const {
    ethereumNetworkConfiguration: { dlcManagerContract },
  } = useContext(EthereumNetworkConfigurationContext);

  const attestorChainID = useAttestorChainID();

  const fetchEVMFeeRecipient = async (): Promise<string> => {
    return await getFeeRecipient(dlcManagerContract);
  };

  const fetchXRPLFeeRecipient = async (): Promise<string> => {
    return (
      await getAttestorConfigurationForChain(
        appConfiguration.attestorSharedConfigurationURL,
        'ripple',
        attestorChainID
      )
    )?.btcFeeRecipient;
  };

  const fetchFeeRecipient = async (): Promise<string> => {
    try {
      switch (networkType) {
        case NetworkType.EVM:
          return fetchEVMFeeRecipient();
        case NetworkType.XRPL:
          return fetchXRPLFeeRecipient();
      }
    } catch (error) {
      throw new Error('Error getting Fee Recipient: ' + error);
    }
  };

  return useQuery<string, Error>({
    queryKey: ['feeRecipient', networkType],
    queryFn: fetchFeeRecipient,
    enabled: !!networkType,
  });
}
