export enum NetworkType {
  EVM = 'evm',
  XRPL = 'xrpl',
  BTC = 'bitcoin',
}

export type SupportedNonBitcoinNetwork = Exclude<NetworkType, NetworkType.BTC>;
