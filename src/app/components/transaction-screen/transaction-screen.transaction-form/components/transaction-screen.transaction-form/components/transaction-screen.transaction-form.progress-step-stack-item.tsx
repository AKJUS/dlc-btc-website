import { HStack, Image, Stack, Text } from '@chakra-ui/react';

interface TransactionFormProgressStackItemProps {
  label: string;
  assetLogo: string;
  assetSymbol: string;
  assetAmount?: number;
  isActive: boolean;
}

export function TransactionFormProgressStackItem({
  label,
  assetLogo,
  assetSymbol,
  isActive,
  assetAmount,
}: TransactionFormProgressStackItemProps): React.JSX.Element {
  return (
    <HStack
      w={'100%'}
      p={'15px'}
      bg={'white.04'}
      border={'1px solid'}
      borderColor={'white.03'}
      borderRadius={'md'}
      opacity={isActive ? '100%' : '50%'}
    >
      <HStack w={'50%'}>
        <Image src={assetLogo} alt={'Asset Logo'} boxSize={'25px'} />
        <Stack>
          <Text color={'white.01'} fontSize={'sm'}>
            {label}
          </Text>
        </Stack>
      </HStack>
      <HStack w={'50%'} justifyContent={'flex-end'}>
        {assetAmount && (
          <Text w={'70%'} textAlign={'right'} fontSize={'sm'} color={'white.01'}>
            {assetAmount}
          </Text>
        )}
        <Text w={'30%'} fontSize={'sm'} fontWeight={'bold'} color={'white.01'}>
          {assetSymbol}
        </Text>
      </HStack>
    </HStack>
  );
}
