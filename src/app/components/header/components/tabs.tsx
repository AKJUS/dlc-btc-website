import { HStack } from '@chakra-ui/react';
import { TabButton } from '@components/tab-button/tab-button';
import { useActiveTabs } from '@hooks/use-active-tabs';

interface NavigationTabsProps {
  activeTab: string;
  handleTabClick: (route: string) => void;
}

export function NavigationTabs({
  activeTab,
  handleTabClick,
}: NavigationTabsProps): React.JSX.Element {
  const { isActiveTabs } = useActiveTabs();

  return (
    <HStack spacing={'25px'} marginRight={'150px'}>
      <TabButton
        title={'Points'}
        isActive={activeTab === '/'}
        handleClick={() => handleTabClick('/')}
      />
      <TabButton
        title={'Proof of Reserve'}
        isActive={activeTab === '/proof-of-reserve'}
        handleClick={() => handleTabClick('/proof-of-reserve')}
      />
      {/* <TabButton
        title={'How It Works'}
        isActive={activeTab === '/how-it-works'}
        handleClick={() => handleTabClick('/how-it-works')}
      /> */}

      {isActiveTabs && (
        <>
          <TabButton
            title={'Mint/Withdraw iBTC'}
            isActive={activeTab === '/mint-withdraw'}
            handleClick={() => handleTabClick('/mint-withdraw')}
          />
          <TabButton
            title={'My Vaults'}
            isActive={activeTab === '/my-vaults'}
            handleClick={() => handleTabClick('/my-vaults')}
          />
        </>
      )}
    </HStack>
  );
}
