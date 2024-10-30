import { Skeleton, useBreakpointValue } from '@chakra-ui/react';
import { GenericTableBody } from '@components/generic-table/components/generic-table-body';
import { GenericTableHeader } from '@components/generic-table/components/generic-table-header';
import { GenericTableHeaderText } from '@components/generic-table/components/generic-table-header-text';
import { GenericTableLayout } from '@components/generic-table/components/generic-table-layout';
import { ProtocolHistoryTableItem } from '@components/protocol-history-table/components/protocol-history-table-item';

interface ProtocolHistoryTableProps {
  items?: any[];
}

export function ProtocolHistoryTable({ items }: ProtocolHistoryTableProps): React.JSX.Element {
  const dynamicHeight = items ? items.length * 59 + 20 : 20;
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <GenericTableLayout height={`${dynamicHeight}px`} width={'70%'} isMobile={isMobile}>
      <GenericTableHeader>
        {isMobile ? (
          <>
            <GenericTableHeaderText w={'50%'}>Order Book</GenericTableHeaderText>
            <GenericTableHeaderText w={'50%'}>Transaction</GenericTableHeaderText>
          </>
        ) : (
          <>
            <GenericTableHeaderText w={'20%'}>Order Book</GenericTableHeaderText>
            <GenericTableHeaderText w={'20%'}>Merchant</GenericTableHeaderText>
            <GenericTableHeaderText w={'20%'}>Chain</GenericTableHeaderText>
            <GenericTableHeaderText w={'20%'}>Transaction</GenericTableHeaderText>
            <GenericTableHeaderText w={'20%'}>Date</GenericTableHeaderText>
          </>
        )}
      </GenericTableHeader>
      <Skeleton isLoaded={items !== undefined} height={'50px'} w={'100%'}>
        <GenericTableBody>
          {items?.map(item => <ProtocolHistoryTableItem key={item.id} {...item} />)}
        </GenericTableBody>
      </Skeleton>
    </GenericTableLayout>
  );
}
