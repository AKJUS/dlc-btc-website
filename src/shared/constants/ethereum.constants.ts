import { EVMAttestorChainID, EthereumNetworkID } from 'dlc-btc-lib/models';
import { Chain } from 'viem';
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

export const SUPPORTED_VIEM_CHAINS: Chain[] = [
  mainnet,
  sepolia,
  arbitrum,
  arbitrumSepolia,
  base,
  bsc,
  avalanche,
  baseSepolia,
  hardhat,
];

export const EVMAttestorChainIDMap: Record<EthereumNetworkID, EVMAttestorChainID> = {
  [EthereumNetworkID.Mainnet]: EVMAttestorChainID['evm-mainnet'],
  [EthereumNetworkID.Sepolia]: EVMAttestorChainID['evm-sepolia'],
  [EthereumNetworkID.Arbitrum]: EVMAttestorChainID['evm-arbitrum'],
  [EthereumNetworkID.ArbitrumSepolia]: EVMAttestorChainID['evm-arbsepolia'],
  [EthereumNetworkID.Avalanche]: EVMAttestorChainID['evm-avax'],
  [EthereumNetworkID.Base]: EVMAttestorChainID['evm-base'],
  [EthereumNetworkID.BaseSepolia]: EVMAttestorChainID['evm-basesepolia'],
  [EthereumNetworkID.BSC]: EVMAttestorChainID['evm-bsc'],
  [EthereumNetworkID.Hardhat]: EVMAttestorChainID['evm-hardhat-eth'],
  [EthereumNetworkID.Holesky]: EVMAttestorChainID['evm-holesky'],
};
