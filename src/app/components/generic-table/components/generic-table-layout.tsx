import { VStack } from '@chakra-ui/react';

interface GenericTableLayoutProps {
  width?: string;
  height?: string;
  padding?: string;
  alignItems?: string;
  borderRadius?: string;
  bg?: string;
  children: React.ReactNode;
  isMobile?: boolean;
  isMerchant?: boolean;
}

export function GenericTableLayout({
  width = '100%',
  height = '500px',
  padding = '15px',
  alignItems = 'flex-start',
  borderRadius = 'md',
  children,
  bg = 'background.container.01',
  isMobile = false,
  isMerchant = false,
}: GenericTableLayoutProps): React.JSX.Element {
  return (
    <VStack
      w={isMobile ? '100%' : width}
      h={height}
      minH={'100px'}
      padding={isMobile ? (isMerchant ? '10px' : '0px') : padding}
      alignItems={alignItems}
      borderRadius={borderRadius}
      bg={bg}
    >
      {children}
    </VStack>
  );
}
