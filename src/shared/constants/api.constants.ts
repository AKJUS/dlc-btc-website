import { AppEnvironment } from '@models/configuration';

const BASE_API_URLS = {
  [AppEnvironment.MAINNET]: 'https://api.dlc.link',
  [AppEnvironment.TESTNET]: 'https://testnet.api.dlc.link',
  [AppEnvironment.DEVNET]: 'https://devnet.api.dlc.link',
  [AppEnvironment.LOCALHOST]: 'http://localhost:3000',
};

const API_PATHS = {
  POINTS: '/v1/points',
  PROOF_OF_RESERVE: '/v1/ibtc/proof-of-reserve',
  MINT_BURN_EVENTS: '/v1/ibtc/mint-burn-events',
  TOTAL_SUPPLY: '/v1/ibtc/total-supply',
};

const getBaseApiUrl = (): string => BASE_API_URLS[appConfiguration.appEnvironment];

const API = {
  BASE: getBaseApiUrl(),
  POINTS: `${getBaseApiUrl()}${API_PATHS.POINTS}`,
  PROOF_OF_RESERVE: `${getBaseApiUrl()}${API_PATHS.PROOF_OF_RESERVE}`,
  MINT_BURN_EVENTS: `${getBaseApiUrl()}${API_PATHS.MINT_BURN_EVENTS}`,
  TOTAL_SUPPLY: `${getBaseApiUrl()}${API_PATHS.TOTAL_SUPPLY}`,
};

interface ProofOfReserveOptions {
  address?: string;
  chain?: string;
}

interface PointsOptions {
  address: string;
}

interface MintBurnEventsOptions {
  address: string;
}

interface TotalSupplyOptions {
  chain?: string;
}

export const API_HELPERS = {
  getProofOfReserveURL(options?: ProofOfReserveOptions): string {
    const url = new URL(`${API.PROOF_OF_RESERVE}`);

    if (!options) return url.toString();

    const { address, chain } = options;

    if (address) url.searchParams.set('address', address);
    if (chain) url.searchParams.set('chain', chain);

    return url.toString();
  },
  getPointsURL(options: PointsOptions): string {
    const { address } = options;

    const url = new URL(`${API.POINTS}/${address}`);

    return url.toString();
  },
  getMintBurnEventsURL(options: MintBurnEventsOptions): string {
    const { address } = options;

    const url = new URL(`${API.MINT_BURN_EVENTS}/${address}`);

    return url.toString();
  },
  getTotalSupplyURL(options?: TotalSupplyOptions): string {
    if (!options) return `${API.TOTAL_SUPPLY}`;

    const { chain } = options;

    const url = new URL(`${API.TOTAL_SUPPLY}${chain ? `?chain=${chain}` : ''}`);

    return url.toString();
  },
};
