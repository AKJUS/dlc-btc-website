import { useContext } from 'react';
import { useSelector } from 'react-redux';

import { HStack } from '@chakra-ui/react';
import { usePSBT } from '@hooks/use-psbt';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { RootState } from '@store/index';

import { ProgressTimeline } from '../progress-timeline/progress-timeline';
import { Walkthrough } from '../walkthrough/walkthrough';
import { UnmintVaultSelector } from './components/unmint-vault-selector';
import { UnmintLayout } from './components/unmint.layout';
import { WithdrawScreen } from './components/withdraw-screen';

export function Unmint(): React.JSX.Element {
  const {
    handleSignWithdrawTransaction,
    handleSignBitsafeWithdrawTransaction,
    isLoading: isBitcoinWalletLoading,
  } = usePSBT();
  const { networkType } = useContext(NetworkConfigurationContext);

  const { unmintStep, isBitsafeWithdraw } = useSelector((state: RootState) => state.mintunmint);

  // Use the appropriate handler based on Bitsafe flag
  const withdrawHandler = isBitsafeWithdraw
    ? handleSignBitsafeWithdrawTransaction
    : handleSignWithdrawTransaction;

  return (
    <UnmintLayout>
      <ProgressTimeline variant={'unmint'} currentStep={unmintStep.step} />
      <HStack w={'100%'} alignItems={'start'} justifyContent={'space-between'}>
        <Walkthrough flow={'unmint'} currentStep={unmintStep.step} networkType={networkType} />
        {[0].includes(unmintStep.step) && <UnmintVaultSelector />}
        {[1, 2].includes(unmintStep.step) && (
          <WithdrawScreen
            isBitcoinWalletLoading={isBitcoinWalletLoading ?? [false, '']}
            handleSignWithdrawTransaction={withdrawHandler}
          />
        )}
      </HStack>
    </UnmintLayout>
  );
}
