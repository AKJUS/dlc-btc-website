import { Box, Button, HStack, Image, Text } from '@chakra-ui/react';
import { XRPWallet, XRPWalletType } from '@models/wallet';

interface SelectRippleWalletMenuProps {
  rippleWallet: XRPWallet;
  handleConnectWallet: (xrpWalletType: XRPWalletType) => void;
}

export function SelectRippleWalletMenu({
  rippleWallet,
  handleConnectWallet,
}: SelectRippleWalletMenuProps): React.JSX.Element {
  const { id, icon, name } = rippleWallet;

  return (
    <Button
      borderColor={'accent.lightBlue.01'}
      variant={'wallet'}
      onClick={() => handleConnectWallet(id)}
    >
      <Box position="relative" w={'100%'} display={'flex'} justifyContent={'center'}>
        <HStack justifyContent={'space-evenly'} w={'250px'} filter={'none'}>
          <Image
            src={name === 'WalletConnect' ? './images/logos/walletconnect.svg' : icon}
            alt={name}
            boxSize={'25px'}
          />
          <Text w={'150px'}>{name}</Text>
        </HStack>
      </Box>
    </Button>
  );
}
