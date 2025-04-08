import { createContext } from 'react';

import { useRisk } from '@hooks/use-risk';
import { HasChildren } from '@models/has-children';

interface RiskContextProvider {
  risk: string | undefined;
  fetchUserAddressRisk: () => Promise<string>;
  isLoading: boolean;
  isRiskCheckingEnabled: boolean;
}

export const RiskContext = createContext<RiskContextProvider>({
  risk: undefined,
  fetchUserAddressRisk: () => Promise.resolve('Low'),
  isLoading: false,
  isRiskCheckingEnabled: false,
});

export function RiskContextProvider({ children }: HasChildren): React.JSX.Element {
  const { risk, fetchUserAddressRisk, isLoading, isRiskCheckingEnabled } = useRisk();

  return (
    <RiskContext.Provider
      value={{
        risk,
        fetchUserAddressRisk,
        isLoading,
        isRiskCheckingEnabled,
      }}
    >
      {children}
    </RiskContext.Provider>
  );
}
