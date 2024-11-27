/* eslint-disable */
import { HStack, Image, Text } from '@chakra-ui/react';
import { CustomSkeleton } from '@components/custom-skeleton/custom-skeleton';

interface AttestorSelectTableItemProps {
  hash: string;
  time: string;
  action: string;
  programs: string;
  value: string;
  token: string;
}

export function AttestorSelectTableItem(
  attestorSelectTableItem: AttestorSelectTableItemProps
): React.JSX.Element {
  if (!attestorSelectTableItem) return <CustomSkeleton height={'35px'} />;

  const { hash, time, action, programs, value, token } = attestorSelectTableItem;

  return (
    <HStack
      p={'10px'}
      w={'100%'}
      h={'50px'}
      bg={'background.content.01'}
      blendMode={'screen'}
      border={'1px solid'}
      borderRadius={'md'}
      borderColor={'border.white.01'}
      justifyContent={'space-between'}
    >
      <HStack w={'20%'}>
        <Image src={'/images/logos/ibtc-logo.svg'} alt={'iBTC Logo'} boxSize={'30px'} />
        <Text color={'white'} fontSize={'sm'} fontWeight={500}>
          {hash}
        </Text>
      </HStack>
      <Text w={'16%'} color={'white'} fontSize={'sm'} fontWeight={800}>
        {time}
      </Text>
      <Text w={'16%'} color={'white'} fontSize={'sm'}>
        {action}
      </Text>
      <Text w={'16%'} color={'white'} fontSize={'sm'}>
        {programs}
      </Text>
      <Text w={'16%'} color={'white'} fontSize={'sm'}>
        {value}
      </Text>
      <Text w={'16%'} color={'white'} fontSize={'sm'}>
        {token}
      </Text>
    </HStack>
  );
}
