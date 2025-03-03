import { HStack, Image, Text, VStack, useBreakpointValue } from '@chakra-ui/react';
import { Token } from '@models/token';

import { formatNumber } from '@shared/utils';

interface PointsStatsBoardActionProps {
  token: Token;
  totalSupply: number | undefined;
  tokenSuffix: string;
}

export function PointsStatsBoardAction({
  token,
  totalSupply = 0,
  tokenSuffix,
}: PointsStatsBoardActionProps): React.JSX.Element {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <VStack w={'100%'} h={'100%'} pr={'25px'} py={isMobile ? '5px' : '15px'} alignItems={'start'}>
      <VStack w={'100%'} h={'85px'} alignItems={'start'} spacing={'15px'}>
        <HStack h={'25px'}>
          <Image src={token.logo} alt={token.logoAlt} boxSize={'25px'} />
          <Text color={'white'} fontWeight={200} fontSize={'md'}>
            {`${tokenSuffix} ${token.name} `}
          </Text>
        </HStack>
        <Text color={'white'} fontWeight={200} fontSize={'3xl'}>
          {formatNumber(totalSupply)}
        </Text>
      </VStack>
    </VStack>
  );
}
