import { LeatherDLCHandler, LedgerDLCHandler, UnisatFordefiDLCHandler } from 'dlc-btc-lib';
import { AttestorChainID, RawVault, Transaction } from 'dlc-btc-lib/models';

import { BitcoinWalletType } from './wallet';

export interface TransactionParams {
  vault: RawVault;
  amount: number;
  extendedAttestorGroupPublicKey: string;
  feeRecipient: string;
  bitcoinFeeRateMultiplier: number;
}

type TransactionHandler = (
  vault: RawVault,
  amount: number,
  extendedAttestorGroupPublicKey: string,
  feeRecipient: string,
  bitcoinFeeRateMultiplier: number
) => Promise<Transaction>;

export interface PSBTSubmissionParams {
  transaction: Transaction;
  vault: RawVault;
  userAddress: string;
  dlcHandler: LeatherDLCHandler | LedgerDLCHandler | UnisatFordefiDLCHandler;
  coordinatorURL: string;
  attestorChainID: AttestorChainID;
}

export interface TransactionHandlers {
  handleFundingTransaction: Record<BitcoinWalletType, TransactionHandler>;
  handleWithdrawTransaction: Record<BitcoinWalletType, TransactionHandler>;
  handleDepositTransaction: Record<BitcoinWalletType, TransactionHandler>;
}

export type HandlerType = keyof TransactionHandlers;

export type TransactionType = 'withdraw' | 'deposit';
