import { Merchant, MerchantProofOfReserve } from '@models/merchant';
import { useQuery } from '@tanstack/react-query';
import { Decimal } from 'decimal.js';
import { AttestorChainID } from 'dlc-btc-lib/models';

import { API_HELPERS } from '@shared/constants/api.constants';

export interface UseProofOfReserveReturnType {
  proofOfReserveSum?: number;
  merchantProofOfReserves: MerchantProofOfReserve[];
  proofOfReserveByChain: ProofOfReserveResult[];
}

interface ProofOfReserveResult {
  chain: AttestorChainID;
  proofOfReserve: number;
  error?: string;
}

interface AggregatedProofOfReserveData {
  proofOfReserve: number;
  error?: string;
  chains: ProofOfReserveResult[];
}

export function useProofOfReserve(): UseProofOfReserveReturnType {
  async function fetchProofOfReserve(
    merchantAddress?: string
  ): Promise<AggregatedProofOfReserveData> {
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
      return {
        proofOfReserve: 0,
        error: 'Error fetching Proof of Reserve',
        chains: [],
      };
    }
  }

  async function fetchAllProofOfReserve(): Promise<UseProofOfReserveReturnType> {
    const proofOfReserve = await fetchProofOfReserve();

    const merchantProofOfReserves = await Promise.all(
      appConfiguration.merchants.map(async merchant => {
        const proofOfReserves = await Promise.all(
          merchant.addresses.map(async address => {
            return await fetchProofOfReserve(address);
          })
        );

        const iBTCAmount = proofOfReserves.reduce(
          (sum, proof) => new Decimal(sum).add(proof.proofOfReserve).toNumber(),
          0
        );

        return {
          merchant,
          iBTCAmount,
        };
      })
    );

    return {
      proofOfReserveSum: proofOfReserve.proofOfReserve,
      merchantProofOfReserves,
      proofOfReserveByChain: proofOfReserve.chains,
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
