import { Button, HStack, Image, NumberInput, NumberInputField, Text } from '@chakra-ui/react';
import { FieldApi } from '@tanstack/react-form';

interface TransactionFormFieldInputProps {
  assetLogo: string;
  assetSymbol: string;
  formField: FieldApi<
    {
      assetAmount: string;
    },
    'assetAmount',
    undefined,
    undefined,
    string
  >;
  maxAmount?: number;
  isReadOnly?: boolean;
}

export function TransactionFormFieldInput({
  assetLogo,
  assetSymbol,
  formField,
  maxAmount,
  isReadOnly,
}: TransactionFormFieldInputProps): React.JSX.Element {
  return (
    <HStack w={'100%'}>
      <HStack w={'65%'}>
        <Image src={assetLogo} alt={'Asset Logo'} boxSize={'25px'} />
        <NumberInput
          autoFocus
          allowMouseWheel={false}
          value={formField.state.value}
          onChange={e => formField.handleChange(e)}
          onBlur={formField.handleBlur}
          borderColor={'white.01'}
          focusBorderColor={'rgba(50, 201, 247, 1)'} // accent.lightBlue.01
          isInvalid={formField.state.meta.errors.length > 0}
          isReadOnly={isReadOnly}
        >
          <NumberInputField h={'25px'} color={'white.01'} fontWeight={'bold'} fontSize={'sm'} />
        </NumberInput>
      </HStack>
      {maxAmount !== undefined && !isReadOnly && (
        <Button
          size={'xs'}
          variant={'outline'}
          color={'accent.lightBlue.01'}
          borderColor={'accent.lightBlue.01'}
          _hover={{ bg: 'white.04' }}
          onClick={() => formField.handleChange(maxAmount.toString())}
        >
          Full Amount
        </Button>
      )}
      <Text fontSize={'sm'} fontWeight={'bold'} color={'white.01'}>
        {assetSymbol}
      </Text>
    </HStack>
  );
}
