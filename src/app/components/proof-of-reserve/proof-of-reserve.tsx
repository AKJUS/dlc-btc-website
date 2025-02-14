import { useContext, useState } from 'react';

import { Button, Divider, Stack, Text, useBreakpointValue } from '@chakra-ui/react';
import { ProtocolHistoryTable } from '@components/protocol-history-table/protocol-history-table';
import { bitcoin, iBTC } from '@models/token';
import { ProofOfReserveContext } from '@providers/proof-of-reserve-context-provider';

import { titleTextSize } from '@shared/utils';

import { MerchantTable } from './components/merchant-table/merchant-table';
import { ProofOfReserveLayout } from './components/proof-of-reserve-layout';
import { TokenStatsBoardToken } from './components/token-stats-board/components/token-stats-board-token';
import { TokenStatsBoardTVL } from './components/token-stats-board/components/token-stats-board-tvl';
import { TokenStatsBoardTVLByChain } from './components/token-stats-board/components/token-stats-board-tvl-by-chain';
import { TokenStatsBoardLayout } from './components/token-stats-board/token-stats-board.layout';

interface ChainData {
  chain: string;
  value: number;
}

export function ProofOfReserve(): React.JSX.Element {
  const { proofOfReserve, totalSupply, bitcoinPrice, allMintBurnEvents } =
    useContext(ProofOfReserveContext);
  const [isBreakdownVisible, setIsBreakdownVisible] = useState(false);
  const { proofOfReserveSum, merchantProofOfReserves, proofOfReserveByChain } = proofOfReserve;
  const handleButtonClick = async () => {
    setIsBreakdownVisible(prev => !prev);
  };

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  function getChainImagePath(chainName: string): string {
    const lowerCaseChainName = chainName.toLowerCase();

    const chainImagePaths: { [key: string]: string } = {
      'evm-mainnet': '/images/logos/eth-token.svg',
      'evm-arbitrum': '/images/logos/arbitrum-token.svg',
      'evm-sepolia': '/images/logos/eth-token.svg',
      'evm-arbsepolia': '/images/logos/arbitrum-token.svg',
      'evm-basesepolia': '/images/logos/base-token.svg',
      'evm-optimism': '',
      'evm-opsepolia': '',
      'evm-polygon': '',
      'evm-polygonsepolia': '',
      'evm-avax': '/images/logos/avax-token.svg',
      'evm-bsc': '/images/logos/bsc-token.svg',
      'evm-base': '/images/logos/base-token.svg',
      'evm-holesky': '/images/logos/eth-token.svg',
      'evm-localhost': '',
      'evm-hardhat-arb': '',
      'evm-hardhat-eth': '',
      'xrpl-mainnet': '/images/logos/xrpl-token.svg',
    };
    return chainImagePaths[lowerCaseChainName];
  }

  const chainData: ChainData[] = proofOfReserveByChain.map(chain => {
    return {
      chain: getChainImagePath(chain.chain),
      value: chain.value,
    };
  });

  return (
    <ProofOfReserveLayout>
      <Text w={'100%'} color={'white'} fontSize={titleTextSize} fontWeight={500}>
        Proof of Reserve
      </Text>

      <TokenStatsBoardLayout>
        <Stack
          w={'100%'}
          alignItems={isMobile ? 'flex-start' : 'center'}
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
          <Divider
            orientation={isMobile ? 'horizontal' : 'vertical'}
            px={isMobile ? '0px' : '15px'}
            height={isMobile ? '1px' : '75px'}
            variant={'thick'}
          />
          <Button
            variant={'account'}
            onClick={handleButtonClick}
            h={'50px'}
            w={isMobile ? '100%' : '275px'}
            fontSize={isMobile ? 'xs' : 'xs'}
          >
            See Breakdown {!isMobile && <br />}By Chain
          </Button>
        </Stack>
        {isBreakdownVisible && (
          <TokenStatsBoardTVLByChain isMobile={isMobile} chainData={chainData} />
        )}
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
