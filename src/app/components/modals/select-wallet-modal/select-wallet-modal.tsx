import { useContext, useEffect, useState } from 'react';

import { CheckIcon } from '@chakra-ui/icons';
import { HStack, ScaleFade, Tab, TabList, Tabs, Text, VStack, useToast } from '@chakra-ui/react';
import { ModalComponentProps } from '@components/modals/components/modal-container';
import { ModalLayout } from '@components/modals/components/modal.layout';
import { SelectNetworkButton } from '@components/select-network-button/select-network-button';
import { TransactionScreenWalletInformation } from '@components/transaction-screen/transaction-screen.transaction-form/components/transaction-screen.transaction-form/components/transaction-screen.transaction-form.wallet-information';
import { useGemWallet } from '@hooks/use-xrpl-gem';
import { useXRPLLedger } from '@hooks/use-xrpl-ledger';
import { RippleNetworkID } from '@models/ripple.models';
import { XRPWalletType, xrpWallets } from '@models/wallet';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { XRPWalletContext, XRPWalletContextState } from '@providers/xrp-wallet-context-provider';
import { EthereumNetworkID } from 'dlc-btc-lib/models';
import { delay } from 'dlc-btc-lib/utilities';
import { Connector, useConfig, useConnect } from 'wagmi';

import { NetworkType } from '@shared/constants/network.constants';

import { SelectEthereumWalletMenu } from './components/select-ethereum-wallet-menu';
import { SelectRippleWalletMenu } from './components/select-ripple-wallet-menu';

function formatErrorMessage(error: string): string {
  if (error.includes('0x6985')) {
    return 'Action Rejected by User';
  } else if (error.includes('0x5515')) {
    return 'Locked Device';
  } else {
    return error;
  }
}

