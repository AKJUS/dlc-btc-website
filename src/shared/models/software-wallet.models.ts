export interface BitcoinNativeSegwitAccount {
  address: string;
  derivationPath?: string;
  publicKey: string;
  symbol: string;
  type: string;
}

export interface BitcoinTaprootAccount extends BitcoinNativeSegwitAccount {
  type: 'p2tr';
  tweakedPublicKey?: string;
}

export type BitcoinAccount = BitcoinNativeSegwitAccount | BitcoinTaprootAccount;

export interface BitcoinAccounts {
  nativeSegwitAccount: BitcoinNativeSegwitAccount;
  taprootAccount: BitcoinTaprootAccount;
}

interface StacksAddress {
  address: string;
  symbol: string;
}

export type Account = BitcoinNativeSegwitAccount | BitcoinTaprootAccount | StacksAddress;

interface RpcResult {
  addresses: Account[];
}

export interface RpcResponse {
  id: string;
  jsonrpc: string;
  result: RpcResult;
}
