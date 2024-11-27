import { Box, Image, Text, VStack } from '@chakra-ui/react';

export function SetupVaultScreenVaultGraphics(): React.JSX.Element {
  return (
    <VStack
      p={'1px'}
      w={'100%'}
      bgGradient={`linear(orange.01, purple.01)`}
      borderRadius={'md'}
      alignItems={'center'}
    >
      <VStack
        p={'35px'}
        w={'100%'}
        bg={'background.content.01'}
        borderRadius={'md'}
        spacing={'15px'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Box position="relative" boxSize="75px">
          <Image
            src={'./images/logos/bitcoin-logo.svg'}
            alt={'Bitcoin Logo'}
            boxSize={'75px'}
            position="absolute"
            right="37.5%"
          />
          <Image
            src={'./images/logos/ibtc-logo.svg'}
            alt={'DLC BTC Logo'}
            boxSize={'75px'}
            position="absolute"
            left="37.5%"
          />
        </Box>
        <Text fontSize={'lg'} fontWeight={'bold'} color={'white.01'}>
          BTC/iBTC Vault
        </Text>
      </VStack>
    </VStack>
  );
}
