import { useContext } from 'react';

import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { AttestorChainID } from 'dlc-btc-lib/models';

import { NetworkType, SupportedNonBitcoinNetwork } from '@shared/constants/network.constants';

export function useAttestorChainID(): AttestorChainID {
  const { networkType } = useContext(NetworkConfigurationContext);

  const {
    ethereumNetworkConfiguration: { ethereumAttestorChainID },
  } = useContext(EthereumNetworkConfigurationContext);
  const {
    rippleNetworkConfiguration: { rippleAttestorChainID },
  } = useContext(RippleNetworkConfigurationContext);

  const attestorChainIDs: Record<SupportedNonBitcoinNetwork, AttestorChainID> = {
    [NetworkType.EVM]: ethereumAttestorChainID,
    [NetworkType.XRPL]: rippleAttestorChainID,
  };

  return attestorChainIDs[networkType];
}
