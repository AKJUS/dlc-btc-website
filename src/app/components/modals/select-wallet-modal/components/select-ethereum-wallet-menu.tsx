import { Box, Button, HStack, Image, Spinner, Text } from '@chakra-ui/react';
import { Connector } from 'wagmi';

interface SelectEthereumWalletMenuProps {
  wagmiConnector: Connector;
  selectedWagmiConnectorID?: string;
  isConnectWalletPending: boolean;
  isConnectWalletSuccess: boolean;
  handleConnectWallet: (wagmiConnector: Connector) => void;
}

export function SelectEthereumWalletMenu({
  wagmiConnector,
  selectedWagmiConnectorID,
  isConnectWalletPending,
  isConnectWalletSuccess,
  handleConnectWallet,
}: SelectEthereumWalletMenuProps): React.JSX.Element {
  const { id, icon, name } = wagmiConnector;

  const isThisWalletSelected = selectedWagmiConnectorID === id;

  return (
    <Button
      borderColor={
        isConnectWalletSuccess && isThisWalletSelected ? 'accent.lightBlue.01' : 'border.white.01'
      }
      variant={'wallet'}
      onClick={() => handleConnectWallet(wagmiConnector)}
    >
      <Box position="relative" w={'100%'} display={'flex'} justifyContent={'center'}>
        <HStack
          justifyContent={'space-evenly'}
          w={'250px'}
          filter={isConnectWalletPending && isThisWalletSelected ? 'opacity(25%)' : 'none'}
        >
          <Image
            src={name === 'WalletConnect' ? './images/logos/walletconnect.svg' : icon}
            alt={name}
            boxSize={'25px'}
          />
          <Text w={'150px'}>{name}</Text>
        </HStack>
        {isConnectWalletPending && isThisWalletSelected && (
          <Spinner size={'md'} color={'accent.lightBlue.01'} position={'absolute'} />
        )}
      </Box>
    </Button>
  );
}
