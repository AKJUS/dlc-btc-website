import { HStack, Link, Text, VStack } from '@chakra-ui/react';
import { TransactionFormNavigateButtonGroup } from '@components/transaction-screen/transaction-screen.transaction-form/components/transaction-screen.transaction-form/components/transaction-screen.transaction-form.navigate-button-group';
import { Vault } from '@components/vault/vault';
import { Vault as VaultModel } from '@models/vault';

import { ModalComponentProps } from '../components/modal-container';
import { ModalVaultLayout } from '../components/modal.vault.layout';

type FlowType = 'mint' | 'burn' | 'bitsafe';

interface SuccessfulFlowModalProps extends ModalComponentProps {
  vaultUUID: string;
  vault: VaultModel;
  flow: FlowType;
  assetAmount: number;
  btcTxId?: string;
}

function getModalText(flow: FlowType, assetAmount?: number): string {
  if (flow === 'mint') {
    return `You have successfully deposited ${assetAmount} BTC from your Bitcoin Wallet into your Vault, and minted ${assetAmount} iBTC to your destination address.`;
  } else if (flow === 'bitsafe') {
    return `You have successfully withdrawn ${assetAmount} BTC from your Vault to Bitsafe. It may take up to 1 minute for the transaction to be broadcast to the Bitcoin mempool.`;
  } else {
    return `You have successfully burned ${assetAmount} iBTC from your destination address, and withdrawn ${assetAmount} BTC from your Vault into your Bitcoin Wallet.`;
  }
}

export function SuccessfulFlowModal({
  isOpen,
  handleClose,
  vault,
  flow,
  assetAmount,
  btcTxId,
}: SuccessfulFlowModalProps): React.JSX.Element {
  return (
    <ModalVaultLayout title={'Success!'} isOpen={isOpen} onClose={() => handleClose()}>
      <VStack w={'100%'} spacing={'25px'}>
        <HStack w={'100%'}>
          <Text color={'grey.01'} fontSize={'sm'}>
            {getModalText(flow, assetAmount)}
          </Text>
        </HStack>
        {btcTxId && (
          <Link
            href={`${appConfiguration.bitcoinBlockchainExplorerURL}/tx/${btcTxId}`}
            isExternal
            color={'accent.lightBlue.01'}
            textDecoration={'underline'}
            fontSize={'sm'}
          >
            View Transaction
          </Link>
        )}
        <Vault vault={vault} handleClose={handleClose} />
        <TransactionFormNavigateButtonGroup
          flow={flow === 'bitsafe' ? 'burn' : flow}
          handleClose={handleClose}
        />
      </VStack>
    </ModalVaultLayout>
  );
}
