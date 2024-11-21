import { useContext, useState } from 'react';

import { Button, VStack, useToast } from '@chakra-ui/react';
import { TransactionScreenWalletInformation } from '@components/transaction-screen/transaction-screen.transaction-form/components/transaction-screen.transaction-form/components/transaction-screen.transaction-form.wallet-information';
import { submitSetupXRPLVaultRequest } from '@functions/attestor-request.functions';
import { useEthersSigner } from '@functions/configuration.functions';
import { useXRPWallet } from '@hooks/use-xrp-wallet';
import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { XRPWalletContext } from '@providers/xrp-wallet-context-provider';
import { setupVault } from 'dlc-btc-lib/ethereum-functions';

import { NetworkType } from '@shared/constants/network.constants';

import { SetupVaultScreenVaultGraphics } from './components/setup-vault-screen.vault-graphics';

export function SetupVaultScreen(): React.JSX.Element {
  const toast = useToast();
  const { networkType } = useContext(NetworkConfigurationContext);
  const { userAddress: rippleUserAddress } = useContext(XRPWalletContext);
  const { handleSetTrustLine, isLoading } = useXRPWallet();

  const { ethereumNetworkConfiguration } = useContext(EthereumNetworkConfigurationContext);
  const { rippleNetworkConfiguration } = useContext(RippleNetworkConfigurationContext);

  const signer = useEthersSigner();

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSetup() {
    try {
      setIsSubmitting(true);
      switch (networkType) {
        case NetworkType.XRPL:
          await handleSetTrustLine();
          await submitSetupXRPLVaultRequest(
            rippleUserAddress!,
            rippleNetworkConfiguration.rippleAttestorChainID
          );
          break;
        case NetworkType.EVM:
          await setupVault(ethereumNetworkConfiguration.dlcManagerContract.connect(signer!));
          break;
        default:
          throw new Error('Unsupported Network Type');
      }
    } catch (error: any) {
      setIsSubmitting(false);
      toast({
        title: 'Failed to create Vault',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  }

  return (
    <VStack w={'45%'}>
      <SetupVaultScreenVaultGraphics />
      <Button
        isLoading={isSubmitting}
        variant={'account'}
        type={'submit'}
        onClick={() => handleSetup()}
      >
        Create Vault
      </Button>
      <TransactionScreenWalletInformation isBitcoinWalletLoading={isLoading} />
    </VStack>
  );
}
