import { BitcoinError } from '@models/error-types';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

export function useBitcoinPrice(): UseQueryResult<number, BitcoinError> {
  const fetchBitcoinPrice = async (): Promise<number> => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      );
      const data = await response.json();
      return data.bitcoin.usd;
    } catch (error) {
      throw new BitcoinError(`Error fetching Bitcoin price: ${error}`);
    }
  };

  return useQuery<number, BitcoinError>({
    queryKey: ['bitcoinPrice'],
    queryFn: fetchBitcoinPrice,
    refetchInterval: 300000,
  });
}
