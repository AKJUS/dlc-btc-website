import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Collapse, Stack, VStack } from '@chakra-ui/react';
import { VaultContext } from '@providers/vault-context-provider';
import { mintUnmintActions } from '@store/slices/mintunmint/mintunmint.actions';
import { MintSteps, RedeemSteps } from '@store/slices/mintunmint/mintunmint.slice';
import { VaultState } from 'dlc-btc-lib/models';

import { VaultExpandedInformationButtonGroup } from './components/vault.details.button-group/vault.details.button-group';
import { VaultTransactionStack } from './components/vault.details.transaction-stack/vault.details.transaction-stack';

interface VaultDetailsProps {
  vaultUUID: string;
  vaultState: VaultState;
  vaultTotalLockedValue: number;
  vaultTotalMintedValue: number;
  isVaultExpanded: boolean;
  vaultFundingTX?: string;
  vaultFundingBitcoinAddress?: string;
  vaultWithdrawDepositTX?: string;
  variant?: 'select' | 'selected';
  handleClose?: () => void;
}

export function VaultDetails({
  vaultUUID,
  vaultState,
  vaultFundingTX,
  vaultWithdrawDepositTX,
  vaultTotalLockedValue,
  vaultTotalMintedValue,
  vaultFundingBitcoinAddress,
  isVaultExpanded,
  variant,
  handleClose,
}: VaultDetailsProps): React.JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { allVaults } = useContext(VaultContext);
  const vault = allVaults.find(vault => vault.uuid === vaultUUID);

  function handleDepositClick() {
    navigate('/mint-withdraw');
    dispatch(mintUnmintActions.setMintStep({ step: MintSteps.DEPOSIT, vault: vault }));
    if (handleClose) {
      handleClose();
    }
  }

  function handleWithdrawClick() {
    navigate('/mint-withdraw');
    if (vaultTotalLockedValue === vaultTotalMintedValue) {
      dispatch(mintUnmintActions.setUnmintStep({ step: RedeemSteps.BURN, vault: vault }));
    } else {
      dispatch(mintUnmintActions.setUnmintStep({ step: RedeemSteps.WITHDRAW, vault: vault }));
    }
    if (handleClose) {
      handleClose();
    }
  }

  function handleResumeClick() {
    navigate('/mint-withdraw');
    if (vaultTotalLockedValue === vaultTotalMintedValue) {
      dispatch(mintUnmintActions.setMintStep({ step: MintSteps.PENDING, vault: vault }));
    } else {
      dispatch(mintUnmintActions.setUnmintStep({ step: RedeemSteps.PENDING, vault: vault }));
    }
  }

  return (
    <Stack w={'100%'} spacing={'0px'}>
      <Collapse in={isVaultExpanded} unmountOnExit animateOpacity>
        <VStack w={'100%'}>
          <VStack w={'100%'} justifyContent={'space-between'}>
            <VaultTransactionStack
              vaultFundingTX={vaultFundingTX}
              vaultWithdrawDepositTX={vaultWithdrawDepositTX}
              vaultFundingBitcoinAddress={vaultFundingBitcoinAddress}
            />
            <VaultExpandedInformationButtonGroup
              variant={variant}
              vaultState={vaultState}
              vaultTotalLockedValue={vaultTotalLockedValue}
              vaultTotalMintedValue={vaultTotalMintedValue}
              handleDepositClick={handleDepositClick}
              handleWithdrawClick={handleWithdrawClick}
              handleResumeClick={handleResumeClick}
            />
          </VStack>
        </VStack>
      </Collapse>
    </Stack>
  );
}
