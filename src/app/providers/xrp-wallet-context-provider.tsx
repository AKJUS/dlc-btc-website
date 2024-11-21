import { createContext, useState } from 'react';

import { HasChildren } from '@models/has-children';
import { XRPWalletType } from '@models/wallet';
import { GemXRPHandler, LedgerXRPHandler } from 'dlc-btc-lib';

export enum XRPWalletContextState {
  INITIAL = 0,
  SELECTED = 1,
  READY = 2,
}

interface XRPWalletContextProviderType {
  xrpWalletType: XRPWalletType | undefined;
  setXRPWalletType: React.Dispatch<React.SetStateAction<XRPWalletType | undefined>>;
  xrpWalletContextState: XRPWalletContextState;
  setXRPWalletContextState: React.Dispatch<React.SetStateAction<XRPWalletContextState>>;
  xrpHandler: LedgerXRPHandler | GemXRPHandler | undefined;
  setXRPHandler: React.Dispatch<React.SetStateAction<LedgerXRPHandler | GemXRPHandler | undefined>>;
  setUserAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  userAddress: string | undefined;
  resetXRPWalletContext: () => void;
}

export const XRPWalletContext = createContext<XRPWalletContextProviderType>({
  xrpWalletType: undefined,
  setXRPWalletType: () => {},
  xrpWalletContextState: XRPWalletContextState.INITIAL,
  setXRPWalletContextState: () => {},
  xrpHandler: undefined,
  setXRPHandler: () => {},
  setUserAddress: () => {},
  userAddress: undefined,
  resetXRPWalletContext: () => {},
});

export function XRPWalletContextProvider({ children }: HasChildren): React.JSX.Element {
  const [xrpWalletContextState, setXRPWalletContextState] = useState<XRPWalletContextState>(
    XRPWalletContextState.INITIAL
  );
  const [xrpWalletType, setXRPWalletType] = useState<XRPWalletType | undefined>(
    XRPWalletType.Ledger
  );
  const [xrpHandler, setXRPHandler] = useState<LedgerXRPHandler | GemXRPHandler>();
  const [userAddress, setUserAddress] = useState<string | undefined>(undefined);

  function resetXRPWalletContext() {
    setXRPWalletContextState(XRPWalletContextState.INITIAL);
    setXRPWalletType(undefined);
    setXRPHandler(undefined);
    setUserAddress(undefined);
  }

  return (
    <XRPWalletContext.Provider
      value={{
        xrpWalletType,
        setXRPWalletType,
        xrpWalletContextState,
        setXRPWalletContextState,
        xrpHandler,
        setXRPHandler,
        setUserAddress,
        userAddress,
        resetXRPWalletContext,
      }}
    >
      {children}
    </XRPWalletContext.Provider>
  );
}
