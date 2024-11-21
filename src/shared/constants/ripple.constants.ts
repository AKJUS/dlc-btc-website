import { RippleNetwork, RippleNetworkID } from '@models/ripple.models';

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
