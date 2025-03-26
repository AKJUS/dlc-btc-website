import { HStack, Image, Skeleton, Text, VStack } from '@chakra-ui/react';
import { unshiftValue } from 'dlc-btc-lib/utilities';

interface MyVaultsHeaderBalanceInfoProps {
  title: string;
  imageSrc: string;
  altText: string;
  assetAmount?: number;
  showNone?: boolean;
}

export function MyVaultsHeaderBalanceInfo({
  title,
  imageSrc,
  altText,
  assetAmount,
  showNone,
}: MyVaultsHeaderBalanceInfoProps): React.JSX.Element {
  return (
    <VStack justifyContent={'center'} alignItems={'start'} w={'35%'} h={'100%'}>
      <Text color={'accent.lightBlue.01'} fontWeight={600} fontSize={'md'}>
        {title}
      </Text>
      <Skeleton isLoaded={assetAmount !== undefined} h={'auto'} w={'100%'}>
        <HStack>
          <Image src={imageSrc} alt={altText} boxSize={'25px'} />
          <Text color={'white'} fontWeight={800} fontSize={'xl'}>
            {showNone ? '-' : unshiftValue(assetAmount!).toFixed(4)}
          </Text>
        </HStack>
      </Skeleton>
    </VStack>
  );
}
