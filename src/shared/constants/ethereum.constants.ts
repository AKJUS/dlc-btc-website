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
