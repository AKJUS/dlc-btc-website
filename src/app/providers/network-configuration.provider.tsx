import React, { createContext, useState } from 'react';

import { HasChildren } from '@models/has-children';

import { NetworkType, SupportedNonBitcoinNetwork } from '@shared/constants/network.constants';

interface NetworkConfigurationContext {
  networkType: SupportedNonBitcoinNetwork;
  setNetworkType: (networkType: SupportedNonBitcoinNetwork) => void;
}
export const NetworkConfigurationContext = createContext<NetworkConfigurationContext>({
  networkType: NetworkType.EVM,
  setNetworkType: () => {},
});

export function NetworkConfigurationContextProvider({ children }: HasChildren): React.JSX.Element {
  const [networkType, setNetworkType] = useState<SupportedNonBitcoinNetwork>(NetworkType.EVM);

  return (
    <NetworkConfigurationContext.Provider
      value={{
        networkType,
        setNetworkType,
      }}
    >
      {children}
    </NetworkConfigurationContext.Provider>
  );
}
