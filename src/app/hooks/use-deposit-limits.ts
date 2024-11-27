import { useContext } from 'react';

import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { useQuery } from '@tanstack/react-query';
import { unshiftValue } from 'dlc-btc-lib/utilities';
import { BigNumber } from 'ethers';

import { NetworkType } from '@shared/constants/network.constants';

interface UseDepositLimitsReturnType {
  depositLimit: { minimumDeposit: number; maximumDeposit: number } | undefined;
}

export function useDepositLimits(): UseDepositLimitsReturnType {
  const { networkType } = useContext(NetworkConfigurationContext);
  const { ethereumNetworkConfiguration } = useContext(EthereumNetworkConfigurationContext);

  async function fetchEVMDepositLimit(): Promise<
    { minimumDeposit: number; maximumDeposit: number } | undefined
  > {
    try {
      const minimumDeposit: BigNumber =
        await ethereumNetworkConfiguration.dlcManagerContract.minimumDeposit();
      const maximumDeposit: BigNumber =
        await ethereumNetworkConfiguration.dlcManagerContract.maximumDeposit();

      return {
        minimumDeposit: unshiftValue(minimumDeposit.toNumber()),
        maximumDeposit: unshiftValue(maximumDeposit.toNumber()),
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error fetching deposit limits`, error);
      return undefined;
    }
  }

  async function fetchXRPLDepositLimit(): Promise<
    { minimumDeposit: number; maximumDeposit: number } | undefined
  > {
    try {
      return {
        minimumDeposit: 0.01,
        maximumDeposit: 5,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error fetching deposit limits`, error);
      return undefined;
    }
  }

  const { data: evmDepositLimit } = useQuery({
    queryKey: ['evmDepositLimit', ethereumNetworkConfiguration.iBTCContract.address],
    queryFn: fetchEVMDepositLimit,
    enabled: !!ethereumNetworkConfiguration,
  });

  const { data: xrplDepositLimit } = useQuery({
    queryKey: ['xrplDepositLimit'],
    queryFn: fetchXRPLDepositLimit,
    enabled: networkType === NetworkType.XRPL,
  });

  return {
    depositLimit: networkType === NetworkType.EVM ? evmDepositLimit : xrplDepositLimit,
  };
}
