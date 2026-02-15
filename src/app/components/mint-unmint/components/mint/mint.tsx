import { Text, VStack } from '@chakra-ui/react';

export function Mint(): React.JSX.Element {
  return (
    <VStack
      alignItems={'center'}
      justifyContent={'center'}
      pt={'50px'}
      pb={'50px'}
      w={'100%'}
      spacing={'15px'}
    >
      <Text fontSize={'xl'} fontWeight={'bold'}>
        iBTC Minting Has Been Discontinued
      </Text>
      <Text fontSize={'md'} color={'white.03'}>
        iBTC is being sunset. New minting is no longer available. If you have existing vaults, you
        can still withdraw using the Withdraw tab.
      </Text>
    </VStack>
  );
}
