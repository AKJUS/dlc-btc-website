import { Divider, HStack, Image, Spacer, Text, VStack } from '@chakra-ui/react';
import { iBTC } from '@models/token';

interface AttestorDetailsRateCardProps {
  width: string;
}

export function AttestorDetailsRateCard({
  width,
}: AttestorDetailsRateCardProps): React.JSX.Element {
  return (
    <VStack h={'100%'} alignItems={'flex-start'} justifyContent={'space-evenly'}>
      <HStack h={'50%'} alignItems={'flex-start'}>
        <VStack h={'100%'} w={width} alignItems={'flex-start'} spacing={'25%'}>
          <Text color={'white'} fontWeight={'600'}>
            Nakamoto Coefficient
          </Text>
          <HStack>
            <Image src={iBTC.logo} alt={iBTC.logoAlt} boxSize={'35px'} />
            <Text color={'grey'} fontSize={'xl'}>
              iBTC
            </Text>
            <Spacer />
            <Text color={'white'} fontSize={'x-large'}>
              7
            </Text>
          </HStack>
        </VStack>
        <Divider orientation={'vertical'} px={'1px'} height={'100%'} />
        <VStack h={'100%'} w={width} alignItems={'flex-start'} spacing={'25%'}>
          <Text color={'white'} fontWeight={'600'}>
            Weighted Skip Rate
          </Text>
          <Text
            fontSize={'x-large'}
            fontWeight={600}
            bgGradient={`linear(to-r, #AC50EF, #7059FB, #2ECFF6)`}
            bgClip="text"
          >
            3.18%
          </Text>
        </VStack>
      </HStack>
      <Divider />

      <VStack h={'50%'} alignItems={'flex-start'}>
        <Text color={'white'} fontWeight={'600'}>
          Nominal Staking APY
        </Text>
      </VStack>
    </VStack>
  );
}
