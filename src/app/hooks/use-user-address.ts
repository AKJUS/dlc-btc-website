import { useContext } from 'react';

import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { XRPWalletContext } from '@providers/xrp-wallet-context-provider';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { isNil } from 'ramda';
import { useAccount } from 'wagmi';

import { NetworkType } from '@shared/constants/network.constants';

export function useUserAddress(): UseQueryResult<string, Error> {
  const { networkType } = useContext(NetworkConfigurationContext);

  const { address: ethereumUserAddress } = useAccount();
  const { userAddress: rippleUserAddress } = useContext(XRPWalletContext);

  const fetchUserAddress = async (): Promise<string> => {
    try {
      switch (networkType) {
        case NetworkType.EVM:
          if (isNil(ethereumUserAddress)) throw new Error('EVM user address is not set');
          return ethereumUserAddress;
        case NetworkType.XRPL:
          if (isNil(rippleUserAddress)) throw new Error('XRPL user address is not set');
          return rippleUserAddress;
      }
    } catch (error) {
      throw new Error('Error getting User Address: ' + error);
    }
  };

  return useQuery<string, Error>({
    queryKey: ['userAddress', networkType],
    queryFn: fetchUserAddress,
    enabled: !!networkType,
  });
}
