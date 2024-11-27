import { Merchant, MerchantProofOfReserve } from '@models/merchant';
import { useQuery } from '@tanstack/react-query';
import { unshiftValue } from 'dlc-btc-lib/utilities';

import { PROOF_OF_RESERVE_API_URL } from '@shared/constants/api.constants';

interface UseProofOfReserveReturnType {
  proofOfReserve: [number | undefined, MerchantProofOfReserve[]] | undefined;
}

export function useProofOfReserve(): UseProofOfReserveReturnType {
  const { data: proofOfReserve } = useQuery({
    queryKey: ['proofOfReserve'],
    queryFn: fetchAllProofOfReserve,
    refetchInterval: 60000,
  });

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

  async function fetchAllProofOfReserve(): Promise<[number | undefined, MerchantProofOfReserve[]]> {
    const proofOfReserve = await fetchProofOfReserve();

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

    return [unshiftValue(proofOfReserve), merchantProofOfReserves];
  }

  return {
    proofOfReserve: proofOfReserve ?? [
      undefined,
      appConfiguration.merchants.map((merchant: Merchant) => {
        return {
          merchant,
          iBTCAmount: undefined,
        };
      }),
    ],
  };
}
