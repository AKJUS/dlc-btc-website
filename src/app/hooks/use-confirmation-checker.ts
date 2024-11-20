import { useContext } from 'react';

import { Vault } from '@models/vault';
import { VaultContext } from '@providers/vault-context-provider';
import { useQuery } from '@tanstack/react-query';

import { useBlockchainHeightQuery } from './use-blockchain-height-query';

export function useConfirmationChecker(): [string, number][] {
  const blockHeight = useBlockchainHeightQuery();
  const { pendingVaults } = useContext(VaultContext);

  async function fetchBitcoinTransactionBlockHeight(vault: Vault): Promise<number> {
    try {
      const bitcoinExplorerTXURL = `${appConfiguration.bitcoinBlockchainURL}/tx/${vault?.withdrawDepositTX}`;

      const bitcoinTransactionResponse = await fetch(bitcoinExplorerTXURL);
      const bitcoinTransaction = await bitcoinTransactionResponse.json();
      const bitcoinTransactionBlockHeight: number = bitcoinTransaction.status.block_height;

      if (!bitcoinTransactionBlockHeight)
        throw new Error('Could not fetch Bitcoin Transaction Block Height');

      return bitcoinTransactionBlockHeight;
    } catch (error) {
      throw new Error('Error fetching Bitcoin Transaction Block Height');
    }
  }

  async function fetchBitcoinTransactionConfirmations(
    vault: Vault,
    blockHeight: number
  ): Promise<number> {
    try {
      const bitcoinTransactionBlockHeight = await fetchBitcoinTransactionBlockHeight(vault);

      const difference = blockHeight - bitcoinTransactionBlockHeight;
      return Math.max(difference, 0);
    } catch (error) {
      return 0;
    }
  }

  async function fetchAllBitcoinTransactionConfirmations(): Promise<[string, number][]> {
    if (!blockHeight) throw new Error('Block Height is not available');
    return await Promise.all(
      pendingVaults.map(async vault => {
        const confirmations = await fetchBitcoinTransactionConfirmations(vault, blockHeight + 1);
        return [vault.uuid, confirmations] as [string, number];
      })
    );
  }

  const { data: bitcoinTransactionConfirmations } = useQuery({
    queryKey: ['transactionDetails'],
    initialData: [],
    queryFn: () => fetchAllBitcoinTransactionConfirmations(),
    enabled: pendingVaults.length > 0,
    refetchInterval: 10000,
  });

  return bitcoinTransactionConfirmations;
}
