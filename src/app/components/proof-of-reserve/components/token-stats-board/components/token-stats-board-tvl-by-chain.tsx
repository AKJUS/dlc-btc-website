import { Box, Divider, Stack, VStack } from '@chakra-ui/react';

import { TokenStatsBoardChainValue } from './token-stats-board-chain-value';

interface TokenStatsBoardTVLByChainProps {
  isMobile: boolean;
  chainData: { chain: string; value: number }[];
}

export function TokenStatsBoardTVLByChain({
  isMobile,
  chainData,
}: TokenStatsBoardTVLByChainProps): React.JSX.Element {
  return (
    <VStack w={'100%'} alignItems={'flex-start'} spacing={isMobile ? 3 : 5}>
      <Divider orientation={'horizontal'} height={'1px'} variant={'thick'} />
      <Stack
        alignItems={isMobile ? 'flex-start' : 'center'}
        direction={isMobile ? 'column' : 'row'}
        w={'100%'}
        justifyContent={'flex-start'}
        gap={'20px'}
        flexWrap={'wrap'}
      >
        {chainData.map((chainData, index) => (
          <Box key={index} w={'calc(25% - 15px)'}>
            <TokenStatsBoardChainValue chain={chainData.chain} chainValue={chainData.value} />
          </Box>
        ))}
      </Stack>
    </VStack>
  );
}
