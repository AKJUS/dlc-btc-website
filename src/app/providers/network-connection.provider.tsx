import React, { createContext } from 'react';

import { useNetworkConnection } from '@hooks/use-connected';
import { HasChildren } from '@models/has-children';

interface NetworConnectionContextProvider {
  isConnected: boolean;
}
export const NetworkConnectionContext = createContext<NetworConnectionContextProvider>({
  isConnected: false,
});

export function NetworkConnectionContextProvider({ children }: HasChildren): React.JSX.Element {
  const { isConnected } = useNetworkConnection();

  return (
    <NetworkConnectionContext.Provider
      value={{
        isConnected,
      }}
    >
      {children}
    </NetworkConnectionContext.Provider>
  );
}
