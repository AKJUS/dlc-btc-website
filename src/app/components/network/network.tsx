import { HStack, useBreakpointValue } from '@chakra-ui/react';

import { NetworksMenu } from './components/networks-menu';

interface NetworkBoxProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
}

export function NetworkBox({ isMenuOpen, setIsMenuOpen }: NetworkBoxProps): React.JSX.Element {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <HStack w={isMobile ? '50px' : '175px'} h={isMobile ? '50px' : 'auto'}>
      <NetworksMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </HStack>
  );
}
