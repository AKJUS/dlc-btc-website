import { Text } from '@chakra-ui/react';

import { AttestorDetailsCard } from './components/attestor-details-card/attestor-details-card';
import { AttestorDetailsCardLayout } from './components/attestor-details-card/attestor-details-card-layout';
import { AttestorDetailsDonutChart } from './components/attestor-details-card/attestor-details-donut-chart';
import { AttestorDetailsRateCard } from './components/attestor-details-card/attestor-details-rate-card';
import { AttestorDetailsValidatorsCard } from './components/attestor-details-card/attestor-details-validators-card';
import { AttestorDetailsLayout } from './components/attestor-details-layout';
import { AttestorDetailsTable } from './components/attestor-details-table/attestor-details-table';

const donutData = [
  { name: 'Mark', value: 90 },
  { name: 'Robert', value: 12 },
  { name: 'Emily', value: 34 },
  { name: 'Marion', value: 53 },
  { name: 'Nicolas', value: 98 },
];

export function AttestorDetails(): React.JSX.Element {
  return (
    <AttestorDetailsLayout>
      <Text w={'100%'} color={'white'} fontSize={'6xl'} fontWeight={500}>
        iBTC Attestor Details
      </Text>
      <AttestorDetailsCard>
        <AttestorDetailsCardLayout width={'310px'}>
          <AttestorDetailsValidatorsCard />
        </AttestorDetailsCardLayout>
        <AttestorDetailsCardLayout width={'620px'}>
          <AttestorDetailsRateCard width={'280px'} />
        </AttestorDetailsCardLayout>
        <AttestorDetailsCardLayout width={'310px'}>
          <AttestorDetailsDonutChart width={250} height={250} data={donutData} />
        </AttestorDetailsCardLayout>
      </AttestorDetailsCard>
      <AttestorDetailsTable />
    </AttestorDetailsLayout>
  );
}
