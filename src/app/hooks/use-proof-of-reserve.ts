import { useContext } from 'react';

import { Merchant, MerchantProofOfReserve } from '@models/merchant';
import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { useQuery } from '@tanstack/react-query';
import { AttestorChainID } from 'dlc-btc-lib/models';
import { unshiftValue } from 'dlc-btc-lib/utilities';

import { API_HELPERS } from '@shared/constants/api.constants';
import { EVMAttestorChainIDMap } from '@shared/constants/ethereum.constants';
import { XRPLAttestorChainIDMap } from '@shared/constants/ripple.constants';

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
      const apiURL = API_HELPERS.getProofOfReserveURL({ address: merchantAddress });

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
    chainName: AttestorChainID
  ): Promise<ProofOfReserveByChainReturnType> {
    try {
      const apiUrl = API_HELPERS.getProofOfReserveURL({ chain: chainName });

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Error fetching Proof of Reserve by Chain');
      }

      const data = await response.json();
      return {
        chain: chainName,
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

    const evmAttestorChainIDs = enabledEthereumNetworks.map(
      network => EVMAttestorChainIDMap[network.id]
    );
    const xrpAttestorChainIDs = enabledRippleNetworks.map(
      network => XRPLAttestorChainIDMap[network.id]
    );

    const evmPorByChains = await Promise.allSettled(
      evmAttestorChainIDs.map(async chain => fetchProofOfReserveByChain(chain))
    );
    const xrplPorByChains = await Promise.allSettled(
      xrpAttestorChainIDs.map(async chain => fetchProofOfReserveByChain(chain))
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
