import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { XRPWalletContext, XRPWalletContextState } from '@providers/xrp-wallet-context-provider';
import { useQuery } from '@tanstack/react-query';
import { isUserWhitelisted, isWhitelistingEnabled } from 'dlc-btc-lib/ethereum-functions';
import { useAccount } from 'wagmi';

import { NetworkType } from '@shared/constants/network.constants';

interface UseActiveTabsReturnType {
  isActiveTabs: boolean;
}

export function useActiveTabs(): UseActiveTabsReturnType {
  const navigate = useNavigate();
  const { chain, address } = useAccount();
  const { isEthereumNetworkConfigurationLoading, ethereumNetworkConfiguration } = useContext(
    EthereumNetworkConfigurationContext
  );

  const { isRippleNetworkConfigurationLoading } = useContext(RippleNetworkConfigurationContext);
  const { xrpWalletContextState } = useContext(XRPWalletContext);
  const { networkType } = useContext(NetworkConfigurationContext);

  async function shouldActivateTabs(): Promise<boolean> {
    if (networkType === NetworkType.EVM) {
      if (!address || !chain) {
        navigate('/mint-withdraw');
        return false;
      }
      const dlcManagerContract = ethereumNetworkConfiguration.dlcManagerContract;
      if (!(await isWhitelistingEnabled(dlcManagerContract))) return true;
      return await isUserWhitelisted(dlcManagerContract, address);
    } else {
      navigate('/mint-withdraw');
      return xrpWalletContextState === XRPWalletContextState.READY;
    }
  }

  const { data: isActiveTabs } = useQuery({
    queryKey: ['activeTabs', chain, address, networkType, xrpWalletContextState],
    queryFn: shouldActivateTabs,
    enabled:
      networkType === NetworkType.EVM
        ? !isEthereumNetworkConfigurationLoading && ethereumNetworkConfiguration.chain == chain
        : !isRippleNetworkConfigurationLoading,
  });

  return {
    isActiveTabs: isActiveTabs ?? false,
  };
}
