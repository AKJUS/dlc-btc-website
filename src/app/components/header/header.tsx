import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { VStack, useBreakpointValue } from '@chakra-ui/react';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { NetworkConnectionContext } from '@providers/network-connection.provider';
import { useAccount } from 'wagmi';

import { NetworkType } from '@shared/constants/network.constants';

import { Banner } from './components/banner';
import DesktopHeader from './components/desktop-header';
import MobileHeader from './components/mobile-header';

export function Header(): React.JSX.Element {
  const navigate = useNavigate();
  const { isConnected } = useContext(NetworkConnectionContext);

  const { networkType } = useContext(NetworkConfigurationContext);
  const { chain: ethereumNetwork } = useAccount();

  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState<boolean>(false);

  const handleTabClick = (route: string) => {
    navigate(route);
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (networkType === NetworkType.EVM && isConnected && !ethereumNetwork) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, ethereumNetwork]);

  return (
    <VStack>
      {showBanner && (
        <Banner
          handleButtonClick={() => {
            setIsNetworkMenuOpen(true);
          }}
        />
      )}
      {isMobile ? (
        <MobileHeader
          isNetworkMenuOpen={isNetworkMenuOpen}
          setIsNetworkMenuOpen={setIsNetworkMenuOpen}
        />
      ) : (
        <DesktopHeader
          isNetworkMenuOpen={isNetworkMenuOpen}
          setIsNetworkMenuOpen={setIsNetworkMenuOpen}
          handleTabClick={handleTabClick}
        />
      )}
    </VStack>
  );
}
