import { EthereumDeploymentPlan, EthereumNetworkID } from 'dlc-btc-lib/models';

import { Merchant } from './merchant';
import { Protocol } from './protocol';
import { RippleNetworkID } from './ripple.models';

enum BitcoinNetworkName {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  REGTEST = 'regtest',
}

enum AppEnvironment {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  DEVNET = 'devnet',
  LOCALHOST = 'localhost',
}

type BitcoinNetworkPrefix = 'bc1' | 'tb1' | 'bcrt1';
export const ALL_SUPPORTED_BITCOIN_NETWORK_PREFIX: BitcoinNetworkPrefix[] = ['bc1', 'tb1', 'bcrt1'];

export interface Configuration {
  appEnvironment: AppEnvironment;
  coordinatorURL: string;
  enabledEthereumNetworkIDs: EthereumNetworkID[];
  enabledRippleNetworkIDs: RippleNetworkID[];
  ethereumContractInformations: { name: string; deploymentPlans: EthereumDeploymentPlan[] }[];
  l1Websocket: string;
  l1HTTP: string;
  arbitrumWebsocket: string;
  arbitrumHTTP: string;
  baseWebsocket: string;
  baseHTTP: string;
  xrplWebsocket: string;
  walletConnectProjectID: string;
  bitcoinNetwork: BitcoinNetworkName;
  bitcoinNetworkIndex: number;
  bitcoinNetworkPreFix: BitcoinNetworkPrefix;
  bitcoinBlockchainURL: string;
  bitcoinBlockchainExplorerURL: string;
  bitcoinBlockchainFeeEstimateURL: string;
  rippleIssuerAddress: string;
  ledgerApp: string;
  merchants: Merchant[];
  protocols: Protocol[];
}
