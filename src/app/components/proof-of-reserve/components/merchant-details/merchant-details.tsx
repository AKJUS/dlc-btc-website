import { useContext } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Divider,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { bitcoin, iBTC } from '@models/token';
import { ProofOfReserveContext } from '@providers/proof-of-reserve-context-provider';

import { titleTextSize } from '@shared/utils';

import { MerchantDetailsTable } from '../merchant-table/merchant-details-table';
import { TokenStatsBoardToken } from '../token-stats-board/components/token-stats-board-token';
import { TokenStatsBoardTVL } from '../token-stats-board/components/token-stats-board-tvl';
import { TokenStatsBoardLayout } from '../token-stats-board/token-stats-board.layout';
import { MerchantDetailsLayout } from './components/merchant-details-layout';

export function MerchantDetails(): React.JSX.Element {
  const { name } = useParams();
  const { proofOfReserve, bitcoinPrice, merchantMintBurnEvents } =
    useContext(ProofOfReserveContext);
  const navigate = useNavigate();

  const selectedMerchant = proofOfReserve?.[1].find(item => item.merchant.name === name);
  const mintBurnEvents = merchantMintBurnEvents?.find(item => item.name === name)?.mintBurnEvents;
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!name) return <Text>Error: No merchant name provided</Text>;

  return (
    <MerchantDetailsLayout>
      <Text
        w={'100%'}
        color={'white'}
        fontSize={titleTextSize}
        fontWeight={600}
        pt={'50px'}
        lineHeight={isMobile ? '35px' : '60px'}
      >
        {`${name}`}
        <br />
        {'Dashboard'}
      </Text>
      <Link
        color="accent.lightBlue.01"
        fontSize="lg"
        fontWeight="regular"
        textDecoration="underline"
        onClick={() => navigate('/proof-of-reserve')}
      >
        <HStack spacing={2} alignItems="center">
          <Icon as={MdArrowBack} />
          <Text>Back to the List</Text>
        </HStack>
      </Link>

      <TokenStatsBoardLayout width={'100%'}>
        <Stack
          w={'100%'}
          alignItems={isMobile ? 'flex-start' : 'center'}
          direction={isMobile ? 'column' : 'row'}
          gap={isMobile ? '20px' : '0px'}
        >
          <Image
            src={selectedMerchant?.merchant.logo}
            alt={'Merchant logo'}
            width={isMobile ? '150px' : '100px'}
            mx={isMobile ? '0px' : '30px'}
          />
          <Divider
            orientation={isMobile ? 'horizontal' : 'vertical'}
            px={isMobile ? '0px' : '10px'}
            height={isMobile ? '1px' : '75px'}
            variant={'thick'}
          />
          <TokenStatsBoardTVL
            totalSupply={selectedMerchant?.iBTCAmount}
            bitcoinPrice={bitcoinPrice}
          />
          <Divider
            orientation={isMobile ? 'horizontal' : 'vertical'}
            px={isMobile ? '0px' : '10px'}
            height={isMobile ? '1px' : '75px'}
            variant={'thick'}
          />
          <TokenStatsBoardToken token={iBTC} totalSupply={selectedMerchant?.iBTCAmount} />
          <Divider
            orientation={isMobile ? 'horizontal' : 'vertical'}
            px={isMobile ? '0px' : '10px'}
            height={isMobile ? '1px' : '75px'}
            variant={'thick'}
          />
          <TokenStatsBoardToken token={bitcoin} totalSupply={selectedMerchant?.iBTCAmount} />
        </Stack>
      </TokenStatsBoardLayout>
      <MerchantDetailsTable items={mintBurnEvents} />
    </MerchantDetailsLayout>
  );
}
