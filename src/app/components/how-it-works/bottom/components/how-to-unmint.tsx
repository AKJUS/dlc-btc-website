import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Image, Text } from '@chakra-ui/react';
import { mintUnmintActions } from '@store/slices/mintunmint/mintunmint.actions';
import { RedeemSteps } from '@store/slices/mintunmint/mintunmint.slice';

import { CustomCard } from '../../components/custom-card';
import { FlowStep } from './flow-step';

export function HowToUnmint(): React.JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <CustomCard width={'488px'} height={'343px'} padding={'25px'}>
      {
        <>
          <Text variant={'title'}>How to withdraw BTC</Text>
          <Image src={'/images/unmintBtc.png'} alt={'unmint image'} h={'39px'} w={'185px'} />
          <Box h={'25px'} />
          <FlowStep
            step={'Step 1'}
            title={'Unmint iBTC'}
            content={
              <Text color={'white'}>
                Select the vault you would like to redeem from. After a successful withdraw you will
                receive BTC in the same amount back to your wallet.
              </Text>
            }
            hasBadge={false}
          />
          <Button
            onClick={() => {
              navigate('/mint-withdraw');
              dispatch(
                mintUnmintActions.setUnmintStep({ step: RedeemSteps.BURN, vault: undefined })
              );
              close();
            }}
            variant={'account'}
          >
            Unmint iBTC
          </Button>
        </>
      }
    </CustomCard>
  );
}
