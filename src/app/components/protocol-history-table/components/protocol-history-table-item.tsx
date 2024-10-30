/* eslint-disable */
import { HStack, Image, Text, useBreakpointValue } from '@chakra-ui/react';
import { CustomSkeleton } from '@components/custom-skeleton/custom-skeleton';
import { DetailedEvent } from '@models/ethereum-models';
import { truncateAddress, unshiftValue } from 'dlc-btc-lib/utilities';

import { findEthereumNetworkByName, formatEvent } from '@shared/utils';

export function ProtocolHistoryTableItem(
  protocolHistoryTableItem: DetailedEvent
): React.JSX.Element {
  if (!protocolHistoryTableItem) return <CustomSkeleton height={'35px'} />;

  const {
    merchant,
    dlcBTCAmount,
    txHash,
    date,
    isMint,
    chain: eventChain,
  } = formatEvent(protocolHistoryTableItem);

  const ethereumNetwork = findEthereumNetworkByName(eventChain);

  console.log('dlcBTCAmount', dlcBTCAmount);
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
          <HStack w={'50%'}>
            <Image src={'/images/logos/dlc-btc-logo.svg'} alt={'dlcBTC Logo'} boxSize={'20px'} />
            <Text color={'white'} fontWeight={800}>
              {unshiftValue(dlcBTCAmount)}
            </Text>
          </HStack>
          <HStack w={'50%'}>
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
          <HStack w={'20%'}>
            <Image src={'/images/logos/dlc-btc-logo.svg'} alt={'dlcBTC Logo'} boxSize={'20px'} />
            <Text color={'white'} fontWeight={800}>
              {unshiftValue(dlcBTCAmount)}
            </Text>
          </HStack>
          <HStack w={'20%'}>
            <Text color={'white'} fontSize={'sm'} fontWeight={800}>
              {truncateAddress(merchant)}
            </Text>
          </HStack>
          <HStack w={'20%'}>
            <Text color={'white'} fontSize={'sm'} fontWeight={800}>
              {ethereumNetwork.name}
            </Text>
          </HStack>
          <HStack w={'20%'}>
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
          <HStack w={'20%'}>
            <Text color={'white'} fontSize={'sm'}>
              {date}
            </Text>
          </HStack>
        </>
      )}
      {/* <HStack w={'25%'}>
        <Image src={'/images/logos/dlc-btc-logo.svg'} alt={'dlcBTC Logo'} boxSize={'20px'} />
        <Text color={'white'} fontWeight={800}>
          {unshiftValue(dlcBTCAmount)}
        </Text>
      </HStack>
      <HStack w={'25%'}>
        <Text color={'white'} fontSize={'sm'} fontWeight={800}>
          {truncateAddress(merchant)}
        </Text>
      </HStack>
      <HStack w={'25%'}>
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
      <HStack w={'25%'}>
        <Text color={'white'} fontSize={'sm'}>
          {date}
        </Text>
      </HStack> */}
    </HStack>
  );
}
