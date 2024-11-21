import React, { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';

import { VStack } from '@chakra-ui/react';
import { Vault as VaultModel } from '@models/vault';
import { BitcoinTransactionConfirmationsContext } from '@providers/bitcoin-query-provider';
import { mintUnmintActions } from '@store/slices/mintunmint/mintunmint.actions';

import { VaultDetails } from './components/vault.detaills/vault.details';
import { VaultHeader } from './components/vault.header/vault.header';
import { VaultLayout } from './components/vault.layout';
import { VaultMainStack } from './components/vault.main-stack/vault-main-stack';
import { VaultProgressBar } from './components/vault.progress-bar';

interface VaultProps {
  vault: VaultModel;
  variant?: 'select' | 'selected';
  handleClose?: () => void;
}

export function Vault({ vault, variant, handleClose }: VaultProps): React.JSX.Element {
  const dispatch = useDispatch();
  const [isVaultExpanded, setIsVaultExpanded] = useState(false);

  function handleMainButtonClick() {
    if (variant === 'select') {
      const step = vault.valueLocked === vault.valueMinted ? 0 : 1;
      dispatch(mintUnmintActions.setUnmintStep([step, vault.uuid, vault]));
    } else {
      setIsVaultExpanded(!isVaultExpanded);
    }
  }

  const confirmations = useContext(
    BitcoinTransactionConfirmationsContext
  ).bitcoinTransactionConfirmations.find(v => v[0] === vault.uuid)?.[1];

  return (
    <VaultLayout>
      <VaultHeader vaultUUID={vault.uuid} vaultCreationTimestamp={vault.timestamp} />
      <VStack width={'100%'} gap={'0px'}>
        <VaultMainStack
          vaultState={vault.state}
          vaultTotalLockedValue={vault.valueLocked}
          vaultTotalMintedValue={vault.valueMinted}
          isVaultExpanded={isVaultExpanded}
          variant={variant}
          handleButtonClick={handleMainButtonClick}
        />
        <VaultDetails
          variant={variant}
          vaultUUID={vault.uuid}
          vaultState={vault.state}
          vaultTotalLockedValue={vault.valueLocked}
          vaultTotalMintedValue={vault.valueMinted}
          isVaultExpanded={isVaultExpanded}
          vaultFundingTX={vault.fundingTX}
          vaultWithdrawDepositTX={vault.withdrawDepositTX}
          handleClose={handleClose}
        />
      </VStack>

      <VaultProgressBar
        bitcoinTransactionConfirmations={confirmations}
        vaultState={vault.state}
        vaultTotalLockedValue={vault.valueLocked}
        vaultTotalMintedValue={vault.valueMinted}
      />
    </VaultLayout>
  );
}
