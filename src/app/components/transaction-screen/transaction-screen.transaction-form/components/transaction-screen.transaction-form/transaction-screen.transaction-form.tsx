import React, { useContext, useEffect, useState } from 'react';

import { VStack } from '@chakra-ui/react';
import { RiskBox } from '@components/mint-unmint/components/risk-box/risk-box';
import { useVaultOutputValue } from '@hooks/use-vault-output-value';
import { TransactionFormAPI } from '@models/form.models';
import { Vault } from '@models/vault';
import { BitcoinTransactionConfirmationsContext } from '@providers/bitcoin-query-provider';
import { BitcoinWalletContextState } from '@providers/bitcoin-wallet-context-provider';
import { useForm } from '@tanstack/react-form';
import Decimal from 'decimal.js';

import { parseAssetAmount } from '@shared/utils';

import { TransactionFormNavigateButtonGroup } from './components/transaction-screen.transaction-form.navigate-button-group';
import { TransactionFormProgressStack } from './components/transaction-screen.transaction-form.progress-stack/components/transaction-screen.transaction-form.progress-stack';
import { TransactionFormProtocolFeeStack } from './components/transaction-screen.transaction-form.protocol-fee-box';
import { TransactionFormSubmitButtonGroup } from './components/transaction-screen.transaction-form.submit-button-group';
import { TransactionScreenWalletInformation } from './components/transaction-screen.transaction-form.wallet-information';
import { TransactionFormTransactionInformation } from './components/transaction-screent.transaction-form.transaction-information';

function validateDepositAmount(
  value: number,
  depositLimit: { minimumDeposit: number; maximumDeposit: number }
): string | undefined {
  let error;

  if (!value) {
    error = 'Please enter a valid amount of BTC';
  } else if (depositLimit && value < depositLimit.minimumDeposit) {
    error = `You can't deposit less than ${depositLimit.minimumDeposit} BTC`;
  } else if (depositLimit && value > depositLimit.maximumDeposit) {
    error = `You can't deposit more than ${depositLimit.maximumDeposit} BTC`;
  }
  return error;
}

function validateBurnAmount(
  value: number,
  valueMinted: number,
  depositLimit: { minimumDeposit: number; maximumDeposit: number }
): string | undefined {
  let error;

  if (!value) {
    error = 'Please enter a valid amount of iBTC';
  } else if (depositLimit && value < depositLimit.minimumDeposit) {
    error = `You can't burn less than ${depositLimit.minimumDeposit} BTC`;
  } else if (valueMinted && value > valueMinted) {
    error = `You can't burn more than ${valueMinted} iBTC`;
  }
  return error;
}

function validateFormAmount(
  value: number,
  type: 'mint' | 'burn',
  depositLimit?: { minimumDeposit: number; maximumDeposit: number },
  vault?: Vault
): string | undefined {
  if (!vault) {
    return 'Vault is not available';
  } else if (!depositLimit) {
    return 'Deposit limits are not available';
  }

  switch (type) {
    case 'mint':
      return validateDepositAmount(value, depositLimit);
    case 'burn':
      return validateBurnAmount(value, vault.valueMinted, depositLimit);
  }
}

function getTransactionButtonGroup(
  flow: 'mint' | 'burn',
  currentStep: number,
  formAPI: TransactionFormAPI,
  userEthereumAddressRiskLevel: any,
  bitcoinWalletContextState: BitcoinWalletContextState,
  handleCancelButtonClick: () => void,
  isSubmitting: boolean,
  isBitsafeWithdraw?: boolean
): React.JSX.Element | false {
  const showSubmitButtonGroup =
    (flow === 'mint' && currentStep === 1) || (flow === 'burn' && [0, 1].includes(currentStep));

  return showSubmitButtonGroup ? (
    <TransactionFormSubmitButtonGroup
      flow={flow}
      currentStep={currentStep}
      formAPI={formAPI}
      userEthereumAddressRiskLevel={userEthereumAddressRiskLevel}
      bitcoinWalletContextState={bitcoinWalletContextState}
      handleCancelButtonClick={handleCancelButtonClick}
      isSubmitting={isSubmitting}
      isBitsafeWithdraw={isBitsafeWithdraw}
    />
  ) : (
    <TransactionFormNavigateButtonGroup flow={flow} />
  );
}

