import { useEffect, useState } from 'react';

import { ChevronDownIcon } from '@chakra-ui/icons';
import { HStack, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { getEthereumNetworkByID, getRippleNetworkByID } from '@functions/configuration.functions';
import { RippleNetwork, RippleNetworkID } from '@models/ripple.models';
import { EthereumNetwork, EthereumNetworkID } from 'dlc-btc-lib/models';

import { NetworkType } from '@shared/constants/network.constants';

interface SelectNetworkButtonProps {
  handleChangeNetwork: (networkID: EthereumNetworkID | RippleNetworkID) => void;
  ethereumNetworkIDs: EthereumNetworkID[];
  rippleNetworkIDs: RippleNetworkID[];
  selectedNetworkType?: NetworkType;
  selectedNetworkID?: EthereumNetworkID | RippleNetworkID;
}

export function SelectNetworkButton({
  handleChangeNetwork,
  ethereumNetworkIDs,
  rippleNetworkIDs,
  selectedNetworkID,
  selectedNetworkType,
}: SelectNetworkButtonProps): React.JSX.Element {
  const [networks, setNetworks] = useState<(EthereumNetwork | RippleNetwork)[]>([]);
  const ethereumNetworks = ethereumNetworkIDs.map((networkID: EthereumNetworkID) => {
    return getEthereumNetworkByID(networkID as EthereumNetworkID);
  });

  const rippleNetworks = rippleNetworkIDs.map((networkID: RippleNetworkID) => {
    return getRippleNetworkByID(networkID as RippleNetworkID);
  });

  const selectedNetwork =
    selectedNetworkType === NetworkType.EVM
      ? ethereumNetworks.find(network => network.id === selectedNetworkID)
      : rippleNetworks.find(network => network.id === selectedNetworkID);

  useEffect(() => {
    const currentNetworks =
      selectedNetworkType === NetworkType.EVM ? ethereumNetworks : rippleNetworks;
    setNetworks(currentNetworks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetworkType]);

  return (
    <Menu variant={'network'}>
      <MenuButton>
        <HStack justifyContent={'space-between'}>
          {selectedNetworkID ? (
            <Text>{selectedNetwork?.displayName}</Text>
          ) : (
            <Text>{'SELECT NETWORK'}</Text>
          )}
          <ChevronDownIcon color={'white'} />
        </HStack>
      </MenuButton>
      <MenuList>
        {networks.map(network => {
          return (
            <MenuItem
              key={network.id}
              value={network.id}
              onClick={() => handleChangeNetwork(network.id)}
            >
              {network.displayName}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}
