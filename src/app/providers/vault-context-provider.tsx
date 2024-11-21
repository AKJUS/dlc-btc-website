import { createContext, useContext } from 'react';

import { useEVMVaults } from '@hooks/use-evm-vaults';
import { useXRPLVaults } from '@hooks/use-xrpl-vaults';
import { HasChildren } from '@models/has-children';
import { Vault } from '@models/vault';

import { NetworkType } from '@shared/constants/network.constants';

import { NetworkConfigurationContext } from './network-configuration.provider';

interface VaultContextType {
  allVaults: Vault[];
  readyVaults: Vault[];
  pendingVaults: Vault[];
  fundedVaults: Vault[];
  closingVaults: Vault[];
  closedVaults: Vault[];
}

export const VaultContext = createContext<VaultContextType>({
  allVaults: [],
  readyVaults: [],
  pendingVaults: [],
  fundedVaults: [],
  closingVaults: [],
  closedVaults: [],
});

export function VaultContextProvider({ children }: HasChildren): React.JSX.Element {
  const xrplVaults = useXRPLVaults();
  const evmVaults = useEVMVaults();
  const { networkType } = useContext(NetworkConfigurationContext);

  const getVaults = (vaultType: keyof VaultContextType) =>
    networkType === NetworkType.EVM ? evmVaults[vaultType] : xrplVaults[vaultType];

  return (
    <VaultContext.Provider
      value={{
        allVaults: getVaults('allVaults'),
        readyVaults: getVaults('readyVaults'),
        pendingVaults: getVaults('pendingVaults'),
        fundedVaults: getVaults('fundedVaults'),
        closingVaults: getVaults('closingVaults'),
        closedVaults: getVaults('closedVaults'),
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}
