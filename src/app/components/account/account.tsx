import { useContext } from 'react';
import { useDispatch } from 'react-redux';

import { Button, HStack, useBreakpointValue } from '@chakra-ui/react';
import { AccountMenu } from '@components/account/components/account-menu';
import { XRPWallet, xrpWallets } from '@models/wallet';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { NetworkConnectionContext } from '@providers/network-connection.provider';
import { XRPWalletContext } from '@providers/xrp-wallet-context-provider';
import { mintUnmintActions } from '@store/slices/mintunmint/mintunmint.actions';
import { modalActions } from '@store/slices/modal/modal.actions';
import { Connector, useAccount, useDisconnect } from 'wagmi';

import { NetworkType } from '@shared/constants/network.constants';

export function Account(): React.JSX.Element {
  const dispatch = useDispatch();

  const { isConnected } = useContext(NetworkConnectionContext);
  const { networkType } = useContext(NetworkConfigurationContext);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const { address: ethereumUserAddress, connector: ethereumWallet } = useAccount();
  const { disconnect: disconnectEthereumWallet } = useDisconnect();
  const {
    userAddress: rippleUserAddress,
    xrpWalletType,
    resetXRPWalletContext,
  } = useContext(XRPWalletContext);

  function getWalletInformation(): { address: string; wallet: XRPWallet | Connector } | undefined {
    switch (networkType) {
      case NetworkType.EVM:
        if (!ethereumUserAddress || !ethereumWallet) return undefined;
        return { address: ethereumUserAddress, wallet: ethereumWallet };
      case NetworkType.XRPL:
        if (!rippleUserAddress) return undefined;
        return {
          address: rippleUserAddress,
          wallet: xrpWallets.find(xrpWallet => xrpWallet.id === xrpWalletType)!,
        };
      default:
        throw new Error('Invalid Network Type');
    }
  }

  function onConnectWalletClick(): void {
    dispatch(modalActions.toggleSelectWalletModalVisibility());
  }

  function onDisconnectWalletClick(): void {
    switch (networkType) {
      case NetworkType.EVM:
        disconnectEthereumWallet();
        break;
      case NetworkType.XRPL:
        resetXRPWalletContext();
        break;
      default:
        break;
    }
    dispatch(mintUnmintActions.resetMintUnmintState());
  }

  return (
    <HStack h={'50px'}>
      {isConnected ? (
        <AccountMenu
          address={getWalletInformation()?.address}
          wallet={getWalletInformation()?.wallet}
          handleDisconnectWallet={() => onDisconnectWalletClick()}
        />
      ) : (
        <Button
          variant={'account'}
          onClick={() => onConnectWalletClick()}
          h={'50px'}
          w={isMobile ? '150px' : '275px'}
          fontSize={isMobile ? 'md' : 'lg'}
        >
          Connect Wallet
        </Button>
      )}
    </HStack>
  );
}
