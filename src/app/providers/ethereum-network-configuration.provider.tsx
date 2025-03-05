import React, { createContext, useEffect, useState } from 'react';

import {
  getEthereumContractWithProvider,
  getEthereumNetworkByID,
  getEthereumNetworkDeploymentPlans,
} from '@functions/configuration.functions';
import { EthereumNetworkConfiguration } from '@models/ethereum-models';
import { HasChildren } from '@models/has-children';
import { EVMAttestorChainID, EthereumNetworkID } from 'dlc-btc-lib/models';
import { equals, find } from 'ramda';
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  base,
  baseSepolia,
  bsc,
  hardhat,
  mainnet,
  sepolia,
} from 'viem/chains';
import { useAccount } from 'wagmi';

import { SUPPORTED_VIEM_CHAINS } from '@shared/constants/ethereum.constants';

const defaultEthereumNetwork = (() => {
  const defaultNetwork = find(
    chain => equals(chain.id, Number(appConfiguration.enabledEthereumNetworkIDs.at(0))),
    SUPPORTED_VIEM_CHAINS
  );
  if (!defaultNetwork) {
    throw new Error('Default Ethereum Network not found');
  }
  return defaultNetwork;
})();

const enabledEthereumNetworks = appConfiguration.enabledEthereumNetworkIDs.map(id =>
  getEthereumNetworkByID(id)
);

function getEthereumNetworkConfiguration(
  ethereumNetworkID: EthereumNetworkID
): EthereumNetworkConfiguration {
  switch (ethereumNetworkID) {
    case EthereumNetworkID.Mainnet:
      return {
        ethereumExplorerAPIURL: mainnet.blockExplorers.default.apiUrl,
        websocketURL: appConfiguration.l1Websocket,
        httpURL: appConfiguration.l1HTTP,
        ethereumAttestorChainID: EVMAttestorChainID['evm-mainnet'],
        enabledEthereumNetworks,
        dlcManagerContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(mainnet),
          mainnet,
          'DLCManager',
          appConfiguration.l1Websocket
        ),
        iBTCContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(mainnet),
          mainnet,
          'IBTC',
          appConfiguration.l1Websocket
        ),
        chain: mainnet,
      };
    case EthereumNetworkID.Sepolia:
      return {
        ethereumExplorerAPIURL: sepolia.blockExplorers.default.apiUrl,
        websocketURL: appConfiguration.l1Websocket,
        httpURL: appConfiguration.l1HTTP,
        ethereumAttestorChainID: EVMAttestorChainID['evm-sepolia'],
        enabledEthereumNetworks,
        dlcManagerContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(sepolia),
          sepolia,
          'DLCManager',
          appConfiguration.l1Websocket
        ),
        iBTCContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(sepolia),
          sepolia,
          'IBTC',
          appConfiguration.l1Websocket
        ),
        chain: sepolia,
      };
    case EthereumNetworkID.Base:
      return {
        ethereumExplorerAPIURL: base.blockExplorers.default.apiUrl,
        websocketURL: appConfiguration.baseWebsocket,
        httpURL: appConfiguration.baseHTTP,
        ethereumAttestorChainID: EVMAttestorChainID['evm-base'],
        enabledEthereumNetworks,
        dlcManagerContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(base),
          base,
          'DLCManager',
          appConfiguration.baseWebsocket
        ),
        iBTCContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(base),
          base,
          'IBTC',
          appConfiguration.baseWebsocket
        ),
        chain: base,
      };
    case EthereumNetworkID.BaseSepolia:
      return {
        ethereumExplorerAPIURL: baseSepolia.blockExplorers.default.apiUrl,
        websocketURL: appConfiguration.baseWebsocket,
        httpURL: appConfiguration.baseHTTP,
        ethereumAttestorChainID: EVMAttestorChainID['evm-basesepolia'],
        enabledEthereumNetworks,
        dlcManagerContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(baseSepolia),
          baseSepolia,
          'DLCManager',
          baseSepolia.rpcUrls.default.http[0]
        ),
        iBTCContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(baseSepolia),
          baseSepolia,
          'IBTC',
          baseSepolia.rpcUrls.default.http[0]
        ),
        chain: baseSepolia,
      };
    case EthereumNetworkID.Arbitrum:
      return {
        ethereumExplorerAPIURL: arbitrum.blockExplorers.default.apiUrl,
        websocketURL: appConfiguration.arbitrumWebsocket,
        httpURL: appConfiguration.arbitrumHTTP,
        ethereumAttestorChainID: EVMAttestorChainID['evm-arbitrum'],
        enabledEthereumNetworks,
        dlcManagerContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(arbitrum),
          arbitrum,
          'DLCManager',
          appConfiguration.arbitrumWebsocket
        ),
        iBTCContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(arbitrum),
          arbitrum,
          'IBTC',
          appConfiguration.arbitrumWebsocket
        ),
        chain: arbitrum,
      };
    case EthereumNetworkID.ArbitrumSepolia:
      return {
        ethereumExplorerAPIURL: arbitrumSepolia.blockExplorers.default.apiUrl,
        websocketURL: appConfiguration.arbitrumWebsocket,
        httpURL: appConfiguration.arbitrumHTTP,
        ethereumAttestorChainID: EVMAttestorChainID['evm-arbsepolia'],
        enabledEthereumNetworks,
        dlcManagerContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(arbitrumSepolia),
          arbitrumSepolia,
          'DLCManager',
          appConfiguration.arbitrumWebsocket
        ),
        iBTCContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(arbitrumSepolia),
          arbitrumSepolia,
          'IBTC',
          appConfiguration.arbitrumWebsocket
        ),
        chain: arbitrumSepolia,
      };
    case EthereumNetworkID.Avalanche:
      return {
        ethereumExplorerAPIURL: avalanche.blockExplorers.default.apiUrl,
        websocketURL: appConfiguration.avalancheWebsocket,
        httpURL: appConfiguration.avalancheHTTP,
        ethereumAttestorChainID: EVMAttestorChainID['evm-avax'],
        enabledEthereumNetworks,
        dlcManagerContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(avalanche),
          avalanche,
          'DLCManager',
          appConfiguration.avalancheWebsocket
        ),
        iBTCContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(avalanche),
          avalanche,
          'IBTC',
          appConfiguration.avalancheWebsocket
        ),
        chain: avalanche,
      };
    case EthereumNetworkID.BSC:
      return {
        ethereumExplorerAPIURL: bsc.blockExplorers.default.apiUrl,
        websocketURL: appConfiguration.bscWebsocket,
        httpURL: appConfiguration.bscHTTP,
        ethereumAttestorChainID: EVMAttestorChainID['evm-bsc'],
        enabledEthereumNetworks,
        dlcManagerContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(bsc),
          bsc,
          'DLCManager',
          appConfiguration.bscWebsocket
        ),
        iBTCContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(bsc),
          bsc,
          'IBTC',
          appConfiguration.bscWebsocket
        ),
        chain: bsc,
      };
    case EthereumNetworkID.Hardhat:
      return {
        ethereumExplorerAPIURL: '',
        websocketURL: hardhat.rpcUrls.default.http[0],
        httpURL: hardhat.rpcUrls.default.http[0],
        ethereumAttestorChainID: EVMAttestorChainID['evm-hardhat-eth'],
        enabledEthereumNetworks,
        dlcManagerContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(hardhat),
          hardhat,
          'DLCManager'
        ),
        iBTCContract: getEthereumContractWithProvider(
          getEthereumNetworkDeploymentPlans(hardhat),
          hardhat,
          'IBTC'
        ),
        chain: hardhat,
      };
    default:
      throw new Error(`Unsupported Ethereum network ID: ${ethereumNetworkID}`);
  }
}

