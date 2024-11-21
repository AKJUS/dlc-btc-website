import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Skeleton } from '@chakra-ui/react';
import { VaultsList } from '@components/vaults-list/vaults-list';
import { VaultContext } from '@providers/vault-context-provider';
import { VaultState } from 'dlc-btc-lib/models';

import { VaultsListGroupContainer } from '../vaults-list/components/vaults-list-group-container';
import { MyVaultsSmallLayout } from './components/my-vaults-small.layout';

export function MyVaultsSmall(): React.JSX.Element {
  const navigate = useNavigate();

  const { readyVaults, pendingVaults, fundedVaults, closingVaults, closedVaults, allVaults } =
    useContext(VaultContext);

  return (
    <MyVaultsSmallLayout>
      <VaultsList title={'My Vaults'} height={'825'} isScrollable={allVaults.length > 0}>
        <Skeleton isLoaded={true} w={'100%'}>
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
          <VaultsListGroupContainer
            label="Empty Vaults"
            vaults={readyVaults}
            vaultState={VaultState.READY}
          />
          <VaultsListGroupContainer
            label="Minted dlcBTC"
            vaults={fundedVaults}
            vaultState={VaultState.FUNDED}
          />
          <VaultsListGroupContainer
            label="Closed Vaults"
            vaults={closedVaults}
            vaultState={VaultState.CLOSED}
          />
        </Skeleton>
      </VaultsList>
      <Button variant={'navigate'} onClick={() => navigate('/my-vaults')}>
        Show All
      </Button>
    </MyVaultsSmallLayout>
  );
}
