import { VStack, useBreakpointValue } from '@chakra-ui/react';
import { GenericTableBody } from '@components/generic-table/components/generic-table-body';
import { GenericTableHeader } from '@components/generic-table/components/generic-table-header';
import { GenericTableHeaderText } from '@components/generic-table/components/generic-table-header-text';
import { GenericTableLayout } from '@components/generic-table/components/generic-table-layout';

import { MerchantTableItem } from './components/merchant-table-item';

interface MerchantTableProps {
  items?: any[];
}

export function MerchantTable({ items }: MerchantTableProps): React.JSX.Element {
  const isMobile = useBreakpointValue({ base: true, xl: false });
  const dynamicHeight = items ? items.length * 75 + 20 : 20;

  const widthValue = useBreakpointValue({
    base: '100%',
    md: '50%',
    lg: '40%',
    xl: 'auto',
  });
  return (
    <VStack w={widthValue}>
      <GenericTableLayout
        height={isMobile ? 'auto' : `${dynamicHeight}px`}
        padding={isMobile ? '10px' : '15px'}
        isMobile={isMobile}
        isMerchant={true}
        width={widthValue}
      >
        <GenericTableHeader>
          <GenericTableHeaderText w={'50%'}>Merchant</GenericTableHeaderText>
          <GenericTableHeaderText w={'100%'}>iBTC Minted</GenericTableHeaderText>
        </GenericTableHeader>
        <GenericTableBody>
          {items
            ?.sort((a, b) => b.iBTCAmount - a.iBTCAmount)
            .map(item => <MerchantTableItem key={item.merchant.name} {...item} />)}
        </GenericTableBody>
      </GenericTableLayout>
    </VStack>
  );
}
