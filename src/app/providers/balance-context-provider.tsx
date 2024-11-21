import { createContext, useContext } from 'react';

import { HasChildren } from '@models/has-children';
import { useQuery } from '@tanstack/react-query';
import {
  getAddressDLCBTCBalance,
  getAllAddressVaults,
  getLockedBTCBalance,
} from 'dlc-btc-lib/ethereum-functions';
import { useAccount } from 'wagmi';

import { NetworkType } from '@shared/constants/network.constants';

import { EthereumNetworkConfigurationContext } from './ethereum-network-configuration.provider';
import { NetworkConfigurationContext } from './network-configuration.provider';
import { NetworkConnectionContext } from './network-connection.provider';
import { XRPWalletContext } from './xrp-wallet-context-provider';

interface VaultContextType {
  dlcBTCBalance: number | undefined;
  lockedBTCBalance: number | undefined;
}

export const BalanceContext = createContext<VaultContextType>({
  dlcBTCBalance: undefined,
  lockedBTCBalance: undefined,
});

export function BalanceContextProvider({ children }: HasChildren): React.JSX.Element {
  const {
    ethereumNetworkConfiguration: { dlcBTCContract, dlcManagerContract },
  } = useContext(EthereumNetworkConfigurationContext);
  const { networkType } = useContext(NetworkConfigurationContext);
  const { isConnected } = useContext(NetworkConnectionContext);
  const { userAddress } = useContext(XRPWalletContext);
  const { xrpHandler } = useContext(XRPWalletContext);

  const { address: ethereumUserAddress } = useAccount();

  const fetchEVMBalances = async () => {
    const dlcBTCBalance = await getAddressDLCBTCBalance(dlcBTCContract, ethereumUserAddress!);

    const lockedBTCBalance = await getLockedBTCBalance(
      await getAllAddressVaults(dlcManagerContract, ethereumUserAddress!)
    );

    return { dlcBTCBalance, lockedBTCBalance };
  };

  const fetchXRPLBalances = async () => {
    const dlcBTCBalance = await xrpHandler?.getDLCBTCBalance();
    const lockedBTCBalance = await xrpHandler?.getLockedBTCBalance();
    return { dlcBTCBalance, lockedBTCBalance };
  };

  const { data } = useQuery({
    queryKey: ['balances', networkType === NetworkType.EVM ? ethereumUserAddress : userAddress],
    queryFn: networkType === NetworkType.EVM ? fetchEVMBalances : fetchXRPLBalances,
    enabled: isConnected,
    refetchInterval: 10000,
  });

  return (
    <BalanceContext.Provider
      value={{ dlcBTCBalance: data?.dlcBTCBalance, lockedBTCBalance: data?.lockedBTCBalance }}
    >
      {children}
    </BalanceContext.Provider>
  );
}
