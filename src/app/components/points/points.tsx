import { useDispatch } from 'react-redux';

import {
  Button,
  Divider,
  HStack,
  Image,
  Stack,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { TokenStatsBoardLayout } from '@components/proof-of-reserve/components/token-stats-board/token-stats-board.layout';
import { usePoints } from '@hooks/use-points';
import { dlcBTC } from '@models/token';
import { modalActions } from '@store/slices/modal/modal.actions';
import { useAccount } from 'wagmi';

import { titleTextSize } from '@shared/utils';

import { TokenStatsBoardTotalPoints } from './components/point-stats-board-total-points';
import { PointsLayout } from './components/points-layout';
import { PointsStatsBoardAction } from './components/points-stats-board-action';
import { PointsTable } from './components/points-table/points-table';

export function Points(): React.JSX.Element {
  const dispatch = useDispatch();
  const { userPoints } = usePoints();
  const { address } = useAccount();

  const isMobile = useBreakpointValue({ base: true, md: false });

  function onConnectWalletClick(): void {
    dispatch(modalActions.toggleSelectWalletModalVisibility());
  }

  return (
    <PointsLayout>
      <>
        <Text w={'100%'} color={'white'} fontSize={titleTextSize} fontWeight={500}>
          Use dlcBTC -{' '}
          <Text as="span" fontWeight={700}>
            Earn Points
          </Text>
        </Text>
        {!address && (
          <TokenStatsBoardLayout>
            <VStack
              w={'100%'}
              h={'100%'}
              p={['10px', '25px']}
              alignItems={'center'}
              spacing={['20px', '45px']}
            >
              <Text color={'white.01'} fontSize={['xl', '2xl']} align={'center'}>
                Connect your Wallet to view your Points
              </Text>
              <Button
                bgGradient={`linear(to-r, #AC50EF, #7059FB, #2ECFF6)`}
                variant={'points'}
                width={['100%', '100%', '50%', '30%']}
                onClick={() => onConnectWalletClick()}
              >
                <Text color={'white.01'}>Connect Wallet</Text>
              </Button>
            </VStack>
          </TokenStatsBoardLayout>
        )}
        {address && (
          <TokenStatsBoardLayout>
            <Stack
              w={'100%'}
              alignItems={'center'}
              direction={isMobile ? 'column' : 'row'}
              p={isMobile ? '15px' : '0px'}
              gap={isMobile ? '10px' : '0px'}
            >
              <VStack w={isMobile ? '100%' : '50%'} alignItems={'flex-start'}>
                <TokenStatsBoardTotalPoints totalPoints={userPoints?.total} />
                <Stack
                  w={'100%'}
                  pl={isMobile ? '0px' : '25px'}
                  direction={isMobile ? 'column' : 'row'}
                >
                  <PointsStatsBoardAction
                    token={dlcBTC}
                    totalSupply={userPoints?.useTotal}
                    tokenSuffix={'Use'}
                  />
                  <Divider
                    orientation={isMobile ? 'horizontal' : 'vertical'}
                    px={isMobile ? '0px' : '15px'}
                    height={isMobile ? '1px' : '125px'}
                    variant={'thick'}
                  />
                  <PointsStatsBoardAction
                    token={dlcBTC}
                    totalSupply={userPoints?.protocols.find(p => p.name == 'dlcBTC')?.points}
                    tokenSuffix={'Hold'}
                  />
                </Stack>
              </VStack>
              <Divider
                orientation={isMobile ? 'horizontal' : 'vertical'}
                px={isMobile ? '0px' : '5px'}
                height={isMobile ? '1px' : '320px'}
                variant={'thick'}
              />
              <PointsTable items={userPoints?.protocols} />
            </Stack>
          </TokenStatsBoardLayout>
        )}
        {!address && (
          <TokenStatsBoardLayout>
            <Stack
              w={'100%'}
              p={isMobile ? '15px' : '25px'}
              direction={isMobile ? 'column' : 'row'}
              spacing={isMobile ? '35px' : '0px'}
            >
              <VStack
                w={isMobile ? '100%' : '50%'}
                h={'100%'}
                pr={isMobile ? '0px' : '25px'}
                alignItems={'start'}
                spacing={isMobile ? '25px' : '45px'}
              >
                <VStack w={'100%'} h={'100%'} alignItems={'start'} spacing={'25px'}>
                  <HStack h={'25px'} spacing={'25px'}>
                    <Image
                      src={'./images/logos/dlc-btc-logo.svg'}
                      alt={'dlcBTC Logo'}
                      boxSize={'35px'}
                    />
                    <Text
                      color={'white'}
                      fontWeight={200}
                      fontSize={['xl', '2xl', '2xl', '4xl', '4xl']}
                    >
                      Use dlcBTC
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color={'white.02'}>
                      Put your dlcBTC to work in various activities like lending, staking, or
                      trading Participate and earn points for your involvement.
                    </Text>
                  </HStack>
                </VStack>
                <Button
                  bgGradient={`linear(to-r, #AC50EF, #7059FB, #2ECFF6)`}
                  w={'100%'}
                  variant={'points'}
                  onClick={() => window.open('https://www.dlc.link/earn-with-dlcbtc', '_blank')}
                >
                  <Text color={'white.01'}>Earn Points</Text>
                </Button>
              </VStack>
              <Divider
                orientation={isMobile ? 'horizontal' : 'vertical'}
                px={isMobile ? '0px' : '15px'}
                height={isMobile ? '1px' : '200px'}
                variant={'thick'}
                w={isMobile ? '100%' : '1px'}
              />
              <VStack
                w={isMobile ? '100%' : '50%'}
                h={'100%'}
                alignItems={'start'}
                spacing={isMobile ? '25px' : '45px'}
              >
                <VStack w={'100%'} h={'100%'} alignItems={'start'} spacing={'25px'}>
                  <HStack h={'25px'} spacing={'25px'}>
                    <Image
                      src={'./images/logos/bitcoin-logo.svg'}
                      alt={'dlcBTC Logo'}
                      boxSize={'35px'}
                    />
                    <Text
                      color={'white'}
                      fontWeight={200}
                      fontSize={['xl', '2xl', '2xl', '4xl', '4xl']}
                    >
                      Provide Bitcoin
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color={'white.02'}>
                      Become a merchant by providing BTC. Support the network and earn points for
                      your contributions.
                    </Text>
                  </HStack>
                </VStack>
                <Button
                  w={'100%'}
                  variant={'points'}
                  onClick={() => window.open('https://www.dlc.link/merchants', '_blank')}
                >
                  <Text bgGradient={`linear(to-r, #AC50EF, #7059FB, #2ECFF6)`} bgClip="text">
                    Become a Merchant
                  </Text>
                </Button>
              </VStack>
            </Stack>
          </TokenStatsBoardLayout>
        )}

        {/* <HStack w={'100%'} spacing={'20px'}>
        <MerchantTableLayout>
          <MerchantTableHeader />
          {exampleMerchantTableItems.map(item => (
            <MerchantTableItem key={item.merchant.name} {...item} />
          ))}
        </MerchantTableLayout>
        <ProtocolHistoryTable />
      </HStack> */}
      </>
    </PointsLayout>
  );
}
