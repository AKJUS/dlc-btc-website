import { useContext } from 'react';

import { Divider, Stack, Text, useBreakpointValue } from '@chakra-ui/react';
import { ProtocolHistoryTable } from '@components/protocol-history-table/protocol-history-table';
import { Merchant } from '@models/merchant';
import { bitcoin, iBTC } from '@models/token';
import { ProofOfReserveContext } from '@providers/proof-of-reserve-context-provider';

import { titleTextSize } from '@shared/utils';

import { MerchantTable } from './components/merchant-table/merchant-table';
import { ProofOfReserveLayout } from './components/proof-of-reserve-layout';
import { TokenStatsBoardToken } from './components/token-stats-board/components/token-stats-board-token';
import { TokenStatsBoardTVL } from './components/token-stats-board/components/token-stats-board-tvl';
import { TokenStatsBoardLayout } from './components/token-stats-board/token-stats-board.layout';

export function ProofOfReserve(): React.JSX.Element {
  const { proofOfReserve, totalSupply, bitcoinPrice, allMintBurnEvents } =
    useContext(ProofOfReserveContext);

  const [proofOfReserveSum, merchantProofOfReserves] = proofOfReserve || [
    undefined,
    appConfiguration.merchants.map((merchant: Merchant) => {
      return {
        merchant,
        iBTCBalance: undefined,
      };
    }),
  ];

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <ProofOfReserveLayout>
      <Text w={'100%'} color={'white'} fontSize={titleTextSize} fontWeight={500}>
        Proof of Reserve
      </Text>

      <TokenStatsBoardLayout>
        <Stack
          w={'100%'}
          alignItems={'flex-start'}
          direction={isMobile ? 'column' : 'row'}
          gap={isMobile ? '20px' : '0px'}
        >
          <TokenStatsBoardTVL totalSupply={totalSupply} bitcoinPrice={bitcoinPrice} />
          <Divider
            orientation={isMobile ? 'horizontal' : 'vertical'}
            px={isMobile ? '0px' : '15px'}
            height={isMobile ? '1px' : '75px'}
            variant={'thick'}
          />
          <TokenStatsBoardToken token={iBTC} totalSupply={totalSupply} />
          <Divider
            orientation={isMobile ? 'horizontal' : 'vertical'}
            px={isMobile ? '0px' : '15px'}
            height={isMobile ? '1px' : '75px'}
            variant={'thick'}
          />
          <TokenStatsBoardToken token={bitcoin} totalSupply={proofOfReserveSum} />
        </Stack>
      </TokenStatsBoardLayout>
      <Stack
        w={'100%'}
        alignItems={'stretch'}
        direction={isMobile ? 'column' : 'row'}
        gap={isMobile ? '40px' : '20px'}
      >
        <MerchantTable items={merchantProofOfReserves}></MerchantTable>
        <ProtocolHistoryTable items={allMintBurnEvents} />
      </Stack>
    </ProofOfReserveLayout>
  );
}
