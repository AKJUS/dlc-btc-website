import { Box, HStack, Text, VStack } from '@chakra-ui/react';

import { breakpoints } from '@shared/utils';

import { IntroVideo } from './components/intro-video';

export function TopSection(): React.JSX.Element {
  return (
    <Box
      w={breakpoints}
      h={'274px'}
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
    >
      <HStack w={'1000px'} justifyContent={'space-between'}>
        <VStack align={'left'}>
          <Text color={'white.01'} fontSize={'56px'} fontWeight={'bold'}>
            iBTC
          </Text>
          <Text color={'white.01'} fontSize={'21px'} w={'462px'}>
            iBTC lets you use your Bitcoin on different DeFi platforms, all without giving up
            control of your actual Bitcoin.
          </Text>
        </VStack>
        <IntroVideo
          opts={{ height: '274px', width: '486px', playerVars: { autoplay: 0, controls: 1 } }}
          placeholderHeight={'274px'}
          placeholderWidth={'486px'}
        />
      </HStack>
    </Box>
  );
}
