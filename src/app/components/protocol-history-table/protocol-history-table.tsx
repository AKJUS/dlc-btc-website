import { useMemo, useState } from 'react';

import { Button, HStack, Skeleton, Spacer, VStack, useBreakpointValue } from '@chakra-ui/react';
import { GenericTableBody } from '@components/generic-table/components/generic-table-body';
import { GenericTableHeader } from '@components/generic-table/components/generic-table-header';
import { GenericTableHeaderText } from '@components/generic-table/components/generic-table-header-text';
import { GenericTableLayout } from '@components/generic-table/components/generic-table-layout';
import { ProtocolHistoryTableItem } from '@components/protocol-history-table/components/protocol-history-table-item';
import { DetailedEvent } from '@models/ethereum-models';
import { unshiftValue } from 'dlc-btc-lib/utilities';

import { formatToFourDecimals } from '@shared/utils';

interface ProtocolHistoryTableProps {
  items?: DetailedEvent[];
}

export function ProtocolHistoryTable({ items }: ProtocolHistoryTableProps): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter(item => {
      const { value } = item;
      const displayAmount =
        formatToFourDecimals(unshiftValue(value)) === 0
          ? null
          : formatToFourDecimals(unshiftValue(value));
      return displayAmount !== null && !isNaN(displayAmount);
    });
  }, [items]);

  const totalPages = Math.ceil((filteredItems?.length || 0) / itemsPerPage);

  const currentItems = filteredItems?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (direction: number) => {
    setCurrentPage(prevPage => {
      const newPage = prevPage + direction;
      if (newPage < 1 || newPage > totalPages) return prevPage;
      return newPage;
    });
  };

  return (
    <VStack w={'100%'} spacing={4}>
      <GenericTableLayout height={'680px'} width={'100%'} isMobile={isMobile} isMerchant={true}>
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
            {currentItems?.map((item, idx) => <ProtocolHistoryTableItem key={idx} {...item} />)}
          </GenericTableBody>
        </Skeleton>
        <Spacer />
        <HStack spacing={4} justifyContent={'center'} w={'100%'}>
          <Button
            variant={'wallet'}
            h={'40px'}
            w={'100px'}
            onClick={() => handlePageChange(-1)}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant={'wallet'}
            h={'40px'}
            w={'100px'}
            onClick={() => handlePageChange(1)}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </HStack>
      </GenericTableLayout>
    </VStack>
  );
}
