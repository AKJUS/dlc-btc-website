import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { VStack, useToast } from '@chakra-ui/react';
import { VaultTransactionForm } from '@components/transaction-screen/transaction-screen.transaction-form/components/transaction-screen.transaction-form/transaction-screen.transaction-form';
import { Vault } from '@components/vault/vault';
import {
  BitcoinWalletContext,
  BitcoinWalletContextState,
} from '@providers/bitcoin-wallet-context-provider';
import { ProofOfReserveContext } from '@providers/proof-of-reserve-context-provider';
import { RootState } from '@store/index';
import { mintUnmintActions } from '@store/slices/mintunmint/mintunmint.actions';
import { RedeemSteps } from '@store/slices/mintunmint/mintunmint.slice';
import { modalActions } from '@store/slices/modal/modal.actions';

interface WithdrawScreenProps {
  handleSignWithdrawTransaction: (vaultUUID: string, withdrawAmount: number) => Promise<void>;
  isBitcoinWalletLoading: [boolean, string];
}

export function WithdrawScreen({
  handleSignWithdrawTransaction,
  isBitcoinWalletLoading,
}: WithdrawScreenProps): React.JSX.Element {
  const dispatch = useDispatch();
  const toast = useToast();

  const { bitcoinWalletContextState, resetBitcoinWalletContext } = useContext(BitcoinWalletContext);

  const { bitcoinPrice, depositLimit } = useContext(ProofOfReserveContext);

  const { unmintStep, isBitsafeWithdraw, bitsafeWithdrawAmount } = useSelector(
    (state: RootState) => state.mintunmint
  );

  const currentVault = unmintStep.vault;

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (unmintStep.step === RedeemSteps.PENDING) {
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unmintStep.step]);

  async function handleWithdraw(withdrawAmount: number): Promise<void> {
    if (currentVault) {
      try {
        setIsSubmitting(true);
        await handleSignWithdrawTransaction(currentVault.uuid, withdrawAmount);
        if (isBitsafeWithdraw) {
          setIsSubmitting(false);
        }
      } catch (error) {
        setIsSubmitting(false);
        toast({
          title: 'Failed to sign transaction',
          description: error instanceof Error ? error.message : '',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    }
  }

  function handleConnect() {
    dispatch(modalActions.toggleSelectBitcoinWalletModalVisibility());
  }

  function handleCancel() {
    resetBitcoinWalletContext();
    dispatch(mintUnmintActions.setUnmintStep({ step: RedeemSteps.BURN, vault: undefined }));
  }

  async function handleButtonClick(assetAmount: number) {
    bitcoinWalletContextState === BitcoinWalletContextState.READY
      ? await handleWithdraw(assetAmount)
      : handleConnect();
  }

  return (
    <VStack w={'45%'} spacing={'15px'}>
      <Vault vault={currentVault!} variant={'selected'} />
      <VaultTransactionForm
        vault={currentVault!}
        flow={'burn'}
        currentStep={unmintStep.step}
        currentBitcoinPrice={bitcoinPrice}
        bitcoinWalletContextState={bitcoinWalletContextState}
        isBitcoinWalletLoading={isBitcoinWalletLoading}
        handleButtonClick={handleButtonClick}
        handleCancelButtonClick={handleCancel}
        depositLimit={depositLimit}
        isSubmitting={isSubmitting}
        isBitsafeWithdraw={isBitsafeWithdraw}
        initialAmount={isBitsafeWithdraw ? bitsafeWithdrawAmount : undefined}
      />
    </VStack>
  );
}
