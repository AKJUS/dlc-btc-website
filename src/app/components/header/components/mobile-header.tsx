import React from 'react';
import { useNavigate } from 'react-router-dom';

import { HamburgerIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { Account } from '@components/account/account';
import { CompanyWebsiteButton } from '@components/company-website-button/company-website-button';
import { NetworkBox } from '@components/network/network';

import { HeaderLayout } from './header.layout';

interface MobileHeaderProps {
  isNetworkMenuOpen: boolean;
  setIsNetworkMenuOpen: (isOpen: boolean) => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ isNetworkMenuOpen, setIsNetworkMenuOpen }) => {
  const navigate = useNavigate();
  return (
    <HeaderLayout>
      <HStack justifyContent={'space-between'} w={'100%'} gap={'0px'}>
        <CompanyWebsiteButton />
        <HStack>
          <NetworkBox isMenuOpen={isNetworkMenuOpen} setIsMenuOpen={setIsNetworkMenuOpen} />
          <Account />
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label={'Options'}
              icon={<HamburgerIcon boxSize={6} />}
              justifyContent={'center'}
              h={'50px'}
              w={'50px'}
              bg={'background.content.01'}
              border={'1.5px solid'}
              borderColor={'border.white.01'}
              borderRadius={'md'}
              color={'white'}
              fontWeight={600}
            />
            <MenuList
              p={'5px'}
              w={'200px'}
              bgColor={'background.container.01'}
              border={'1.5px solid'}
              borderColor={'border.white.01'}
              borderRadius={'md'}
            >
              <MenuItem
                justifyContent={'center'}
                bgColor={'inherit'}
                borderRadius={'md'}
                color={'white'}
                fontSize={'xs'}
                fontWeight={400}
                transition={'all 0.05s ease-in-out'}
                onClick={() => navigate('/')}
              >
                Points
              </MenuItem>
              <MenuItem
                justifyContent={'center'}
                bgColor={'inherit'}
                borderRadius={'md'}
                color={'white'}
                fontSize={'xs'}
                fontWeight={400}
                transition={'all 0.05s ease-in-out'}
                onClick={() => navigate('/proof-of-reserve')}
              >
                Proof of Reserve
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </HStack>
    </HeaderLayout>
  );
};

export default MobileHeader;
