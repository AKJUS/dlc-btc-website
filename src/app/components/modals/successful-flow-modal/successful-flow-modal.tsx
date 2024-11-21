import { HStack, Text, VStack } from '@chakra-ui/react';
import { TransactionFormNavigateButtonGroup } from '@components/transaction-screen/transaction-screen.transaction-form/components/transaction-screen.transaction-form/components/transaction-screen.transaction-form.navigate-button-group';
import { Vault } from '@components/vault/vault';
import { Vault as VaultModel } from '@models/vault';

import { ModalComponentProps } from '../components/modal-container';
import { ModalVaultLayout } from '../components/modal.vault.layout';

interface SuccessfulFlowModalProps extends ModalComponentProps {
  vaultUUID: string;
  vault: VaultModel;
  flow: 'mint' | 'burn';
  assetAmount: number;
}

function getModalText(flow: 'mint' | 'burn', assetAmount?: number): string {
  if (flow === 'mint') {
    return `You have successfully deposited ${assetAmount} BTC from your Bitcoin Wallet into your Vault, and minted ${assetAmount} dlcBTC to your destination address.`;
  } else {
    return `You have successfully burned ${assetAmount} dlcBTC from your destination address, and withdrawn ${assetAmount} BTC from your Vault into your Bitcoin Wallet.`;
  }
}

export function SuccessfulFlowModal({
  isOpen,
  handleClose,
  vault,
  flow,
  assetAmount,
}: SuccessfulFlowModalProps): React.JSX.Element {
  return (
    <ModalVaultLayout title={'Success!'} isOpen={isOpen} onClose={() => handleClose()}>
      <VStack w={'100%'} spacing={'25px'}>
        <HStack w={'100%'}>
          <Text color={'grey.01'} fontSize={'sm'}>
            {getModalText(flow, assetAmount)}
          </Text>
        </HStack>
        <Vault vault={vault} handleClose={handleClose} />
        <TransactionFormNavigateButtonGroup flow={flow} handleClose={handleClose} />
      </VStack>
    </ModalVaultLayout>
  );
}
