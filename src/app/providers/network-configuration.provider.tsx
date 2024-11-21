import React, { createContext, useState } from 'react';

import { HasChildren } from '@models/has-children';

import { NetworkType } from '@shared/constants/network.constants';

interface NetworkConfigurationContext {
  networkType: NetworkType;
  setNetworkType: (networkType: NetworkType) => void;
}
export const NetworkConfigurationContext = createContext<NetworkConfigurationContext>({
  networkType: NetworkType.EVM,
  setNetworkType: () => {},
});

export function NetworkConfigurationContextProvider({ children }: HasChildren): React.JSX.Element {
  const [networkType, setNetworkType] = useState<NetworkType>(NetworkType.EVM);

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
