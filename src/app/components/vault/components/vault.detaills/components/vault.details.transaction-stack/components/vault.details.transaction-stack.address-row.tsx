import { HStack, Text } from '@chakra-ui/react';
import { truncateAddress } from 'dlc-btc-lib/utilities';

import { VaultTransactionStackCopyButton } from './vault.details.transaction-stack.copy-button';

interface VaultTransactionRowProps {
  label: string;
  value?: string;
}

export function VaultAddressRow({
  label,
  value,
}: VaultTransactionRowProps): React.JSX.Element | false {
  if (!value) return false;

  return (
    <HStack w={'100%'} py={'7.5px'}>
      <HStack w={'65%'}>
        <Text color={'white.01'} fontSize={'xs'}>
          {label}
        </Text>
      </HStack>
      <VaultTransactionStackCopyButton value={value} />
      <HStack w={'25%'} justifyContent={'flex-end'}>
        <Text color={'white.01'} fontSize={'xs'}>
          {truncateAddress(value)}
        </Text>
      </HStack>
    </HStack>
  );
}
