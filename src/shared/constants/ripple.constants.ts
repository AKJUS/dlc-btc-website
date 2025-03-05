import { RippleNetwork, RippleNetworkID } from '@models/ripple.models';
import { XRPLAttestorChainID } from 'dlc-btc-lib/models';

const RippleMainnet: RippleNetwork = {
  id: RippleNetworkID.Mainnet,
  name: 'Mainnet',
  displayName: 'Mainnet',
};
const RippleTestnet: RippleNetwork = {
  id: RippleNetworkID.Testnet,
  name: 'Testnet',
  displayName: 'Testnet',
};

export const supportedRippleNetworks: RippleNetwork[] = [RippleMainnet, RippleTestnet];

export const XRPLAttestorChainIDMap: Record<RippleNetworkID, XRPLAttestorChainID> = {
  [RippleNetworkID.Mainnet]: XRPLAttestorChainID['ripple-xrpl-mainnet'],
  [RippleNetworkID.Testnet]: XRPLAttestorChainID['ripple-xrpl-testnet'],
};
