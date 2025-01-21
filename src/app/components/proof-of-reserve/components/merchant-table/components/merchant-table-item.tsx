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
  iBTCAmount: number | undefined;
}

export function MerchantTableItem({
  merchant,
  iBTCAmount,
}: MerchantTableItemProps): React.ReactElement {
  const navigate = useNavigate();

  const isMobile = useBreakpointValue({ base: true, xl: false });

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
        <HStack w={'100%'}>
          <HStack w={'auto'} justifyContent={'flex-start'}>
            <Image
              src={merchant.logo}
              alt={merchant.name}
              width={useBreakpointValue({
                base: '120px',
                md: '100px',
              })}
              maxWidth={'150px'}
              minWidth={'120px'}
            />
          </HStack>
          <HStack w={'100px'} h={'35px'} alignItems={'center'}>
            <Image src={'/images/logos/ibtc-logo.svg'} alt={'iBTC Logo'} boxSize={'25px'} />
            <Skeleton isLoaded={iBTCAmount !== undefined} h={'auto'} w={'50px'}>
              <Text
                color={'white'}
                fontSize={'lg'}
                fontWeight={800}
                h={'35px'}
                display={'flex'}
                alignItems={'center'}
              >
                {Number(iBTCAmount?.toFixed(4))}
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
