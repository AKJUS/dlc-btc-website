import { useContext } from 'react';

import { ChainDataContext } from '@providers/remote-configuration.provider';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  fetchBitcoinTransaction,
  getVaultOutputValueFromTransaction,
  getVaultPayment,
} from 'dlc-btc-lib/bitcoin-functions';
import { unshiftValue } from 'dlc-btc-lib/utilities';

import { BITCOIN_NETWORK_MAP } from '@shared/constants/bitcoin.constants';

interface UseVaultFundingAddressProps {
  vaultUUID: string;
  derivedUserPublicKey: string;
  bitcoinTransactionID: string;
}

export function useVaultOutputValue({
  vaultUUID,
  derivedUserPublicKey,
  bitcoinTransactionID,
}: UseVaultFundingAddressProps): UseQueryResult<number, Error> {
  const { bitcoinNetwork, bitcoinBlockchainURL } = appConfiguration;

  const { extendedAttestorGroupPublicKey } = useContext(ChainDataContext);

  const getVaultOutputValue = async (): Promise<number> => {
    if (!extendedAttestorGroupPublicKey)
      throw new Error('Extended Attestor Group Public Key not available');

    try {
      const vaultPayment = getVaultPayment(
        vaultUUID,
        derivedUserPublicKey,
        extendedAttestorGroupPublicKey,
        BITCOIN_NETWORK_MAP[bitcoinNetwork]
      );

      return unshiftValue(
        getVaultOutputValueFromTransaction(
          vaultPayment,
          await fetchBitcoinTransaction(bitcoinTransactionID, bitcoinBlockchainURL)
        )
      );
    } catch (e: any) {
      throw new Error('Error getting Vault Output Value: ' + e);
    }
  };

  return useQuery<number, Error>({
    queryKey: ['vaultOutputValue', bitcoinTransactionID],
    queryFn: getVaultOutputValue,
    enabled: !!bitcoinTransactionID,
  });
}
