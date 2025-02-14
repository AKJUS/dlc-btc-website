import { HStack, Image, Text } from '@chakra-ui/react';

interface TokenStatsBoardChainValueProps {
  chain: string;
  chainValue: number | undefined;
}

export function TokenStatsBoardChainValue({
  chain,
  chainValue,
}: TokenStatsBoardChainValueProps): React.JSX.Element {
  return (
    <HStack w={'100%'} h={'100%'} alignItems={'start'}>
      <Image src={chain} alt={chain} boxSize={'25px'} />
      <Text color={'white.01'} fontWeight={200} fontSize={'sm'}>
        ${chainValue?.toLocaleString('en-US')} USD
      </Text>
    </HStack>
  );
}
