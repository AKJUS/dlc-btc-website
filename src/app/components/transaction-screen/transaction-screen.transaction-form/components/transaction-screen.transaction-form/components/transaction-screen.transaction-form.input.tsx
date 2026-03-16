import { Text, VStack } from '@chakra-ui/react';
import { TransactionFormAPI } from '@models/form.models';

import { TransactionFormFieldInput } from './transaction-screen.transaction-form.field-input';
import { TransactionFormInputUSDText } from './transaction-screen.transaction-form.input-usd-text';
import { VaultTransactionFormWarning } from './transaction-screen.transaction-form.warning';

const bitcoinDepositFormProperties = {
  label: 'Deposit BTC',
  logo: '/images/logos/bitcoin-logo.svg',
  symbol: 'BTC',
  color: 'orange.01',
};
const bitcoinWithdrawFormProperties = {
  label: 'Withdraw BTC',
  logo: '/images/logos/bitcoin-logo.svg',
  symbol: 'BTC',
  color: 'orange.01',
};
const tokenFormProperties = {
  label: 'Burn iBTC',
  logo: '/images/logos/ibtc-logo.svg',
  symbol: 'iBTC',
  color: 'purple.01',
};

export function getFormProperties(
  flow: 'mint' | 'burn',
  currentStep: number,
  isBitsafeWithdraw?: boolean
): {
  label: string;
  logo: string;
  symbol: string;
  color: string;
} {
  switch (flow) {
    case 'mint':
      return bitcoinDepositFormProperties;
    case 'burn':
      if (currentStep === 1) {
        return isBitsafeWithdraw ? bitcoinWithdrawFormProperties : bitcoinDepositFormProperties;
      }
      return tokenFormProperties;
    default:
      throw new Error('Invalid Flow Type');
  }
}

interface TransactionFormInputFieldProps {
  formAPI: TransactionFormAPI;
  currentStep: number;
  formType: 'mint' | 'burn';
  currentBitcoinPrice: number;
  maxAmount?: number;
  isBitsafeWithdraw?: boolean;
}

export function TransactionFormInputField({
  formAPI,
  currentStep,
  currentBitcoinPrice,
  formType,
  maxAmount,
  isBitsafeWithdraw,
}: TransactionFormInputFieldProps): React.JSX.Element {
  const formProperties = getFormProperties(formType, currentStep, isBitsafeWithdraw);
  return (
    <formAPI.Field name={'assetAmount'}>
      {field => (
        <VStack
          w={'100%'}
          p={'15px'}
          bg={'white.04'}
          border={'1px solid'}
          borderColor={'white.03'}
          borderRadius={'md'}
        >
          <Text w={'100%'} fontSize={'sm'} fontWeight={'bold'} color={'accent.lightBlue.01'}>
            {formProperties.label}
          </Text>
          <TransactionFormFieldInput
            assetLogo={formProperties.logo}
            assetSymbol={formProperties.symbol}
            formField={field}
            maxAmount={maxAmount}
          />
          <TransactionFormInputUSDText
            errors={field.state.meta.errors}
            assetAmount={field.state.value}
            currentBitcoinPrice={currentBitcoinPrice}
          />
          <VaultTransactionFormWarning formErrors={field.state.meta.errors} />
        </VStack>
      )}
    </formAPI.Field>
  );
}