export function SelectWalletModal({ isOpen, handleClose }: ModalComponentProps): React.JSX.Element {
  const toast = useToast();
  const { connect, isPending, isSuccess, connectors } = useConnect();
  const { chains: ethereumNetworks } = useConfig();

  const { setNetworkType } = useContext(NetworkConfigurationContext);
  const {
    setXRPWalletType,
    setXRPWalletContextState,
    setUserAddress,
    xrpWalletContextState,
    setXRPHandler,
  } = useContext(XRPWalletContext);
  const { connectLedgerWallet, isLoading } = useXRPLLedger();
  const { connectGemWallet } = useGemWallet();
  const { enabledRippleNetworks } = useContext(RippleNetworkConfigurationContext);

  const ethereumNetworkIDs = ethereumNetworks.map(
    ethereumNetwork => ethereumNetwork.id.toString() as EthereumNetworkID
  );
  const rippleNetworkIDs = enabledRippleNetworks.map(rippleNetwork => rippleNetwork.id);

  const [selectedNetworkType, setSelectedNetworkType] = useState<NetworkType>(NetworkType.EVM);

  const [selectedNetworkID, setSelectedNetworkID] = useState<
    EthereumNetworkID | RippleNetworkID | undefined
  >(undefined);

  const [selectedWagmiConnectorID, setSelectedWagmiConnectorID] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (isSuccess || xrpWalletContextState === XRPWalletContextState.READY) {
      void handleCloseAfterSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, xrpWalletContextState]);

  async function handleCloseAfterSuccess() {
    await delay(1000);
    setSelectedNetworkID(undefined);
    setSelectedWagmiConnectorID(undefined);
    if (selectedWagmiConnectorID !== 'walletConnect') handleClose();
    setSelectedNetworkType(NetworkType.EVM);
  }

  async function handleConnectEthereumWallet(wagmiConnector: Connector) {
    if (selectedNetworkID === undefined) return;
    setSelectedWagmiConnectorID(wagmiConnector.id);
    connect({ chainId: Number(selectedNetworkID), connector: wagmiConnector });
    setNetworkType(NetworkType.EVM);
    if (wagmiConnector.id === 'walletConnect') {
      handleClose();
    }
  }

  async function handleConnectGemWallet() {
    setNetworkType(NetworkType.XRPL);
    setXRPWalletType(XRPWalletType.Gem);

    const { xrpHandler, userAddress } = await connectGemWallet();

    setXRPHandler(xrpHandler);
    setUserAddress(userAddress);
    setXRPWalletContextState(XRPWalletContextState.READY);
  }

  async function handleConnectLedgerWallet() {
    try {
      setNetworkType(NetworkType.XRPL);
      setXRPWalletType(XRPWalletType.Ledger);

      const { xrpHandler, userAddress } = await connectLedgerWallet("44'/144'/0'/0/0");

      setXRPHandler(xrpHandler);
      setUserAddress(userAddress);
      setXRPWalletContextState(XRPWalletContextState.READY);
    } catch (error: any) {
      toast({
        title: 'Failed to connect Ledger Wallet',
        description: error instanceof Error ? formatErrorMessage(error.message) : '',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  }

  async function handleConnectRippleWallet(xrpWalletType: XRPWalletType) {
    switch (xrpWalletType) {
      case XRPWalletType.Gem:
        await handleConnectGemWallet();
        break;
      case XRPWalletType.Ledger:
        await handleConnectLedgerWallet();
        break;
      default:
        break;
    }
  }

  const handleChangeNetwork = (networkID: EthereumNetworkID | RippleNetworkID) => {
    setSelectedNetworkID(networkID);
  };

  return (
    <ModalLayout title="Connect Wallet" isOpen={isOpen} onClose={() => handleClose()}>
      <VStack alignItems={'start'} spacing={'25px'}>
        {!selectedNetworkID ? (
          <Text variant={'header'}>Select Network</Text>
        ) : (
          <HStack w={'100%'} justifyContent={'space-between'}>
            <Text variant={'header'}>Network Selected</Text>
            <CheckIcon color={'accent.lightBlue.01'} />
          </HStack>
        )}
        <Tabs
          w={'100%'}
          p={'0px'}
          h={'25px'}
          justifyContent={'space-between'}
          onChange={index => {
            setSelectedNetworkType(index === 0 ? NetworkType.EVM : NetworkType.XRPL);
            setSelectedNetworkID(undefined);
          }}
        >
          <TabList>
            <Tab>Ethereum</Tab>
            <Tab>XRPL</Tab>
          </TabList>
        </Tabs>
        <SelectNetworkButton
          handleChangeNetwork={handleChangeNetwork}
          ethereumNetworkIDs={ethereumNetworkIDs}
          rippleNetworkIDs={rippleNetworkIDs}
          selectedNetworkID={selectedNetworkID}
          selectedNetworkType={selectedNetworkType}
        />
        <ScaleFade in={!!selectedNetworkID} transition={{ enter: { delay: 0.15 } }} unmountOnExit>
          <VStack alignItems={'start'} spacing={'25px'}>
            {!isSuccess ? (
              <Text variant={'header'}>Select Wallet</Text>
            ) : (
              <HStack w={'100%'} justifyContent={'space-between'}>
                <Text variant={'header'}>Wallet Connected</Text>
                <CheckIcon color={'accent.lightBlue.01'} />
              </HStack>
            )}
            {selectedNetworkType === NetworkType.EVM
              ? connectors.map(wagmiConnector => (
                  <SelectEthereumWalletMenu
                    key={wagmiConnector.id}
                    wagmiConnector={wagmiConnector}
                    selectedWagmiConnectorID={selectedWagmiConnectorID}
                    isConnectWalletPending={isPending}
                    isConnectWalletSuccess={isSuccess}
                    handleConnectWallet={handleConnectEthereumWallet}
                  />
                ))
              : xrpWallets.map(rippleWallet => (
                  <SelectRippleWalletMenu
                    key={rippleWallet.id}
                    rippleWallet={rippleWallet}
                    handleConnectWallet={handleConnectRippleWallet}
                  />
                ))}
            <TransactionScreenWalletInformation isBitcoinWalletLoading={isLoading} />
          </VStack>
        </ScaleFade>
      </VStack>
    </ModalLayout>
  );
}
