import { HStack, Image, Text, useBreakpointValue } from '@chakra-ui/react';
import { CustomSkeleton } from '@components/custom-skeleton/custom-skeleton';
import { ProtocolRewards } from '@models/points.models';
import { unshiftValue } from 'dlc-btc-lib/utilities';

import { formatNumber, formatToFourDecimals } from '@shared/utils';

export function PointsTableItem(pointsTableItem: ProtocolRewards): React.JSX.Element {
  const isMobile = useBreakpointValue({ base: true, md: false });
  if (!pointsTableItem) return <CustomSkeleton height={'35px'} />;

  const { name, points, currentTokens, multiplier } = pointsTableItem;

  return (
    <HStack
      p={'10px'}
      w={'100%'}
      h={'50px'}
      bg={'background.container.01'}
      blendMode={'screen'}
      border={'1px solid'}
      borderRadius={'md'}
      borderColor={'border.white.01'}
      justifyContent={'space-between'}
    >
      {isMobile ? (
        <HStack w={'100%'}>
          <HStack w={'100%'}>
            <Text color={'white'} fontSize={'sm'}>
              {name}
            </Text>
          </HStack>
          <HStack w={'50%'}>
            <Text color={'white'} fontSize={'sm'} fontWeight={800}>
              {formatNumber(points)}
            </Text>
            <Text
              bgGradient={`linear(to-r, #AC50EF, #7059FB, #2ECFF6)`}
              bgClip="text"
              fontSize={'sm'}
              fontWeight={800}
            >
              {`(${multiplier}x)`}
            </Text>
          </HStack>
        </HStack>
      ) : (
        <>
          <HStack w={'25%'}>
            <Image src={'/images/logos/ibtc-logo.svg'} alt={'dlc BTC logo'} boxSize={'25px'} />
            <Text color={'white'} fontSize={'sm'} fontWeight={800}>
              {formatToFourDecimals(unshiftValue(currentTokens))}
            </Text>
          </HStack>
          <HStack w={'50%'}>
            <Text color={'white'} fontSize={'sm'} fontWeight={800}>
              {`${formatNumber(points)} Points`}
            </Text>
            <Text
              bgGradient={`linear(to-r, #AC50EF, #7059FB, #2ECFF6)`}
              bgClip="text"
              fontSize={'sm'}
              fontWeight={800}
            >
              {`(${multiplier}x)`}
            </Text>
          </HStack>
          <HStack w={'25%'}>
            <Text color={'white'} fontSize={'sm'}>
              {name}
            </Text>
          </HStack>
        </>
      )}
    </HStack>
  );
}
