import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Image, Text } from '@chakra-ui/react';
import { IntroVideo } from '@components/how-it-works/top/components/intro-video';
import { mintUnmintActions } from '@store/slices/mintunmint/mintunmint.actions';
import { MintSteps } from '@store/slices/mintunmint/mintunmint.slice';

import { CustomCard } from '../../components/custom-card';
import { FlowStep } from './flow-step';

export function HowToMint(): React.JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <CustomCard width={'488px'} height={'970px'} padding={'25px'}>
      {
        <>
          <Text variant={'title'}>How to Mint iBTC</Text>
          <Image src={'/images/mintBtc.png'} alt={'mint image'} h={'39px'} w={'185px'} />
          <Box h={'25px'} />
          <FlowStep
            step={'Step 1'}
            title={'Deposit Address'}
            content={
              <Text color={'white'}>
                Select an amount of Bitcoin you would like to lock and confirm it in your{' '}
                <Text as={'span'} color={'accent.lightBlue.01'}>
                  Ethereum Wallet.{' '}
                </Text>
                You will receive your deposit token iBTC to the same address.
              </Text>
            }
            hasBadge={false}
          />
          <FlowStep
            step={'Step 2'}
            title={'Lock Bitcoin'}
            content={
              <Text color={'white'}>
                Confirm the transaction in your{' '}
                <Text as={'span'} color={'accent.lightBlue.01'}>
                  Bitcoin Wallet
                </Text>{' '}
                which will lock your Bitcoin on-chain.
              </Text>
            }
            hasBadge={false}
          />
          <FlowStep
            step={'Step 3'}
            title={'Mint iBTC'}
            content={
              <Text color={'white'}>
                Wait for Bitcoin to get locked on chain{' '}
                <Text as={'span'} color={'accent.lightBlue.01'}>
                  (~1 hour).{' '}
                </Text>
                After confirmation iBTC tokens will automatically appear in your{' '}
                <Text as={'span'} color={'accent.lightBlue.01'}>
                  Ethereum Wallet.{' '}
                </Text>{' '}
                You can use iBTC in big{' '}
                <Text as={'span'} variant={'navigate'} fontSize={'md'}>
                  supported DeFi protocols
                </Text>{' '}
                for lending, yield farming, staking and more.
              </Text>
            }
            hasBadge={false}
          />
          <IntroVideo
            opts={{ height: '262px', width: '435px', playerVars: { autoplay: 0, controls: 1 } }}
            placeholderHeight={'262px'}
            placeholderWidth={'435px'}
          />
          <Box h={'10px'} />
          <Button
            onClick={() => {
              navigate('/mint-withdraw');
              dispatch(mintUnmintActions.setMintStep({ step: MintSteps.SETUP, vault: undefined }));
              close();
            }}
            variant={'account'}
          >
            Mint iBTC
          </Button>
        </>
      }
    </CustomCard>
  );
}
