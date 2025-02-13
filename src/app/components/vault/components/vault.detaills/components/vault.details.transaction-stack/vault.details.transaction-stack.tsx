import { Divider, VStack } from '@chakra-ui/react';

import { VaultAddressRow } from './components/vault.details.transaction-stack.address-row';
import { VaultTransactionRow } from './components/vault.details.transaction-stack.transaction-row';

interface VaultTransactionStackProps {
  vaultFundingTX?: string;
  vaultWithdrawDepositTX?: string;
  vaultFundingBitcoinAddress?: string;
}

export function VaultTransactionStack({
  vaultFundingTX,
  vaultWithdrawDepositTX,
  vaultFundingBitcoinAddress,
}: VaultTransactionStackProps): React.JSX.Element | false {
  if (!vaultFundingTX && !vaultWithdrawDepositTX && !vaultFundingBitcoinAddress) return false;

  return (
    <VStack w={'100%'} justifyContent={'space-between'}>
      <Divider w={'100%'} borderColor={'grey.01'} borderStyle={'dashed'} />
      <VaultTransactionRow label={'Funding TX'} value={vaultFundingTX} />
      <VaultTransactionRow label={'Withdraw/Deposit TX'} value={vaultWithdrawDepositTX} />
      <VaultAddressRow label={'Funding BTC Address'} value={vaultFundingBitcoinAddress} />
    </VStack>
  );
}
