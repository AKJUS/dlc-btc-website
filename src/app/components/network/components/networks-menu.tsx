import { useContext } from 'react';

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
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { NetworkConnectionContext } from '@providers/network-connection.provider';
import { EthereumNetworkID } from 'dlc-btc-lib/models';
import { useAccount, useConfig, useSwitchChain } from 'wagmi';

interface NetworksMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
}

const getNetworkLogo = (ethereumNetworkId?: EthereumNetworkID) => {
  switch (ethereumNetworkId) {
    case EthereumNetworkID.Arbitrum:
    case EthereumNetworkID.ArbitrumSepolia:
      return './images/logos/arbitrum-token.svg';
    case EthereumNetworkID.Sepolia:
    case EthereumNetworkID.Mainnet:
      return './images/logos/eth-token.svg';
    case EthereumNetworkID.BaseSepolia:
    case EthereumNetworkID.Base:
      return './images/logos/base-token.svg';
    default:
      return './images/logos/arbitrum-token.svg';
  }
};

export function NetworksMenu({
  isMenuOpen,
  setIsMenuOpen,
}: NetworksMenuProps): React.JSX.Element | null {
  const { chains } = useConfig();
  const { isConnected } = useContext(NetworkConnectionContext);
  const { chain: ethereumNetwork } = useAccount();

  const { networkType } = useContext(NetworkConfigurationContext);

  const { switchChain } = useSwitchChain();
  //TODO: maybe add the network logo to the setstate?

  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!isConnected || networkType === 'xrpl') {
    return null;
  }

  return (
    <Menu variant={'networkChange'} isOpen={isMenuOpen}>
      <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)} h={isMobile ? '40px' : '50px'}>
        {isMobile ? (
          <Image
            src={getNetworkLogo(ethereumNetwork?.id.toString() as EthereumNetworkID)}
            alt={'Selected network logo'}
            w={'30px'}
            ml={'4px'}
          />
        ) : (
          //TODO: what to display in case of not connected?
          <HStack justifyContent={'space-evenly'}>
            <Text>{ethereumNetwork ? ethereumNetwork?.name : 'Not Connected'}</Text>
          </HStack>
        )}
      </MenuButton>
      <MenuList>
        {chains.map(ethereumNetwork => {
          return (
            <MenuItem
              key={ethereumNetwork.id}
              value={ethereumNetwork.id}
              onClick={() => {
                switchChain({ chainId: ethereumNetwork.id });
                setIsMenuOpen(!isMenuOpen);
                getNetworkLogo(ethereumNetwork?.id.toString() as EthereumNetworkID);
              }}
            >
              {ethereumNetwork.name}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}
