/* eslint-disable */
import { HStack, Image, Text, useBreakpointValue } from '@chakra-ui/react';
import { CustomSkeleton } from '@components/custom-skeleton/custom-skeleton';
import { DetailedEvent } from '@models/ethereum-models';
import { truncateAddress, unshiftValue } from 'dlc-btc-lib/utilities';

import { findEthereumNetworkByName, formatEvent } from '@shared/utils';

export function MerchantDetailsTableItem(merchantFocusTableItem: DetailedEvent): React.JSX.Element {
  if (!merchantFocusTableItem) return <CustomSkeleton height={'35px'} />;

  const {
    iBTCAmount,
    txHash,
    date,
    isMint,
    chain: eventChain,
  } = formatEvent(merchantFocusTableItem);

  const ethereumNetwork = findEthereumNetworkByName(eventChain);
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <HStack
      p={'10px'}
      w={'100%'}
      h={'50px'}
      bg={isMint ? 'table.background.green' : 'table.background.red'}
      blendMode={'screen'}
      border={'1px solid'}
      borderRadius={'md'}
      borderColor={'border.white.01'}
      justifyContent={'space-between'}
    >
      {isMobile ? (
        <>
          <HStack w={'30%'}>
            <Text color={isMint ? 'green.mint' : 'red.redeem'} fontSize={'sm'} fontWeight={700}>
              {isMint ? 'MINT' : 'REDEEM'}
            </Text>
          </HStack>
          <HStack w={'30%'}>
            <Image src={'/images/logos/ibtc-logo.svg'} alt={'dlc BTC logo'} boxSize={'25px'} />
            <Text color={'white'} fontSize={'sm'} fontWeight={800}>
              {unshiftValue(iBTCAmount)}
            </Text>
          </HStack>
          <HStack w={'30%'}>
            <Text
              color={'accent.lightBlue.01'}
              fontSize={'sm'}
              onClick={() =>
                window.open(`${ethereumNetwork.blockExplorers?.default.url}/tx/${txHash}`, '_blank')
              }
              cursor={'pointer'}
              textDecoration={'underline'}
            >
              {truncateAddress(txHash)}
            </Text>
          </HStack>
        </>
      ) : (
        <>
          <HStack w={'15%'}>
            <Text color={isMint ? 'green.mint' : 'red.redeem'} fontSize={'sm'} fontWeight={700}>
              {isMint ? 'MINT' : 'REDEEM'}
            </Text>
          </HStack>
          <HStack w={'15%'}>
            <Image src={'/images/logos/ibtc-logo.svg'} alt={'dlc BTC logo'} boxSize={'25px'} />
            <Text color={'white'} fontSize={'sm'} fontWeight={800}>
              {unshiftValue(iBTCAmount)}
            </Text>
          </HStack>
          {/* add back the USD calculation later and adjus the width accordingly */}
          {/* <Text w={'20%'} color={'white'} fontSize={'sm'}>
        {inUSD}
      </Text> */}
          <HStack w={'15%'}>
            <Text
              color={'accent.lightBlue.01'}
              fontSize={'sm'}
              onClick={() =>
                window.open(`${ethereumNetwork.blockExplorers?.default.url}/tx/${txHash}`, '_blank')
              }
              cursor={'pointer'}
              textDecoration={'underline'}
            >
              {truncateAddress(txHash)}
            </Text>
          </HStack>
          <HStack w={'15%'}>
            <Text color={'white'} fontSize={'sm'}>
              {ethereumNetwork.name}
            </Text>
          </HStack>
          <HStack w={'15%'}>
            <Text color={'white'} fontSize={'sm'}>
              {date}
            </Text>
          </HStack>
        </>
      )}
    </HStack>
  );
}
