import { HStack, VStack } from '@chakra-ui/react';
import { VaultState } from 'dlc-btc-lib/models';

import { VaultExpandedInformationButton } from './components/vault.details.button-group.button';

interface VaultExpandedInformationButtonGroupProps {
  variant?: 'select' | 'selected';
  vaultState: VaultState;
  vaultTotalLockedValue: number;
  vaultTotalMintedValue: number;
  handleDepositClick: () => void;
  handleWithdrawClick: () => void;
  handleResumeClick: () => void;
}

export function VaultExpandedInformationButtonGroup({
  variant,
  vaultState,
  vaultTotalLockedValue,
  vaultTotalMintedValue,
  handleDepositClick,
  handleWithdrawClick,
  handleResumeClick,
}: VaultExpandedInformationButtonGroupProps): React.JSX.Element | false {
  if (variant === 'selected') return false;

  if (vaultState === VaultState.PENDING)
    return (
      <HStack w={'100%'} justifyContent={'space-between'}>
        <VaultExpandedInformationButton label={'Resume'} onClick={handleResumeClick} />
      </HStack>
    );

  const isWithdrawButtonDisabled = vaultState === VaultState.READY || vaultTotalLockedValue === 0;
  const isDepositButtonDisabled = vaultTotalLockedValue !== vaultTotalMintedValue;

  return (
    <VStack w={'100%'}>
      <HStack w={'100%'} justifyContent={'space-between'} pt={'10px'}>
        <VaultExpandedInformationButton
          label={'Mint iBTC'}
          onClick={handleDepositClick}
          isDisabled={isDepositButtonDisabled}
        />
        <VaultExpandedInformationButton
          label={'Withdraw BTC'}
          isDisabled={isWithdrawButtonDisabled}
          onClick={handleWithdrawClick}
        />
      </HStack>
    </VStack>
  );
}
