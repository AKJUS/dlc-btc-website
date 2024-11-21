import React, { createContext, useEffect, useState } from 'react';

import { getRippleNetworkByID } from '@functions/configuration.functions';
import { HasChildren } from '@models/has-children';
import { RippleNetwork, RippleNetworkConfiguration, RippleNetworkID } from '@models/ripple.models';
import { Client } from 'dlc-btc-lib/models';
import { getRippleClient } from 'dlc-btc-lib/ripple-functions';
import { equals, find } from 'ramda';

import { supportedRippleNetworks } from '@shared/constants/ripple.constants';

const defaultRippleNetwork = (() => {
  const defaultNetwork = find(
    (chain: RippleNetwork) => equals(chain.id, appConfiguration.enabledRippleNetworkIDs.at(0)),
    supportedRippleNetworks
  );
  if (!defaultNetwork) {
    throw new Error('Default Ripple Network not found');
  }
  return defaultNetwork;
})();

const enabledRippleNetworks = appConfiguration.enabledRippleNetworkIDs.map(id =>
  getRippleNetworkByID(id)
);

function getRippleNetworkConfiguration(
  rippleNetworkID: RippleNetworkID
): RippleNetworkConfiguration {
  switch (rippleNetworkID) {
    case RippleNetworkID.Mainnet:
      return {
        rippleExplorerAPIURL: 'https://livenet.xrpl.org/',
        websocketURL: 'wss://s1.ripple.com/',
        rippleAttestorChainID: 'ripple-xrpl-mainnet',
      };
    case RippleNetworkID.Testnet:
      return {
        rippleExplorerAPIURL: 'https://testnet.xrpl.org/',
        websocketURL: 'wss://s.altnet.rippletest.net:51233',
        rippleAttestorChainID: 'ripple-xrpl-testnet',
      };

    default:
      throw new Error(`Unsupported Ethereum network ID: ${rippleNetworkID}`);
  }
}

const defaultRippleNetworkConfiguration = getRippleNetworkConfiguration(
  defaultRippleNetwork.id.toString() as RippleNetworkID
);

interface RippleNetworkConfigurationContext {
  rippleNetworkConfiguration: RippleNetworkConfiguration;
  setRippleNetworkID: (rippleNetworkID: RippleNetworkID) => void;
  enabledRippleNetworks: RippleNetwork[];
  rippleClient: Client;
  isRippleNetworkConfigurationLoading: boolean;
}
export const RippleNetworkConfigurationContext = createContext<RippleNetworkConfigurationContext>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setRippleNetworkID: (_rippleNetworkID: RippleNetworkID) => {},
  rippleNetworkConfiguration: defaultRippleNetworkConfiguration,
  enabledRippleNetworks,
  rippleClient: new Client(appConfiguration.xrplWebsocket),
  isRippleNetworkConfigurationLoading: false,
});

export function RippleNetworkConfigurationContextProvider({
  children,
}: HasChildren): React.JSX.Element {
  const [rippleNetworkID, setRippleNetworkID] = useState<RippleNetworkID>(defaultRippleNetwork.id);
  const [rippleNetworkConfiguration, setRippleNetworkConfiguration] =
    useState<RippleNetworkConfiguration>(defaultRippleNetworkConfiguration);

  const rippleClient = getRippleClient(rippleNetworkConfiguration.websocketURL);

  const [isRippleNetworkConfigurationLoading, setIsRippleNetworkConfigurationLoading] =
    useState(false);

  useEffect(() => {
    setIsRippleNetworkConfigurationLoading(true);

    const currentRippleNetworkConfiguration = getRippleNetworkConfiguration(
      rippleNetworkID.toString() as RippleNetworkID
    );

    setRippleNetworkConfiguration(currentRippleNetworkConfiguration);
    setIsRippleNetworkConfigurationLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rippleNetworkID]);

  return (
    <RippleNetworkConfigurationContext.Provider
      value={{
        rippleNetworkConfiguration,
        isRippleNetworkConfigurationLoading,
        enabledRippleNetworks,
        rippleClient,
        setRippleNetworkID,
      }}
    >
      {children}
    </RippleNetworkConfigurationContext.Provider>
  );
}
