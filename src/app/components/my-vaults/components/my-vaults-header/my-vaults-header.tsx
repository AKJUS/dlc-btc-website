import { Divider, HStack, Text, VStack } from '@chakra-ui/react';

import { MyVaultsHeaderBalanceInfo } from './components/my-vaults-header-balance-info';

interface MyVaultsLargeHeaderProps {
  isConnected: boolean;
  dlcBTCBalance?: number;
  lockedBTCBalance?: number;
}

export function MyVaultsLargeHeader({
  isConnected,
  dlcBTCBalance,
  lockedBTCBalance,
}: MyVaultsLargeHeaderProps): React.JSX.Element {
  return (
    <VStack w={'100%'} h={'100px'}>
      <HStack w={'100%'} h={'150px'} justifyContent={'space-between'} pr={'25px'}>
        <Text color={'white'} fontSize={'4xl'} fontWeight={600}>
          My Vaults
        </Text>
        <HStack w={'450px'} h={'75%'} justifyContent={'space-between'}>
          <Divider orientation={'vertical'} h={'35px'} variant={'thick'} />
          <MyVaultsHeaderBalanceInfo
            title={'Available dlcBTC'}
            imageSrc={'/images/logos/dlc-btc-logo.svg'}
            altText={'dlcBTC Logo'}
            assetAmount={dlcBTCBalance}
            showNone={!isConnected}
          />
          <Divider orientation={'vertical'} h={'35px'} variant={'thick'} />
          <MyVaultsHeaderBalanceInfo
            title={'Locked BTC'}
            imageSrc={'/images/logos/bitcoin-logo.svg'}
            altText={'Bitcoin Logo'}
            assetAmount={lockedBTCBalance}
            showNone={!isConnected}
          />
        </HStack>
      </HStack>
      <Divider variant={'thick'} />
    </VStack>
  );
}
