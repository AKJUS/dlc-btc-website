import { Box, HStack, Image, Text } from '@chakra-ui/react';

import { ExplanationBlock } from './components/explanation-block';

export function MiddleSection(): React.JSX.Element {
  return (
    <Box
      px={'25px'}
      minW={'100vw'}
      h={'362px'}
      pl={'130px'}
      pr={'130px'}
      mixBlendMode={'screen'}
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
    >
      <HStack w={'1000px'} justifyContent={'space-between'}>
        <ExplanationBlock
          title={'What is iBTC?'}
          image={<Image src={'/images/mint-btc-grad.png'} w={'200px'} h={'100px'} ml={'89px'} />}
          content={
            <Text color={'white'}>
              iBTC is a{' '}
              <Box as={'span'} fontWeight={'bold'}>
                non-custodial
              </Box>{' '}
              representation of Bitcoin on the Ethereum blockchain.
            </Text>
          }
        ></ExplanationBlock>
        <ExplanationBlock
          title={'How Does It Work?'}
          image={<Image src={'/images/dlc-img.png'} w={'315px'} h={'120px'} />}
          content={
            <Text color={'white'}>
              <Text as={'span'} variant={'navigate'}>
                Discreet Log Contracts (DLCs)
              </Text>{' '}
              ensure only authorized parties can access locked Bitcoin, without third-party risks.
            </Text>
          }
        ></ExplanationBlock>
        <ExplanationBlock
          title={'Why is It Safer?'}
          image={<Image src={'/images/unmint-btc-grad.png'} w={'200px'} h={'100px'} mr={'89px'} />}
          content={
            <Text color={'white'}>
              Your Bitcoin remains secure on its native chain and cannot be redirected or stolen.
            </Text>
          }
        ></ExplanationBlock>
      </HStack>
    </Box>
  );
}