interface VaultTransactionFormProps {
  flow: 'mint' | 'burn';
  currentStep: number;
  bitcoinWalletContextState: BitcoinWalletContextState;
  isBitcoinWalletLoading: [boolean, string];
  userEthereumAddressRiskLevel?: string;
  isUserEthereumAddressRiskLevelLoading?: boolean;
  vault: Vault;
  handleButtonClick: (assetValue: number) => Promise<void>;
  handleCancelButtonClick: () => void;
  isSubmitting: boolean;
  currentBitcoinPrice?: number;
  depositLimit?: { minimumDeposit: number; maximumDeposit: number } | undefined;
  isBitsafeWithdraw?: boolean;
  initialAmount?: number;
}

export function VaultTransactionForm({
  flow,
  currentStep,
  bitcoinWalletContextState,
  isBitcoinWalletLoading,
  userEthereumAddressRiskLevel,
  isUserEthereumAddressRiskLevelLoading,
  vault,
  handleButtonClick,
  handleCancelButtonClick,
  isSubmitting,
  currentBitcoinPrice,
  depositLimit,
  isBitsafeWithdraw,
  initialAmount,
}: VaultTransactionFormProps): React.JSX.Element {
  const [currentFieldValue, setCurrentFieldValue] = useState<number>(
    initialAmount ?? depositLimit?.minimumDeposit!
  );

  const { data: vaultOutputValue } = useVaultOutputValue({
    vaultUUID: vault.uuid,
    derivedUserPublicKey: vault.taprootPubKey,
    bitcoinTransactionID: vault.withdrawDepositTX,
  });

  const confirmations = useContext(
    BitcoinTransactionConfirmationsContext
  ).bitcoinTransactionConfirmations.find(v => v[0] === vault.uuid)?.[1];

  const form = useForm({
    defaultValues: {
      assetAmount: (initialAmount ?? depositLimit?.minimumDeposit!)?.toString()!,
    },
    onSubmit: async ({ value }) => {
      const assetAmount = new Decimal(value.assetAmount).toNumber();
      const burnAmount = new Decimal(vault.valueLocked).minus(vault.valueMinted).toNumber();
      const isWithdrawStep = flow === 'burn' && currentStep !== 0;

      const amountToHandle = isWithdrawStep && !isBitsafeWithdraw ? burnAmount : assetAmount;

      await handleButtonClick(amountToHandle);
    },
    validators: {
      onChange: ({ value }) => {
        const decimalValue = parseAssetAmount(value.assetAmount);
        setCurrentFieldValue(decimalValue.toNumber());

        if (isBitsafeWithdraw) {
          return { fields: { assetAmount: undefined } };
        }

        return {
          fields: {
            assetAmount: validateFormAmount(decimalValue.toNumber(), flow, depositLimit, vault),
          },
        };
      },
    },
  });

  useEffect(() => {
    if (isBitsafeWithdraw) {
      form.setFieldValue('assetAmount', vault.valueLocked.toString());
      setCurrentFieldValue(vault.valueLocked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBitsafeWithdraw]);

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <VStack w={'100%'} spacing={'15px'} minW={'364.8px'} justifyContent={'space-between'}>
        <TransactionFormProgressStack
          formAPI={form}
          flow={flow}
          confirmations={confirmations}
          currentBitcoinPrice={currentBitcoinPrice!}
          currentStep={currentStep}
          vaultOutputValue={vaultOutputValue}
          valueLocked={vault.valueLocked}
          valueMinted={vault.valueMinted}
          isBitsafeWithdraw={isBitsafeWithdraw}
        />
        <TransactionFormProtocolFeeStack
          flow={flow}
          vault={vault}
          currentStep={currentStep}
          assetAmount={currentFieldValue}
          bitcoinPrice={currentBitcoinPrice}
          protocolFeeBasisPoints={vault?.btcMintFeeBasisPoints}
          isBitcoinWalletLoading={isBitcoinWalletLoading}
          isBitsafeWithdraw={isBitsafeWithdraw}
        />
        <TransactionFormTransactionInformation
          flow={flow}
          currentStep={currentStep}
          assetAmount={currentFieldValue}
          isBitcoinWalletLoading={isBitcoinWalletLoading}
        />
        {isUserEthereumAddressRiskLevelLoading && userEthereumAddressRiskLevel && (
          <RiskBox
            risk={userEthereumAddressRiskLevel}
            isRiskLoading={isUserEthereumAddressRiskLevelLoading}
          />
        )}
        <TransactionScreenWalletInformation isBitcoinWalletLoading={isBitcoinWalletLoading} />
        {getTransactionButtonGroup(
          flow,
          currentStep,
          form,
          userEthereumAddressRiskLevel,
          bitcoinWalletContextState,
          handleCancelButtonClick,
          isSubmitting,
          isBitsafeWithdraw
        )}
      </VStack>
    </form>
  );
}
