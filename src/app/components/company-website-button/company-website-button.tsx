import { useNavigate } from 'react-router-dom';

import { Button, Image, useBreakpointValue } from '@chakra-ui/react';

export function CompanyWebsiteButton(): React.JSX.Element {
  const navigate = useNavigate();

  const logoPath = './images/logos/ibtc-logo.svg';
  const altText = 'iBTC Logo';
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Button onClick={() => navigate('/')} variant={'company'} boxSize={isMobile ? '54px' : '65px'}>
      <Image src={logoPath} alt={altText} width={isMobile ? '54px' : '65px'} />
    </Button>
  );
}
