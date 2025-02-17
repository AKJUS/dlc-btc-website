import { Text } from '@chakra-ui/react';
import { ValidationError } from '@tanstack/react-form';
import Decimal from 'decimal.js';

import { convertBitcoinToUSD } from '@shared/utils';

interface TransactionFormInputUSDTextProps {
  errors: ValidationError[];
  assetAmount?: string;
  currentBitcoinPrice?: number;
}

export function TransactionFormInputUSDText({
  errors,
  assetAmount,
  currentBitcoinPrice,
}: TransactionFormInputUSDTextProps): React.JSX.Element | false {
  if (errors.length) return false;

  const totalSupplyValueInUSD =
    assetAmount && currentBitcoinPrice
      ? convertBitcoinToUSD(currentBitcoinPrice, new Decimal(assetAmount).toNumber())
      : 0;

  return (
    <Text w={'100%'} pl={'12.5%'} color={'white.02'} fontSize={'xs'}>
      ~ {totalSupplyValueInUSD.toLocaleString('en-US')} USD
    </Text>
  );
}
