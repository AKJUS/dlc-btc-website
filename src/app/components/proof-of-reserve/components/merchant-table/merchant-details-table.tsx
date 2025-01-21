import { Skeleton, Text, useBreakpointValue } from '@chakra-ui/react';
import { GenericTableBody } from '@components/generic-table/components/generic-table-body';
import { GenericTableHeader } from '@components/generic-table/components/generic-table-header';
import { GenericTableHeaderText } from '@components/generic-table/components/generic-table-header-text';
import { GenericTableLayout } from '@components/generic-table/components/generic-table-layout';

import { MerchantDetailsTableItem } from './components/merchant-details-table-item';

interface MerchantDetailsTableProps {
  items?: any[];
}

export function MerchantDetailsTable({ items }: MerchantDetailsTableProps): React.JSX.Element {
  const dynamicHeight = items ? items.length * 75 + 20 : 20;
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <GenericTableLayout height={`${dynamicHeight}px`} isMobile={isMobile} isMerchant={true}>
      <GenericTableHeader>
        {isMobile ? (
          <>
            <GenericTableHeaderText w={'30%'}>Order Book</GenericTableHeaderText>
            <GenericTableHeaderText w={'25%'}>Amount</GenericTableHeaderText>
            <GenericTableHeaderText w={'30%'}>Transaction</GenericTableHeaderText>
          </>
        ) : (
          <>
            <GenericTableHeaderText w={'15%'}>Order Book</GenericTableHeaderText>
            <GenericTableHeaderText w={'15%'}>Amount</GenericTableHeaderText>
            <GenericTableHeaderText w={'15%'}>Transaction</GenericTableHeaderText>
            <GenericTableHeaderText w={'15%'}>Chain</GenericTableHeaderText>
            <GenericTableHeaderText w={'15%'}>Date</GenericTableHeaderText>
          </>
        )}
      </GenericTableHeader>
      <Skeleton isLoaded={items !== undefined} height={'50px'} w={'100%'}>
        {items?.length === 0 && (
          <Text color={'white'} p={'10px'}>
            No Transaction History to show.
          </Text>
        )}
        <GenericTableBody>
          {items?.map(item => <MerchantDetailsTableItem key={item.id} {...item} />)}
        </GenericTableBody>
      </Skeleton>
    </GenericTableLayout>
  );
}
