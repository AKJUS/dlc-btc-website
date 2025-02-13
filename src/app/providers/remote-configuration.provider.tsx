import { createContext } from 'react';

import { useExtendedAttestorGroupPublicKey } from '@hooks/use-extended-attestor-group-public-key';
import { useFeeRecipient } from '@hooks/use-fee-recipient';
import { HasChildren } from '@models/has-children';

interface ChainDataContextType {
  extendedAttestorGroupPublicKey?: string;
  isExtendedAttestorGroupPublicKeyLoading?: boolean;
  isExtendedAttestorGroupPublicKeyError?: boolean;
  extendedAttestorGroupPublicKeyError: Error | null;
  feeRecipient?: string;
  isFeeRecipientLoading?: boolean;
  isFeeRecipientError?: boolean;
  feeRecipientError?: Error | null;
}

export const ChainDataContext = createContext<ChainDataContextType>({
  extendedAttestorGroupPublicKey: undefined,
  isExtendedAttestorGroupPublicKeyLoading: undefined,
  isExtendedAttestorGroupPublicKeyError: undefined,
  extendedAttestorGroupPublicKeyError: null,
  feeRecipient: undefined,
  isFeeRecipientLoading: undefined,
  isFeeRecipientError: undefined,
  feeRecipientError: null,
});

export function ChainDataProvider({ children }: HasChildren): React.JSX.Element {
  const {
    data: extendedAttestorGroupPublicKey,
    isLoading: isExtendedAttestorGroupPublicKeyLoading,
    isError: isExtendedAttestorGroupPublicKeyError,
    error: extendedAttestorGroupPublicKeyError,
  } = useExtendedAttestorGroupPublicKey();

  const {
    data: feeRecipient,
    isLoading: isFeeRecipientLoading,
    isError: isFeeRecipientError,
    error: feeRecipientError,
  } = useFeeRecipient();

  return (
    <ChainDataContext.Provider
      value={{
        extendedAttestorGroupPublicKey,
        isExtendedAttestorGroupPublicKeyLoading,
        isExtendedAttestorGroupPublicKeyError,
        extendedAttestorGroupPublicKeyError,
        feeRecipient,
        isFeeRecipientLoading,
        isFeeRecipientError,
        feeRecipientError,
      }}
    >
      {children}
    </ChainDataContext.Provider>
  );
}
