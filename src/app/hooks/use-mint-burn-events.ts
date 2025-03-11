import { DetailedEvent } from '@models/ethereum-models';
import { Merchant } from '@models/merchant';
import { useQuery } from '@tanstack/react-query';
import { AttestorChainID } from 'dlc-btc-lib/models';

import { API_HELPERS } from '@shared/constants/api.constants';

interface GetEventsResult {
  chain: AttestorChainID;
  events: DetailedEvent[];
  error?: string;
}

interface AggregatedEventsResultData {
  events: DetailedEvent[];
  chains: GetEventsResult[];
  error?: string;
}

interface UseMintBurnEventsReturnType {
  allMintBurnEvents: DetailedEvent[] | undefined;
  merchantMintBurnEvents: { name: string; mintBurnEvents: DetailedEvent[] }[] | undefined;
}

export function useMintBurnEvents(): UseMintBurnEventsReturnType {
  async function fetchMintBurnEvents(ethereumAddress: string): Promise<AggregatedEventsResultData> {
    try {
      const apiURL = API_HELPERS.getMintBurnEventsURL({ address: ethereumAddress });
      const response = await fetch(apiURL);

      if (!response.ok) {
        throw new Error(`Error fetching mint burn events`);
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error fetching mint burn events`, error);
      return {
        events: [],
        chains: [],
        error: `Error fetching mint burn events`,
      };
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

          const mintBurnEvents = allMerchantMinBurnEvents.map(event => event.events).flat();

          return {
            name: merchant.name,
            mintBurnEvents,
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
