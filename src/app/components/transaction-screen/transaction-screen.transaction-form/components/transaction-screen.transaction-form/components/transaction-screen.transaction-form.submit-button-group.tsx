import { Button, VStack } from '@chakra-ui/react';
import { TransactionFormAPI } from '@models/form.models';
import { BitcoinWalletContextState } from '@providers/bitcoin-wallet-context-provider';
import { RedeemSteps } from '@store/slices/mintunmint/mintunmint.slice';

import { getFormProperties } from './transaction-screen.transaction-form.input';

function getButtonLabel(
  flow: 'mint' | 'burn',
  currentStep: number,
  isSubmitting: boolean,
  walletState: BitcoinWalletContextState,
  isBitsafeWithdraw?: boolean
): string {
  if (isSubmitting) return 'Processing';

  const isWalletReady = walletState === BitcoinWalletContextState.READY;
  const isCurrentStepZero = currentStep === 0;

  switch (flow) {
    case 'burn':
      return isCurrentStepZero
        ? isBitsafeWithdraw
          ? 'Proceed to BTC Withdrawal'
          : 'Sign Burn Transaction'
        : isWalletReady
          ? 'Sign Withdraw Transaction'
          : 'Connect Bitcoin Wallet';

    case 'mint':
      return isWalletReady ? 'Sign Deposit Transaction' : 'Connect Bitcoin Wallet';
    default:
      throw new Error('Invalid Flow Type');
  }
}

interface TransactionFormSubmitButtonGroupProps {
  flow: 'mint' | 'burn';
  formAPI: TransactionFormAPI;
  currentStep: number;
  userEthereumAddressRiskLevel: string;
  bitcoinWalletContextState: any;
  handleCancelButtonClick: () => void;
  isSubmitting: boolean;
  isBitsafeWithdraw?: boolean;
}

export function TransactionFormSubmitButtonGroup({
  flow,
  formAPI,
  currentStep,
  userEthereumAddressRiskLevel,
  bitcoinWalletContextState,
  handleCancelButtonClick,
  isSubmitting,
  isBitsafeWithdraw,
}: TransactionFormSubmitButtonGroupProps): React.JSX.Element {
  const isButtonDisabledByRiskLevel =
    flow === 'burn' && currentStep === RedeemSteps.BURN && userEthereumAddressRiskLevel === 'High';

  const formProperties = getFormProperties(flow, currentStep);
  return (
    <VStack w={'100%'} spacing={'15px'}>
      <formAPI.Subscribe
        selector={state => [state.canSubmit]}
        children={([canSubmit]) => (
          <Button
            w={'100%'}
            p={'25px'}
            fontSize={'md'}
            color={'white.01'}
            bgColor={formProperties.color}
            _hover={{ bgColor: 'accent.lightBlue.01' }}
            type="submit"
            isDisabled={!canSubmit || isSubmitting || isButtonDisabledByRiskLevel}
          >
            {getButtonLabel(
              flow,
              currentStep,
              isSubmitting,
              bitcoinWalletContextState,
              isBitsafeWithdraw
            )}
          </Button>
        )}
      />
      <Button
        fontSize={'md'}
        isLoading={isSubmitting}
        variant={'navigate'}
        onClick={handleCancelButtonClick}
      >
        Cancel
      </Button>
    </VStack>
  );
}
