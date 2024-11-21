import { useContext } from 'react';
import { useSelector } from 'react-redux';

import { Text, VStack } from '@chakra-ui/react';
import { VaultsListGroupContainer } from '@components/vaults-list/components/vaults-list-group-container';
import { VaultsList } from '@components/vaults-list/vaults-list';
import { VaultContext } from '@providers/vault-context-provider';
import { RootState } from '@store/index';
import { VaultState } from 'dlc-btc-lib/models';

import { BurnTokenTransactionForm } from '../../burn-transaction-screen/burn-transaction-screen';

interface UnmintVaultSelectorProps {
  userEthereumAddressRiskLevel: string;
  fetchUserEthereumAddressRiskLevel: () => Promise<string>;
  isUserEthereumAddressRiskLevelLoading: boolean;
}

export function UnmintVaultSelector({
  userEthereumAddressRiskLevel,
  fetchUserEthereumAddressRiskLevel,
  isUserEthereumAddressRiskLevelLoading,
}: UnmintVaultSelectorProps): React.JSX.Element {
  const { fundedVaults } = useContext(VaultContext);

  const { unmintStep } = useSelector((state: RootState) => state.mintunmint);

  return (
    <>
      {unmintStep.vault ? (
        <BurnTokenTransactionForm
          isBitcoinWalletLoading={[false, '']}
          userEthereumAddressRiskLevel={userEthereumAddressRiskLevel}
          fetchUserEthereumAddressRiskLevel={fetchUserEthereumAddressRiskLevel}
          isUserEthereumAddressRiskLevelLoading={isUserEthereumAddressRiskLevelLoading}
        />
      ) : fundedVaults.length == 0 ? (
        <VStack w={'45%'}>
          <Text color={'white'}>You don't have any active vaults.</Text>
        </VStack>
      ) : (
        <VStack w={'45%'}>
          <Text color={'accent.lightBlue.01'} fontSize={'md'} fontWeight={600}>
            Select vault to withdraw Bitcoin:
          </Text>
          <VaultsList height={'625.5px'} isScrollable={!unmintStep.vault}>
            <VaultsListGroupContainer
              vaults={fundedVaults}
              vaultState={VaultState.FUNDED}
              isSelectable
              variant={'select'}
            />
          </VaultsList>
        </VStack>
      )}
    </>
  );
}
