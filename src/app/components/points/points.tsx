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
import { iBTC } from '@models/token';
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

  const dividerHeight = useBreakpointValue({
    base: '1px',
    sm: '1px',
    md: '320px',
    lg: '250px',
    xl: '230px',
  });

  const spacingValue = useBreakpointValue({
    base: '25px',
    sm: '25px',
    md: '93px',
    lg: '70px',
    xl: '70px',
  });

  function onConnectWalletClick(): void {
    dispatch(modalActions.toggleSelectWalletModalVisibility());
  }

  return (
    <PointsLayout>
      <>
        <Text w={'100%'} color={'white'} fontSize={titleTextSize} fontWeight={500}>
          Use iBTC -{' '}
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
                    token={iBTC}
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
                    token={iBTC}
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
                spacing={spacingValue}
              >
                <VStack w={'100%'} h={'100%'} alignItems={'start'} spacing={'25px'}>
                  <HStack h={'25px'} spacing={'25px'}>
                    <Image
                      src={'./images/logos/ibtc-logo.svg'}
                      alt={'iBTC Logo'}
                      boxSize={'35px'}
                    />
                    <Text
                      color={'white'}
                      fontWeight={200}
                      fontSize={['xl', 'xl', 'xl', '2xl', '4xl']}
                    >
                      Use iBTC
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color={'white.02'}>
                      Put your iBTC to work in various activities like lending, staking, or trading
                      Participate and earn points for your involvement.
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
                height={dividerHeight}
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
                    <Text
                      color={'white'}
                      fontWeight={200}
                      fontSize={['xl', 'xl', 'xl', '2xl', '4xl']}
                    >
                      How to earn points
                    </Text>
                  </HStack>
                  <HStack>
                    <Text color={'white.02'}>
                      Looking for a safer way to earn yield on your Bitcoin while also earning
                      points? iBTC is introducing a rewards program that distributes points for
                      holding, staking, and supporting iBTC.
                    </Text>
                  </HStack>
                </VStack>
                <Button
                  w={'100%'}
                  variant={'points'}
                  onClick={() =>
                    window.open(
                      'https://media.ibtc.network/p/safe-btc-yield-meets-points-how-ibtc-s-points-system-works',
                      '_blank'
                    )
                  }
                >
                  <Text bgGradient={`linear(to-r, #AC50EF, #7059FB, #2ECFF6)`} bgClip="text">
                    Read more
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
