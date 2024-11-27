export interface Merchant {
  name: string;
  addresses: string[];
  logo: string;
}

export interface MerchantProofOfReserve {
  merchant: Merchant;
  iBTCAmount: number | undefined;
}
