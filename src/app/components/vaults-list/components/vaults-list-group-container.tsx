import { useContext } from 'react';

import { Button, HStack, Image, Spinner, Text, VStack } from '@chakra-ui/react';
import { Vault } from '@components/vault/vault';
import { useAddToken } from '@hooks/use-add-token';
import { iBTC } from '@models/token';
import { Vault as VaultModel } from '@models/vault';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { VaultState } from 'dlc-btc-lib/models';

import { NetworkType } from '@shared/constants/network.constants';

interface VaultsListGroupContainerProps {
  label?: string;
  vaultState?: VaultState;
  variant?: 'select';
  vaults: VaultModel[];
  selectedVaultUUID?: string;
  isSelectable?: boolean;
  handleSelect?: (uuid: string) => void;
}

export function VaultsListGroupContainer({
  label,
  vaultState,
  variant,
  vaults,
}: VaultsListGroupContainerProps): React.JSX.Element | boolean {
  const addToken = useAddToken();
  const { networkType } = useContext(NetworkConfigurationContext);

  if (vaults.length === 0) return false;

  return (
    <VStack pt={'15px'} alignItems={'start'} w={'100%'} spacing={'15px'}>
      {label && (
        <HStack pt={'15px'} justifyContent={'space-between'} w={'100%'}>
          <HStack>
            {['Pending'].includes(label) && <Spinner color={'accent.lightBlue.01'} size={'md'} />}
            <Text color={'white'}>{label}</Text>
          </HStack>
          {vaultState === VaultState.FUNDED && networkType === NetworkType.EVM && (
            <Button
              variant={'ghost'}
              size={'xs'}
              _hover={{ backgroundColor: 'accent.lightBlue.01' }}
              onClick={async () => await addToken()}
            >
              <HStack>
                <Image src={iBTC.logo} alt={iBTC.logoAlt} boxSize={'15px'} />
                <Text fontSize={'2xs'} color={'white.01'}>
                  {' '}
                  Add Token to Wallet
                </Text>
              </HStack>
            </Button>
          )}
        </HStack>
      )}
      {vaults.map((vault, index) => (
        <Vault key={index} vault={vault} variant={variant} />
      ))}
    </VStack>
  );
}
