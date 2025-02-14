import { useContext } from 'react';

import { Merchant, MerchantProofOfReserve } from '@models/merchant';
import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { useQuery } from '@tanstack/react-query';
import { unshiftValue } from 'dlc-btc-lib/utilities';
import { pluck } from 'ramda';

import { PROOF_OF_RESERVE_API_URL } from '@shared/constants/api.constants';
import { NetworkType } from '@shared/constants/network.constants';

export interface UseProofOfReserveReturnType {
  proofOfReserveSum?: number;
  merchantProofOfReserves: MerchantProofOfReserve[];
  proofOfReserveByChain: ProofOfReserveByChainReturnType[];
}

interface ProofOfReserveByChainReturnType {
  chain: string;
  value: number;
}

export function useProofOfReserve(): UseProofOfReserveReturnType {
  async function fetchProofOfReserve(merchantAddress?: string): Promise<number> {
    try {
      const apiURL = merchantAddress
        ? `${PROOF_OF_RESERVE_API_URL}/${appConfiguration.appEnvironment}?address=${merchantAddress}`
        : `${PROOF_OF_RESERVE_API_URL}/${appConfiguration.appEnvironment}`;

      const response = await fetch(apiURL);

      if (!response.ok) {
        throw new Error('Error fetching Proof of Reserve');
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching Proof of Reserve', error);
      return 0;
    }
  }

  async function fetchProofOfReserveByChain(
    chainName: string,
    networkType: NetworkType
  ): Promise<ProofOfReserveByChainReturnType> {
    const formatChainParam = (chain: string, network: NetworkType): string => {
      if (network === NetworkType.XRPL) {
        return `${network.toLowerCase()}-${chain.toLowerCase()}`;
      }
      return chain ? chain.toLowerCase() : '';
    };

    const buildApiUrl = (chainParam: string): string => {
      const baseUrl = `${PROOF_OF_RESERVE_API_URL}/${appConfiguration.appEnvironment}`;
      return `${baseUrl}?chain=${chainParam}`;
    };

    try {
      const chainParam = formatChainParam(chainName, networkType);
      const apiUrl = buildApiUrl(chainParam);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Error fetching Proof of Reserve by Chain');
      }

      const data = await response.json();
      return {
        chain: `${networkType}-${chainName}`,
        value: data,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching Proof of Reserve by Chain', error);
      return {
        chain: chainName,
        value: 0,
      };
    }
  }

  const {
    ethereumNetworkConfiguration: { enabledEthereumNetworks },
  } = useContext(EthereumNetworkConfigurationContext);
  const { enabledRippleNetworks } = useContext(RippleNetworkConfigurationContext);

  async function fetchAllProofOfReserve(): Promise<UseProofOfReserveReturnType> {
    const proofOfReserve = await fetchProofOfReserve();

    const ethereumChainNames = pluck('name', enabledEthereumNetworks);
    const rippleChainNames = pluck('name', enabledRippleNetworks);

    const evmPorByChains = await Promise.allSettled(
      ethereumChainNames.map(async chain => fetchProofOfReserveByChain(chain, NetworkType.EVM))
    );
    const xrplPorByChains = await Promise.allSettled(
      rippleChainNames.map(async chain => fetchProofOfReserveByChain(chain, NetworkType.XRPL))
    );

    const fulfilledPorByChains = [...evmPorByChains, ...xrplPorByChains]
      .filter(por => por.status === 'fulfilled')
      .map(por => por.value);

    const promises = appConfiguration.merchants.map(async (merchant: Merchant) => {
      const proofOfReserve = (
        await Promise.all(
          merchant.addresses.map(async address => {
            return await fetchProofOfReserve(address);
          })
        )
      ).reduce(
        (totalProofOfReserve, addressProofOfReserve) => totalProofOfReserve + addressProofOfReserve,
        0
      );
      return {
        merchant,
        iBTCAmount: unshiftValue(proofOfReserve),
      };
    });

    const merchantProofOfReserves = await Promise.all(promises);

    return {
      proofOfReserveSum: unshiftValue(proofOfReserve),
      merchantProofOfReserves,
      proofOfReserveByChain: fulfilledPorByChains,
    };
  }

  return (
    useQuery({
      queryKey: ['proofOfReserve'],
      queryFn: fetchAllProofOfReserve,
      refetchInterval: 60000,
    }).data ?? {
      proofOfReserveSum: undefined,
      merchantProofOfReserves: appConfiguration.merchants.map((merchant: Merchant) => {
        return { merchant, iBTCAmount: undefined };
      }),
      proofOfReserveByChain: [],
    }
  );
}
