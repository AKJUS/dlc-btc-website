import { HStack, Image, Skeleton, Text, VStack } from '@chakra-ui/react';
import { Token } from '@models/token';

interface TokenStatsBoardTokenProps {
  token: Token;
  totalSupply: number | undefined;
}

export function TokenStatsBoardToken({
  token,
  totalSupply,
}: TokenStatsBoardTokenProps): React.JSX.Element {
  let tokenSuffix: string;
  switch (token.name) {
    case 'iBTC':
      tokenSuffix = 'Minted';
      break;
    default:
      tokenSuffix = 'Reserve';
      break;
  }

  return (
    <VStack w={'100%'} h={'100%'} alignItems={'start'}>
      <Text color={'white.01'} fontWeight={600} fontSize={'lg'}>
        {`${token.name} ${tokenSuffix}`}
      </Text>
      <Skeleton isLoaded={totalSupply !== undefined} h={'auto'} w={'100%'}>
        <HStack>
          <Image src={token.logo} alt={token.logoAlt} boxSize={'25px'} />
          <Text color={'white.01'} fontWeight={200} fontSize={'2xl'}>
            {Number(totalSupply).toFixed(4)}
          </Text>
        </HStack>
      </Skeleton>
    </VStack>
  );
}
