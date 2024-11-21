import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { XRPWallet } from '@models/wallet';
import { truncateAddress } from 'dlc-btc-lib/utilities';
import { Connector } from 'wagmi';

interface AccountMenuProps {
  address?: string;
  wallet?: Connector | XRPWallet;
  handleDisconnectWallet: () => void;
}

export function AccountMenu({
  address,
  wallet,
  handleDisconnectWallet,
}: AccountMenuProps): React.JSX.Element | false {
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!address) return false;
  return (
    <Menu variant={'account'}>
      <MenuButton h={isMobile ? '40px' : '50px'} w={isMobile ? '120px' : '275px'}>
        <HStack justifyContent={'space-evenly'}>
          {!isMobile ? (
            <>
              <Image
                p={'2.5px'}
                src={
                  wallet?.name === 'WalletConnect'
                    ? './images/logos/walletconnect.svg'
                    : wallet?.icon
                }
                alt={wallet?.name}
                boxSize={'35px'}
              />
              <Text>{truncateAddress(address)}</Text>
              <ChevronDownIcon boxSize={'35px'} color={'white'} />
            </>
          ) : (
            <Text>{truncateAddress(address)}</Text>
          )}
        </HStack>
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => handleDisconnectWallet()}>Disconnect</MenuItem>
      </MenuList>
    </Menu>
  );
}
