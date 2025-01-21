import { Skeleton, Text, VStack, useBreakpointValue } from '@chakra-ui/react';

interface TokenStatsBoardTVLProps {
  totalSupply: number | undefined;
  bitcoinPrice: number | undefined;
}

export function TokenStatsBoardTVL({
  totalSupply,
  bitcoinPrice,
}: TokenStatsBoardTVLProps): React.JSX.Element {
  const amountFontSize = useBreakpointValue({ base: '2xl', md: 'xl', lg: 'xl', xl: '2xl' });
  return (
    <VStack w={'100%'} alignItems={'flex-start'}>
      <Text color={'white.01'} fontSize={'lg'} fontWeight={'600'} textAlign={'left'}>
        TVL
      </Text>
      <Skeleton w={'100%'} isLoaded={totalSupply !== undefined}>
        <Text fontSize={amountFontSize} fontWeight={600} color={'white.01'}>
          $
          {totalSupply && bitcoinPrice
            ? `${Math.floor(totalSupply * bitcoinPrice).toLocaleString('en-US')} USD`
            : 0}
        </Text>
      </Skeleton>
    </VStack>
  );
}
