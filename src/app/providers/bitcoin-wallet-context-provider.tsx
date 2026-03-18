import { createContext, useState } from 'react';

import { HasChildren } from '@models/has-children';
import { BitcoinWalletType } from '@models/wallet';
import { LeatherDLCHandler, LedgerDLCHandler, UnisatFordefiDLCHandler } from 'dlc-btc-lib';

export enum BitcoinWalletContextState {
  INITIAL = 0,
  SELECTED = 1,
  READY = 2,
}

interface BitcoinWalletContextProviderType {
  bitcoinWalletType: BitcoinWalletType | undefined;
  setBitcoinWalletType: React.Dispatch<React.SetStateAction<BitcoinWalletType | undefined>>;
  bitcoinWalletContextState: BitcoinWalletContextState;
  setBitcoinWalletContextState: React.Dispatch<React.SetStateAction<BitcoinWalletContextState>>;
  dlcHandler: LeatherDLCHandler | UnisatFordefiDLCHandler | LedgerDLCHandler | undefined;
  setDLCHandler: React.Dispatch<
    React.SetStateAction<LeatherDLCHandler | UnisatFordefiDLCHandler | LedgerDLCHandler | undefined>
  >;
  resetBitcoinWalletContext: () => void;
}

export const BitcoinWalletContext = createContext<BitcoinWalletContextProviderType>({
  bitcoinWalletType: undefined,
  setBitcoinWalletType: () => {},
  bitcoinWalletContextState: BitcoinWalletContextState.INITIAL,
  setBitcoinWalletContextState: () => {},
  dlcHandler: undefined,
  setDLCHandler: () => {},
  resetBitcoinWalletContext: () => {},
});

export function BitcoinWalletContextProvider({ children }: HasChildren): React.JSX.Element {
  const [bitcoinWalletContextState, setBitcoinWalletContextState] =
    useState<BitcoinWalletContextState>(BitcoinWalletContextState.INITIAL);
  const [bitcoinWalletType, setBitcoinWalletType] = useState<BitcoinWalletType | undefined>();
  const [dlcHandler, setDLCHandler] = useState<
    LeatherDLCHandler | UnisatFordefiDLCHandler | LedgerDLCHandler
  >();

  function resetBitcoinWalletContext() {
    setBitcoinWalletContextState(BitcoinWalletContextState.INITIAL);
    setBitcoinWalletType(undefined);
    setDLCHandler(undefined);
  }

  return (
    <BitcoinWalletContext.Provider
      value={{
        bitcoinWalletType,
        setBitcoinWalletType,
        bitcoinWalletContextState,
        setBitcoinWalletContextState,
        dlcHandler,
        setDLCHandler,
        resetBitcoinWalletContext,
      }}
    >
      {children}
    </BitcoinWalletContext.Provider>
  );
}
