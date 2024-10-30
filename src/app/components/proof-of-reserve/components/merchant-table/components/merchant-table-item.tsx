import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Divider,
  HStack,
  Image,
  Skeleton,
  Stack,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Merchant } from '@models/merchant';

interface MerchantTableItemProps {
  merchant: Merchant;
  dlcBTCAmount: number | undefined;
}

export function MerchantTableItem({
  merchant,
  dlcBTCAmount,
}: MerchantTableItemProps): React.ReactElement {
  const navigate = useNavigate();

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <VStack w={'100%'} gap={isMobile ? '20px' : '10px'}>
      <Stack
        justifyContent={'space-between'}
        py={'5px'}
        w={'100%'}
        alignItems={isMobile ? 'center' : 'flex-start'}
        direction={isMobile ? 'column' : 'row'}
        gap={isMobile ? '10px' : '0px'}
      >
        <HStack>
          <HStack w={isMobile ? 'auto' : 'auto'}>
            <Image src={merchant.logo} alt={merchant.name} width={'150px'} />
          </HStack>
          <HStack w={'140px'} h={'35px'} alignItems={'center'}>
            <Image src={'/images/logos/dlc-btc-logo.svg'} alt={'dlcBTC Logo'} boxSize={'25px'} />
            <Skeleton isLoaded={dlcBTCAmount !== undefined} h={'auto'} w={'150px'}>
              <Text
                color={'white'}
                fontSize={'xl'}
                fontWeight={800}
                h={'35px'}
                display={'flex'}
                alignItems={'center'}
              >
                {Number(dlcBTCAmount?.toFixed(4))}
              </Text>
            </Skeleton>
          </HStack>
        </HStack>

        <Button
          w={isMobile ? '100%' : '100px'}
          variant={'merchantTableItem'}
          onClick={() => navigate(`/merchant-details/${merchant.name}`)}
        >
          <Text color={'white.01'} fontSize={'xs'}>
            History
          </Text>
        </Button>
      </Stack>
      <Divider orientation={'horizontal'} />
    </VStack>
  );
}
