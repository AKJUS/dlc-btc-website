import { useContext } from 'react';

import { ChainDataContext } from '@providers/remote-configuration.provider';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  fetchBitcoinTransaction,
  getVaultFundingBitcoinAddress,
  getVaultPayment,
} from 'dlc-btc-lib/bitcoin-functions';

import { BITCOIN_NETWORK_MAP } from '@shared/constants/bitcoin.constants';

interface UseVaultFundingAddressProps {
  vaultUUID: string;
  derivedUserPublicKey: string;
  bitcoinTransactionID: string;
}

export function useVaultFundingAddress({
  vaultUUID,
  derivedUserPublicKey,
  bitcoinTransactionID,
}: UseVaultFundingAddressProps): UseQueryResult<string, Error> {
  const { bitcoinNetwork, bitcoinBlockchainURL } = appConfiguration;

  const { extendedAttestorGroupPublicKey, feeRecipient } = useContext(ChainDataContext);

  const getFundingBitcoinAddress = async (): Promise<string> => {
    if (!extendedAttestorGroupPublicKey)
      throw new Error('Extended Attestor Group Public Key not available');
    if (!feeRecipient) throw new Error('Fee Recipient not available');

    try {
      const vaultPayment = getVaultPayment(
        vaultUUID,
        derivedUserPublicKey,
        extendedAttestorGroupPublicKey,
        BITCOIN_NETWORK_MAP[bitcoinNetwork]
      );

      return getVaultFundingBitcoinAddress(
        vaultPayment,
        await fetchBitcoinTransaction(bitcoinTransactionID, bitcoinBlockchainURL),
        feeRecipient
      );
    } catch (error) {
      throw new Error('Error getting Funding Bitcoin Address: ' + error);
    }
  };

  return useQuery<string, Error>({
    queryKey: ['fundingBitcoinAddress', bitcoinTransactionID],
    queryFn: getFundingBitcoinAddress,
    enabled: !!bitcoinTransactionID,
  });
}
