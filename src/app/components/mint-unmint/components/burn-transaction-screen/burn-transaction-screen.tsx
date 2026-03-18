import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, HStack, Switch, Text, VStack, useToast } from '@chakra-ui/react';
import { VaultTransactionForm } from '@components/transaction-screen/transaction-screen.transaction-form/components/transaction-screen.transaction-form/transaction-screen.transaction-form';
import { Vault } from '@components/vault/vault';
import { useEthersSigner } from '@functions/configuration.functions';
import { useXRPWallet } from '@hooks/use-xrp-wallet';
import { BitcoinWalletContext } from '@providers/bitcoin-wallet-context-provider';
import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { ProofOfReserveContext } from '@providers/proof-of-reserve-context-provider';
import { RiskContext } from '@providers/risk.provider';
import { RootState } from '@store/index';
import { mintUnmintActions } from '@store/slices/mintunmint/mintunmint.actions';
import { RedeemSteps } from '@store/slices/mintunmint/mintunmint.slice';
import { getBitsafeAddress } from 'dlc-btc-lib/attestor-request-functions';
import { withdraw } from 'dlc-btc-lib/ethereum-functions';
import { shiftValue } from 'dlc-btc-lib/utilities';

import { NetworkType } from '@shared/constants/network.constants';

interface BurnTokenTransactionFormProps {
  isBitcoinWalletLoading: [boolean, string];
}

export function BurnTokenTransactionForm({
  isBitcoinWalletLoading,
}: BurnTokenTransactionFormProps): React.JSX.Element {
  const toast = useToast();
  const dispatch = useDispatch();

  const { networkType } = useContext(NetworkConfigurationContext);
  const { bitcoinWalletContextState } = useContext(BitcoinWalletContext);
  const { handleCreateCheck, isLoading } = useXRPWallet();

  const { bitcoinPrice, depositLimit } = useContext(ProofOfReserveContext);

  const { ethereumNetworkConfiguration } = useContext(EthereumNetworkConfigurationContext);

  const signer = useEthersSigner();

  const { unmintStep, isBitsafeWithdraw } = useSelector((state: RootState) => state.mintunmint);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBitsafeAvailable, setIsBitsafeAvailable] = useState(false);

  const { coordinatorURL } = appConfiguration;

  useEffect(() => {
    const checkBitsafeAvailability = async () => {
      try {
        await getBitsafeAddress(coordinatorURL);
        setIsBitsafeAvailable(true);
      } catch {
        setIsBitsafeAvailable(false);
      }
    };
    void checkBitsafeAvailability();
  }, [coordinatorURL]);

  const {
    risk,
    fetchUserAddressRisk,
    isLoading: isRiskLoading,
    isRiskCheckingEnabled,
  } = useContext(RiskContext);

  const currentVault = unmintStep.vault;

  function handleBitsafeToggle() {
    dispatch(mintUnmintActions.setIsBitsafeWithdraw(!isBitsafeWithdraw));
  }

  async function handleButtonClick(withdrawAmount: number): Promise<void> {
    try {
      if (!currentVault) return;
      setIsSubmitting(true);

      // If Bitsafe withdrawal is enabled, skip the burn and go directly to withdraw step
      if (isBitsafeWithdraw) {
        dispatch(
          mintUnmintActions.setUnmintStep({ step: RedeemSteps.WITHDRAW, vault: currentVault })
        );
        setIsSubmitting(false);
        return;
      }

      if (networkType === NetworkType.XRPL) {
        await handleCreateCheck(currentVault.uuid, withdrawAmount);
      } else if (networkType === NetworkType.EVM) {
        const currentRisk = isRiskCheckingEnabled ? await fetchUserAddressRisk() : 'Low';
        if (currentRisk === 'High') throw new Error('Risk Level is too high');
        const formattedWithdrawAmount = BigInt(shiftValue(withdrawAmount));

        await withdraw(
          ethereumNetworkConfiguration.dlcManagerContract.connect(signer!),
          currentVault.uuid,
          formattedWithdrawAmount
        );
      } else {
        throw new Error('Unsupported Network Type');
      }
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: 'Failed to sign Transaction',
        description: error instanceof Error ? error.message : '',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  }

  function handleCancel() {
    dispatch(mintUnmintActions.setUnmintStep({ step: RedeemSteps.BURN, vault: undefined }));
  }

  return (
    <VStack w={'45%'} spacing={'15px'}>
      <Vault vault={currentVault!} variant={'selected'} />
      <Box
        w={'100%'}
        p={4}
        bg={'background.content.01'}
        borderRadius={'md'}
        border={'1px solid'}
        borderColor={'border.white.01'}
      >
        <HStack justify={'space-between'} align={'start'}>
          <Box>
            <Text color={'white'} fontWeight={600} fontSize={'sm'}>
              Withdraw BTC to Bitsafe (skip iBTC burn)
            </Text>
            <Text color={'white.03'} fontSize={'xs'} mt={1}>
              {!isBitsafeAvailable
                ? 'Bitsafe withdrawal is not available. The attestor has not configured a Bitsafe address.'
                : isBitsafeWithdraw
                  ? 'Your BTC will be sent directly to the Bitsafe address. Your iBTC will remain in your wallet but will no longer be backed by BTC.'
                  : 'Enable this option to withdraw your BTC without burning iBTC first. Only use this if you are participating in the iBTC sunset program.'}
            </Text>
          </Box>
          <Switch
            isChecked={isBitsafeWithdraw}
            onChange={handleBitsafeToggle}
            isDisabled={!isBitsafeAvailable}
            colorScheme={'blue'}
            size={'md'}
          />
        </HStack>
      </Box>
      <VaultTransactionForm
        vault={currentVault!}
        flow={'burn'}
        currentStep={unmintStep.step}
        currentBitcoinPrice={bitcoinPrice}
        handleButtonClick={handleButtonClick}
        depositLimit={depositLimit}
        bitcoinWalletContextState={bitcoinWalletContextState}
        isBitcoinWalletLoading={
          currentVault?.valueLocked === currentVault?.valueMinted
            ? isLoading
            : isBitcoinWalletLoading
        }
        userEthereumAddressRiskLevel={risk}
        isUserEthereumAddressRiskLevelLoading={isRiskLoading}
        handleCancelButtonClick={handleCancel}
        isSubmitting={isSubmitting}
        isBitsafeWithdraw={isBitsafeWithdraw}
      />
    </VStack>
  );
}
