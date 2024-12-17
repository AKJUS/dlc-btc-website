import { useDispatch } from 'react-redux';

import { VStack, useToast } from '@chakra-ui/react';
import { ModalComponentProps } from '@components/modals/components/modal-container';
import { ModalLayout } from '@components/modals/components/modal.layout';
import { useLeather } from '@hooks/use-leather';
import { useUnisatFordefi } from '@hooks/use-unisat-fordefi';
import { BitcoinWalletType, bitcoinWallets } from '@models/wallet';
import { modalActions } from '@store/slices/modal/modal.actions';

import { SelectBitcoinWalletMenu } from './components/select-bitcoin-wallet-modal-menu';
import { UpdateBitcoinWalletMessage } from './components/update-bitcoin-wallet-message';

export function SelectBitcoinWalletModal({
  isOpen,
  handleClose,
}: ModalComponentProps): React.JSX.Element {
  const dispatch = useDispatch();
  const toast = useToast();
  const { connectLeatherWallet } = useLeather();
  const { connectUnisatOrFordefiWallet } = useUnisatFordefi();

  async function handleLogin(walletType: BitcoinWalletType) {
    switch (walletType) {
      case BitcoinWalletType.Leather:
        try {
          await connectLeatherWallet();
        } catch (error: any) {
          toast({
            title: 'Failed to connect to Leather Wallet',
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
        break;
      case BitcoinWalletType.Unisat:
        try {
          await connectUnisatOrFordefiWallet();
        } catch (error: any) {
          toast({
            title: 'Failed to connect to Unisat Wallet',
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
        break;
      case BitcoinWalletType.Fordefi:
        try {
          await connectUnisatOrFordefiWallet(true);
        } catch (error: any) {
          toast({
            title: 'Failed to connect to Unisat Wallet',
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
        break;
      case BitcoinWalletType.Ledger:
        dispatch(modalActions.toggleLedgerModalVisibility());
        break;
      default:
        break;
    }
    handleClose();
  }

  return (
    <ModalLayout title="Connect Bitcoin Wallet" isOpen={isOpen} onClose={() => handleClose()}>
      <VStack alignItems={'start'} spacing={'25px'}>
        {bitcoinWallets.map(wallet => (
          <SelectBitcoinWalletMenu
            key={wallet.name}
            wallet={wallet}
            handleClick={() => handleLogin(wallet.id)}
          />
        ))}
        <UpdateBitcoinWalletMessage />
      </VStack>
    </ModalLayout>
  );
}
