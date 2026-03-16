import { HStack, VStack } from '@chakra-ui/react';
import { VaultVerticalProgressBar } from '@components/vault/components/vault-vertical-progress-bar';
import { TransactionFormAPI } from '@models/form.models';
import { MintSteps, RedeemSteps } from '@store/slices/mintunmint/mintunmint.slice';
import Decimal from 'decimal.js';
import { isNotNil } from 'ramda';

import { TransactionFormInputField } from '../../transaction-screen.transaction-form.input';
import { TransactionFormProgressStackItem } from '../../transaction-screen.transaction-form.progress-step-stack-item';

interface ProgressStackItemProps {
  label: string;
  assetLogo: string;
  assetSymbol: string;
}

const ASSET_INFORMATION = {
  BTC: {
    assetLogo: '/images/logos/bitcoin-logo.svg',
    assetSymbol: 'BTC',
  },
  iBTC: {
    assetLogo: '/images/logos/ibtc-logo.svg',
    assetSymbol: 'iBTC',
  },
} as const;

const FLOW_LABEL_MAP = {
  mint: {
    A: {
      activeLabel: 'Depositing',
      inactiveLabel: 'Deposited',
      ...ASSET_INFORMATION.BTC,
    },
    B: {
      label: 'Minting',
      ...ASSET_INFORMATION.iBTC,
    },
  },
  burn: {
    A: {
      activeLabel: 'Burning',
      inactiveLabel: 'Burned',
      ...ASSET_INFORMATION.iBTC,
    },
    B: {
      label: 'Withdrawing',
      ...ASSET_INFORMATION.BTC,
    },
  },
} as const;

const getComponents = (
  flow: 'mint' | 'burn',
  currentStep: MintSteps | RedeemSteps,
  isConfirmed: boolean
): { A: ProgressStackItemProps; B: ProgressStackItemProps } => {
  const isActive = flow === 'mint' ? !isConfirmed : currentStep === RedeemSteps.BURN;

  const config = FLOW_LABEL_MAP[flow];

  return {
    A: {
      ...config.A,
      label: isActive ? config.A.activeLabel : config.A.inactiveLabel,
    },
    B: {
      ...config.B,
    },
  };
};

interface ProgressStackProps {
  formAPI: TransactionFormAPI;
  isIncludeForm: boolean;
  flow: 'mint' | 'burn';
  currentStep: MintSteps | RedeemSteps;
  assetAmount?: number;
  activeStackItem: 0 | 1;
  currentBitcoinPrice: number;
  components: { A: ProgressStackItemProps; B: ProgressStackItemProps };
  maxAmount?: number;
  isBitsafeWithdraw?: boolean;
}

const ProgressStack = ({
  formAPI,
  isIncludeForm,
  flow,
  currentStep,
  assetAmount,
  activeStackItem,
  currentBitcoinPrice,
  components,
  maxAmount,
  isBitsafeWithdraw,
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
            maxAmount={maxAmount}
            isBitsafeWithdraw={isBitsafeWithdraw}
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
            assetAmount={assetAmount}
            isActive={activeStackItem === 0}
          />
          <TransactionFormProgressStackItem
            label={B.label}
            assetLogo={B.assetLogo}
            assetSymbol={B.assetSymbol}
            assetAmount={assetAmount}
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
  currentStep: MintSteps | RedeemSteps;
  confirmations?: number;
  currentBitcoinPrice: number;
  assetAmount?: number;
  isBitsafeWithdraw?: boolean;
  maxAmount?: number;
}

const ProgressStackByFlow = ({
  formAPI,
  flow,
  currentStep,
  confirmations = 0,
  currentBitcoinPrice,
  assetAmount,
  isBitsafeWithdraw,
  maxAmount,
}: ProgressStackByFlowProps): React.JSX.Element => {
  const isConfirmed = confirmations >= 6;
  const isIncludeForm =
    flow === 'mint'
      ? currentStep === 1
      : currentStep === 0 || (!!isBitsafeWithdraw && currentStep === 1);

  const components = getComponents(flow, currentStep, isConfirmed);
  const activeStackItem = isIncludeForm || (flow === 'mint' && !isConfirmed) ? 0 : 1;

  return (
    <ProgressStack
      formAPI={formAPI}
      isIncludeForm={isIncludeForm}
      flow={flow}
      currentStep={currentStep}
      activeStackItem={activeStackItem}
      currentBitcoinPrice={currentBitcoinPrice}
      components={components}
      assetAmount={assetAmount}
      maxAmount={maxAmount}
      isBitsafeWithdraw={isBitsafeWithdraw}
    />
  );
};

const getWithdrawAssetAmount = (valueLocked: number, vaultOutputValue?: number) =>
  isNotNil(vaultOutputValue)
    ? new Decimal(valueLocked).minus(vaultOutputValue).toNumber()
    : undefined;

const getBurnAssetAmount = (valueLocked: number, valueMinted: number) => {
  return new Decimal(valueLocked).minus(valueMinted).toNumber();
};

const getAssetAmountByFlow = (
  flow: 'mint' | 'burn',
  currentStep: number,
  valueLocked: number,
  valueMinted: number,
  vaultOutputValue?: number
): number | undefined => {
  switch (flow) {
    case 'mint':
      return vaultOutputValue;
    case 'burn':
      return currentStep === RedeemSteps.WITHDRAW
        ? getBurnAssetAmount(valueLocked, valueMinted)
        : getWithdrawAssetAmount(valueLocked, vaultOutputValue);
  }
};

interface TransactionFormProgressStackProps {
  formAPI: TransactionFormAPI;
  flow: 'mint' | 'burn';
  currentBitcoinPrice: number;
  currentStep: MintSteps | RedeemSteps;
  confirmations?: number;
  valueLocked: number;
  valueMinted: number;
  vaultOutputValue?: number;
  isBitsafeWithdraw?: boolean;
}

export const TransactionFormProgressStack = ({
  formAPI,
  flow,
  currentStep,
  confirmations = 0,
  currentBitcoinPrice,
  vaultOutputValue,
  valueLocked,
  valueMinted,
  isBitsafeWithdraw,
}: TransactionFormProgressStackProps): React.JSX.Element => {
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
        assetAmount={getAssetAmountByFlow(
          flow,
          currentStep,
          valueLocked,
          valueMinted,
          vaultOutputValue
        )}
        isBitsafeWithdraw={isBitsafeWithdraw}
        maxAmount={valueLocked}
      />
    </HStack>
  );
};
