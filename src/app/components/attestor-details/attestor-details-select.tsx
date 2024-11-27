import { MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { HStack, Icon, Text } from '@chakra-ui/react';

import { ActivityCardRow } from './components/attestor-details-card/activity-card-row';
import { AttestorDetailsActivityCard } from './components/attestor-details-card/attestor-details-activity-card';
import { AttestorDetailsCard } from './components/attestor-details-card/attestor-details-card';
import { AttestorDetailsCardItem } from './components/attestor-details-card/attestor-details-card-item';
import { AttestorDetailsCardLayout } from './components/attestor-details-card/attestor-details-card-layout';
import { AttestorDetailsTotalCard } from './components/attestor-details-card/attestor-details-total-card';
import { AttestorDetailsLayout } from './components/attestor-details-layout';
import { AttestorSelectTable } from './components/attestor-details-table/attestor-select-table';

export function AttestorDetailsSelect(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <AttestorDetailsLayout>
      <Text w={'100%'} color={'white'} fontSize={'6xl'} fontWeight={500}>
        DLC-Link Attestor 1
      </Text>
      <Text variant={'navigate'} fontSize={'xl'} onClick={() => navigate('/attestor-details')}>
        <HStack spacing={2} alignItems="center">
          <Icon as={MdArrowBack} />
          <Text>Back to the List</Text>
        </HStack>
      </Text>

      <AttestorDetailsCard>
        <AttestorDetailsCardLayout
          width={'245px'}
          bgGradient={`linear(to-r, #AC50EF, #7059FB, #2ECFF6)`}
        >
          <AttestorDetailsTotalCard>
            <>
              <AttestorDetailsCardItem label={'Validation Success Rate'}>
                <Text fontSize={'4xl'} fontWeight={600} color={'white'}>
                  100%
                </Text>
              </AttestorDetailsCardItem>

              <AttestorDetailsCardItem label={'Total Validations'}>
                <Text color={'white'} fontSize={'xl'} fontWeight={600}>
                  2
                </Text>
              </AttestorDetailsCardItem>
            </>
          </AttestorDetailsTotalCard>
        </AttestorDetailsCardLayout>
        <AttestorDetailsCardLayout
          width={'245px'}
          bgGradient={`linear(to-r, #AC50EF, #7059FB, #2ECFF6)`}
        >
          <AttestorDetailsTotalCard>
            <>
              <AttestorDetailsCardItem label={'Total Delegation'}>
                <Text fontSize={'4xl'} fontWeight={600} color={'white'}>
                  100%
                </Text>
              </AttestorDetailsCardItem>
              <AttestorDetailsCardItem label={'Total Delegation'}>
                <Text color={'white'} fontSize={'xl'} fontWeight={600}>
                  5
                </Text>
              </AttestorDetailsCardItem>
            </>
          </AttestorDetailsTotalCard>
        </AttestorDetailsCardLayout>
        <AttestorDetailsCardLayout width={'245px'}>
          <AttestorDetailsActivityCard label={'Active Delegation'}>
            <>
              <ActivityCardRow name={'Fee'} value={'2.00%'}></ActivityCardRow>
              <ActivityCardRow name={'Max Yield'} value={'2.00%'}></ActivityCardRow>
              <ActivityCardRow name={'Delegations'} value={'78'}></ActivityCardRow>
            </>
          </AttestorDetailsActivityCard>
        </AttestorDetailsCardLayout>
        <AttestorDetailsCardLayout width={'480px'}>
          <AttestorDetailsActivityCard label={'Active Validation'}>
            <>
              <ActivityCardRow name={'Time Left'} value={'347 days and 20 hours'}></ActivityCardRow>
              <ActivityCardRow name={'Average Response'} value={'100.00%'}></ActivityCardRow>
              <ActivityCardRow
                name={'Potential rewards'}
                value={'1,354.121 iBTC'}
              ></ActivityCardRow>
            </>
          </AttestorDetailsActivityCard>
        </AttestorDetailsCardLayout>
      </AttestorDetailsCard>
      <AttestorSelectTable />
    </AttestorDetailsLayout>
  );
}
