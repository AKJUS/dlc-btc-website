import { useBreakpointValue } from '@chakra-ui/react';
import { GenericTableBody } from '@components/generic-table/components/generic-table-body';
import { GenericTableHeader } from '@components/generic-table/components/generic-table-header';
import { GenericTableHeaderText } from '@components/generic-table/components/generic-table-header-text';
import { GenericTableLayout } from '@components/generic-table/components/generic-table-layout';

import { MerchantTableItem } from './components/merchant-table-item';

interface MerchantTableProps {
  items?: any[];
}

export function MerchantTable({ items }: MerchantTableProps): React.JSX.Element {
  const dynamicHeight = items ? items.length * 75 + 20 : 20;
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <GenericTableLayout
      height={isMobile ? 'auto' : `${dynamicHeight}px`}
      width={isMobile ? '100%' : '30%'}
      padding={isMobile ? '10px' : '15px'}
      isMobile={isMobile}
      isMerchant={true}
    >
      <GenericTableHeader>
        <GenericTableHeaderText w={'50%'}>Merchant</GenericTableHeaderText>
        <GenericTableHeaderText w={'100%'}>dlcBTC Minted</GenericTableHeaderText>
      </GenericTableHeader>

      <GenericTableBody>
        {items?.map(item => <MerchantTableItem key={item.merchant.name} {...item} />)}
      </GenericTableBody>
    </GenericTableLayout>
  );
}