const defaultEthereumNetworkConfiguration = getEthereumNetworkConfiguration(
  defaultEthereumNetwork.id.toString() as EthereumNetworkID
);

interface EthereumNetworkConfigurationContext {
  ethereumNetworkConfiguration: EthereumNetworkConfiguration;
  isEthereumNetworkConfigurationLoading: boolean;
}
export const EthereumNetworkConfigurationContext =
  createContext<EthereumNetworkConfigurationContext>({
    ethereumNetworkConfiguration: defaultEthereumNetworkConfiguration,
    isEthereumNetworkConfigurationLoading: false,
  });

export function EthereumNetworkConfigurationContextProvider({
  children,
}: HasChildren): React.JSX.Element {
  const { chain } = useAccount();
  const [ethereumNetworkConfiguration, setEthereumNetworkConfiguration] =
    useState<EthereumNetworkConfiguration>(
      chain
        ? getEthereumNetworkConfiguration(chain?.id.toString() as EthereumNetworkID)
        : defaultEthereumNetworkConfiguration
    );
  const [isEthereumNetworkConfigurationLoading, setIsEthereumNetworkConfigurationLoading] =
    useState(false);

  useEffect(() => {
    setIsEthereumNetworkConfigurationLoading(true);

    if (!chain) {
      setEthereumNetworkConfiguration(defaultEthereumNetworkConfiguration);
      return;
    }

    const currentEthereumNetworkConfiguration = getEthereumNetworkConfiguration(
      chain?.id.toString() as EthereumNetworkID
    );

    setEthereumNetworkConfiguration(currentEthereumNetworkConfiguration);
    setIsEthereumNetworkConfigurationLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain]);

  return (
    <EthereumNetworkConfigurationContext.Provider
      value={{ ethereumNetworkConfiguration, isEthereumNetworkConfigurationLoading }}
    >
      {children}
    </EthereumNetworkConfigurationContext.Provider>
  );
}
