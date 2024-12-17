import {
  BitcoinWalletAction,
  BitcoinWalletTransactionType,
  BitcoinWalletType,
} from '@models/wallet';
import { bitcoin, regtest, testnet } from 'dlc-btc-lib/constants';

export const BITCOIN_NETWORK_MAP = {
  mainnet: bitcoin,
  testnet: testnet,
  regtest: regtest,
};

export const BITCOIN_BLOCK_CONFIRMATIONS = 6;

export const walletLoadingState = (
  bitcoinWalletAction = BitcoinWalletAction.NONE,
  bitcoinWalletType?: BitcoinWalletType,
  transactionType?: BitcoinWalletTransactionType
): [boolean, string] => {
  switch (bitcoinWalletAction) {
    case BitcoinWalletAction.CONNECTING:
      return [true, `Connecting to ${bitcoinWalletType} Wallet`];
    case BitcoinWalletAction.CREATING_TRANSACTION:
      return [true, `Creating ${transactionType} Transaction`];
    case BitcoinWalletAction.SIGNING_TRANSACTION:
      return [true, `Sign the ${transactionType} Transaction in your ${bitcoinWalletType} Wallet`];
    case BitcoinWalletAction.ACCEPT_MULTI_SIG_WALLET_POLICY:
      return [true, `Accept the MultiSig Wallet Policy in your ${bitcoinWalletType} Wallet`];
    case BitcoinWalletAction.LOADING_ADDRESSES:
      return [true, `Loading ${bitcoinWalletType} Wallet Addresses`];
    case BitcoinWalletAction.OPENING_APP:
      return [true, `Opening Bitcoin App in your ${bitcoinWalletType} Device`];
    case BitcoinWalletAction.OPEN_APP:
      return [true, `Open Bitcoin App in your ${bitcoinWalletType} Device`];
    default:
      return [false, ''];
  }
};
