import { useContext } from 'react';

import { HStack } from '@chakra-ui/react';
import { VaultsListGroupBlankContainer } from '@components/vaults-list/components/vaults-list-group-blank-container';
import { VaultsListGroupContainer } from '@components/vaults-list/components/vaults-list-group-container';
import { VaultsList } from '@components/vaults-list/vaults-list';
import { BalanceContext } from '@providers/balance-context-provider';
import { NetworkConnectionContext } from '@providers/network-connection.provider';
import { VaultContext } from '@providers/vault-context-provider';
import { VaultState } from 'dlc-btc-lib/models';

import { MyVaultsLargeHeader } from './components/my-vaults-header/my-vaults-header';
import { MyVaultsLargeLayout } from './components/my-vaults-large.layout';
import { MyVaultsSetupInformationStack } from './components/my-vaults-setup-information-stack';

export function MyVaultsLarge(): React.JSX.Element {
  const { isConnected } = useContext(NetworkConnectionContext);
  const { dlcBTCBalance, lockedBTCBalance } = useContext(BalanceContext);

  const { readyVaults, pendingVaults, fundedVaults, closingVaults, closedVaults, allVaults } =
    useContext(VaultContext);

  return (
    <MyVaultsLargeLayout>
      <MyVaultsLargeHeader
        isConnected={isConnected}
        dlcBTCBalance={dlcBTCBalance}
        lockedBTCBalance={lockedBTCBalance}
      />
      <HStack spacing={'35px'} w={'100%'}>
        {isConnected ? (
          <VaultsList
            title={'In Process'}
            height={'475px'}
            isScrollable={isConnected && allVaults.length > 0}
          >
            <VaultsListGroupContainer
              label="Empty Vaults"
              vaults={readyVaults}
              vaultState={VaultState.READY}
            />
            <VaultsListGroupContainer
              label="Pending"
              vaults={pendingVaults}
              vaultState={VaultState.PENDING}
            />
            <VaultsListGroupContainer
              label="Unlocking BTC in Progress"
              vaults={closingVaults}
              vaultState={VaultState.PENDING}
            />
          </VaultsList>
        ) : (
          <MyVaultsSetupInformationStack />
        )}
        <VaultsList
          title={'Minted dlcBTC'}
          height={'475px'}
          isScrollable={isConnected && fundedVaults.length > 0}
        >
          {isConnected ? (
            <VaultsListGroupContainer vaults={fundedVaults} vaultState={VaultState.FUNDED} />
          ) : (
            <VaultsListGroupBlankContainer />
          )}
        </VaultsList>
        <VaultsList
          title={'Closed Vaults'}
          height={'475px'}
          isScrollable={isConnected && closedVaults.length > 0}
        >
          {isConnected ? (
            <VaultsListGroupContainer vaults={closedVaults} vaultState={VaultState.CLOSED} />
          ) : (
            <VaultsListGroupBlankContainer />
          )}
        </VaultsList>
      </HStack>
    </MyVaultsLargeLayout>
  );
}
