import { DetailedEvent } from '@models/ethereum-models';
import { Merchant } from '@models/merchant';
import { useQuery } from '@tanstack/react-query';

import { MINT_BURN_EVENTS_API_URL } from '@shared/constants/api.constants';

interface UseMintBurnEventsReturnType {
  allMintBurnEvents: DetailedEvent[] | undefined;
  merchantMintBurnEvents: { name: string; mintBurnEvents: DetailedEvent[] }[] | undefined;
}

export function useMintBurnEvents(): UseMintBurnEventsReturnType {
  async function fetchMintBurnEvents(ethereumAddress: string): Promise<DetailedEvent[]> {
    try {
      const response = await fetch(
        `${MINT_BURN_EVENTS_API_URL}/${appConfiguration.appEnvironment}/${ethereumAddress}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching mint burn events`);
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error fetching mint burn events`, error);
      return [];
    }
  }

  async function fetchAllMintBurnEvents(): Promise<UseMintBurnEventsReturnType | undefined> {
    try {
      const mintBurnEvents = await Promise.all(
        appConfiguration.merchants.map(async (merchant: Merchant) => {
          const allMerchantMinBurnEvents = await Promise.all(
            merchant.addresses.map(async address => {
              return await fetchMintBurnEvents(address);
            })
          );

          const sortedAllMerchantMinBurnEvents = allMerchantMinBurnEvents
            .flat()
            .sort((a: DetailedEvent, b: DetailedEvent) => {
              return b.timestamp - a.timestamp;
            });

          return {
            name: merchant.name,
            mintBurnEvents: sortedAllMerchantMinBurnEvents,
          };
        })
      );

      const allMintBurnEvents = mintBurnEvents
        .map(merchant => merchant.mintBurnEvents)
        .flat()
        .sort((a, b) => b.timestamp - a.timestamp);

      return {
        allMintBurnEvents,
        merchantMintBurnEvents: mintBurnEvents,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error fetching mint burn events`, error);
      return undefined;
    }
  }

  const { data: mintBurnEvents } = useQuery({
    queryKey: ['mintBurnEvents'],
    queryFn: fetchAllMintBurnEvents,
  });

  return {
    allMintBurnEvents: mintBurnEvents?.allMintBurnEvents,
    merchantMintBurnEvents: mintBurnEvents?.merchantMintBurnEvents,
  };
}
