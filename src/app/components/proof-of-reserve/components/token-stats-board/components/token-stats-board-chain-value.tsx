import { useContext } from 'react';

import { HStack, Image, Text } from '@chakra-ui/react';
import { ProofOfReserveContext } from '@providers/proof-of-reserve-context-provider';

import { convertBitcoinToUSD } from '@shared/utils';

interface TokenStatsBoardChainValueProps {
  chain: string;
  chainValue: number | undefined;
}

export function TokenStatsBoardChainValue({
  chain,
  chainValue,
}: TokenStatsBoardChainValueProps): React.JSX.Element {
  const { bitcoinPrice } = useContext(ProofOfReserveContext);

  const chainValueInUSD =
    chainValue && bitcoinPrice ? convertBitcoinToUSD(bitcoinPrice, chainValue) : 0;

  return (
    <HStack w={'100%'} h={'100%'} alignItems={'start'}>
      <Image src={chain} alt={chain} boxSize={'25px'} />
      <Text color={'white.01'} fontWeight={200} fontSize={'sm'}>
        {chainValueInUSD.toLocaleString('en-US')} USD
      </Text>
    </HStack>
  );
}
