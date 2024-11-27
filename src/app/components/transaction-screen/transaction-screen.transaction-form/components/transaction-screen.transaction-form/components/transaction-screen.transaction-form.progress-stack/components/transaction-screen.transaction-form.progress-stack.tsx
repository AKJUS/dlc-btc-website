import { HStack, VStack } from '@chakra-ui/react';
import { VaultVerticalProgressBar } from '@components/vault/components/vault-vertical-progress-bar';
import { TransactionFormAPI } from '@models/form.models';

import { TransactionFormInputField } from '../../transaction-screen.transaction-form.input';
import { TransactionFormProgressStackItem } from '../../transaction-screen.transaction-form.progress-step-stack-item';

interface ProgressStackItemProps {
  label: string;
  assetLogo: string;
  assetSymbol: string;
}

const componentsMap = {
  mint: {
    A: { label: 'Deposit', assetLogo: '/images/logos/bitcoin-logo.svg', assetSymbol: 'BTC' },
    B: { label: 'Mint', assetLogo: '/images/logos/ibtc-logo.svg', assetSymbol: 'iBTC' },
  },
  burn: {
    A: { label: 'Burn', assetLogo: '/images/logos/ibtc-logo.svg', assetSymbol: 'iBTC' },
    B: { label: 'Withdraw', assetLogo: '/images/logos/bitcoin-logo.svg', assetSymbol: 'BTC' },
  },
};

interface ProgressStackProps {
  formAPI: TransactionFormAPI;
  isIncludeForm: boolean;
  flow: 'mint' | 'burn';
  currentStep: number;
  activeStackItem: 0 | 1;
  currentBitcoinPrice: number;
  components: { A: ProgressStackItemProps; B: ProgressStackItemProps };
}

const ProgressStack = ({
  formAPI,
  isIncludeForm,
  flow,
  currentStep,
  activeStackItem,
  currentBitcoinPrice,
  components,
}: ProgressStackProps): React.JSX.Element => {
  const { A, B } = components;

  return (
    <VStack w="85%">
      {isIncludeForm ? (
        <>
          <TransactionFormInputField
            formAPI={formAPI}
            currentStep={currentStep}
            currentBitcoinPrice={currentBitcoinPrice}
            formType={flow}
          />
          <TransactionFormProgressStackItem
            label={B.label}
            assetLogo={B.assetLogo}
            assetSymbol={B.assetSymbol}
            isActive={activeStackItem === 1}
          />
        </>
      ) : (
        <>
          <TransactionFormProgressStackItem
            label={A.label}
            assetLogo={A.assetLogo}
            assetSymbol={A.assetSymbol}
            isActive={activeStackItem === 0}
          />
          <TransactionFormProgressStackItem
            label={B.label}
            assetLogo={B.assetLogo}
            assetSymbol={B.assetSymbol}
            isActive={activeStackItem === 1}
          />
        </>
      )}
    </VStack>
  );
};

interface ProgressStackByFlowProps {
  formAPI: TransactionFormAPI;
  flow: 'mint' | 'burn';
  currentStep: number;
  confirmations?: number;
  currentBitcoinPrice: number;
}

const ProgressStackByFlow = ({
  formAPI,
  flow,
  currentStep,
  confirmations = 0,
  currentBitcoinPrice,
}: ProgressStackByFlowProps): React.JSX.Element => {
  const components = componentsMap[flow];
  const isIncludeForm = flow === 'mint' ? currentStep === 1 : currentStep === 0;
  const activeStackItem = isIncludeForm || (flow === 'mint' && confirmations < 6) ? 0 : 1;

  return (
    <ProgressStack
      formAPI={formAPI}
      isIncludeForm={isIncludeForm}
      flow={flow}
      currentStep={currentStep}
      activeStackItem={activeStackItem}
      currentBitcoinPrice={currentBitcoinPrice}
      components={components}
    />
  );
};

interface TransactionFormProgressStackBurnVariantAProps {
  formAPI: TransactionFormAPI;
  flow: 'mint' | 'burn';
  currentBitcoinPrice: number;
  currentStep: number;
  confirmations?: number;
}

export const TransactionFormProgressStack = ({
  formAPI,
  flow,
  currentStep,
  confirmations = 0,
  currentBitcoinPrice,
}: TransactionFormProgressStackBurnVariantAProps): React.JSX.Element => {
  return (
    <HStack
      w="100%"
      p="15px 15px 15px 0"
      bg="white.04"
      border="1px solid"
      borderColor="white.03"
      borderRadius="md"
      justifyContent="space-between"
    >
      <VaultVerticalProgressBar
        currentStep={currentStep}
        flow={flow}
        confirmations={confirmations}
      />
      <ProgressStackByFlow
        formAPI={formAPI}
        flow={flow}
        currentStep={currentStep}
        confirmations={confirmations}
        currentBitcoinPrice={currentBitcoinPrice}
      />
    </HStack>
  );
};
