import { HStack, Text, VStack } from '@chakra-ui/react';
import { Vault } from '@models/vault';
import Decimal from 'decimal.js';
import { getFeeAmount } from 'dlc-btc-lib/bitcoin-functions';
import { shiftValue, unshiftValue } from 'dlc-btc-lib/utilities';

import { convertBitcoinToUSD } from '@shared/utils';

interface TransactionFormProtocolFeeStackProps {
  flow: 'mint' | 'burn';
  vault: Vault;
  currentStep: number;
  assetAmount?: number;
  bitcoinPrice?: number;
  protocolFeeBasisPoints?: number;
  isBitcoinWalletLoading: [boolean, string];
  isBitsafeWithdraw?: boolean;
}

export function TransactionFormProtocolFeeStack({
  flow,
  vault,
  currentStep,
  assetAmount,
  bitcoinPrice,
  protocolFeeBasisPoints,
  isBitcoinWalletLoading,
  isBitsafeWithdraw,
}: TransactionFormProtocolFeeStackProps): React.JSX.Element | false {
  if (isBitcoinWalletLoading[0] || [0, 2].includes(currentStep)) return false;

  const amount =
    flow === 'burn' && currentStep === 1 && !isBitsafeWithdraw
      ? shiftValue(new Decimal(vault.valueLocked).minus(vault.valueMinted).toNumber())
      : shiftValue(assetAmount!);

  const [feeAmount, protocolFeeValueInUSD] =
    amount && protocolFeeBasisPoints && bitcoinPrice
      ? (fee => [fee, convertBitcoinToUSD(bitcoinPrice, fee)])(
          unshiftValue(getFeeAmount(amount, protocolFeeBasisPoints))
        )
      : [0, 0];

  return (
    <VStack
      alignItems={'end'}
      p={'15px'}
      w={'100%'}
      border={'1px dashed'}
      borderRadius={'md'}
      borderColor={'orange.01'}
    >
      <HStack justifyContent={'space-between'} w={'100%'}>
        <Text color={'white.01'} fontSize={'xs'} fontWeight={'bold'}>
          Protocol Fee
        </Text>
        <Text color={'white.01'} fontSize={'xs'} fontWeight={800}>
          {feeAmount} BTC
        </Text>
      </HStack>
      <Text color={'white.02'} fontSize={'xs'}>
        ~ {protocolFeeValueInUSD.toLocaleString('en-US')} USD
      </Text>
    </VStack>
  );
}
