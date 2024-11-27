import { Button, HStack, Image, Link, Text } from '@chakra-ui/react';
import { TutorialVideo } from '@components/tutorial-video/tutorial-video';
import { useAddToken } from '@hooks/use-add-token';

import { NetworkType } from '@shared/constants/network.constants';

import { WalkthroughHeader } from './components/walkthrough-header';
import { WalkthroughLayout } from './components/walkthrough.layout';

interface WalkthroughProps {
  flow: 'mint' | 'unmint';
  currentStep: number;
  networkType: NetworkType;
}

export function Walkthrough({
  flow,
  currentStep,
  networkType,
}: WalkthroughProps): React.JSX.Element {
  const addToken = useAddToken();

  switch (flow) {
    case 'mint':
      switch (currentStep) {
        case 0:
          return (
            <WalkthroughLayout>
              <WalkthroughHeader
                currentStep={currentStep}
                title={'Create Vault'}
                blockchain={networkType}
              />
              {networkType === NetworkType.EVM ? (
                <Text color={'white.01'} fontSize={'md'}>
                  Initiate a Vault on the blockchain and confirm it in your{' '}
                  <Link
                    color={'accent.lightBlue.01'}
                    href="https://metamask.io/"
                    isExternal
                    textDecoration={'underline'}
                  >
                    Ethereum Wallet
                  </Link>
                  .
                </Text>
              ) : (
                <Text color={'white.01'} fontSize={'md'}>
                  Initiate a Setup Vault request. If the TrustLine is not yet established, sign the
                  Set TrustLine Transaction in your wallet. Then, wait for the Attestors to confirm
                  your request and set up the Vault on the blockchain.
                </Text>
              )}
              <TutorialVideo />
            </WalkthroughLayout>
          );
        case 1:
          return (
            <WalkthroughLayout>
              <WalkthroughHeader
                currentStep={currentStep}
                title={'Lock Bitcoin'}
                blockchain={NetworkType.BTC}
              />
              <Text color={'white.01'} fontSize={'md'}>
                Enter the Bitcoin amount you wish to deposit into the vault, then verify the
                transaction through your Bitcoin Wallet which will lock your Bitcoin on-chain. You
                will receive equivalent amount of iBTC.
              </Text>
            </WalkthroughLayout>
          );
        case 2:
          return (
            <WalkthroughLayout>
              <WalkthroughHeader
                currentStep={currentStep}
                title={'Mint iBTC'}
                blockchain={networkType}
              />
              <Text color={'white.01'} fontSize={'sm'}>
                Wait for Bitcoin to get locked on chain (~1 hour). After 6 confirmations, iBTC
                tokens will appear in your Wallet.
              </Text>
              {networkType === NetworkType.EVM && (
                <>
                  <Text color={'white.01'} fontSize={'sm'}>
                    To ensure your <span style={{ fontWeight: 800 }}>iBTC tokens </span>
                    are <span style={{ fontWeight: 800 }}>visible </span>
                    simply <span style={{ fontWeight: 800 }}>add them </span>
                    to your Ethereum Wallet.
                  </Text>

                  <Button variant={'vault'} onClick={async () => await addToken()}>
                    <HStack>
                      <Image src={'/images/logos/ibtc-logo.svg'} alt={'iBTC'} boxSize={'25px'} />
                      <Text> Add Token to Wallet</Text>
                    </HStack>
                  </Button>
                </>
              )}
            </WalkthroughLayout>
          );
        default:
          return (
            <WalkthroughLayout>
              <WalkthroughHeader
                currentStep={undefined}
                title={'Minted iBTC'}
                blockchain={networkType}
              />
            </WalkthroughLayout>
          );
      }
    case 'unmint':
      switch (currentStep) {
        case 0:
          return (
            <WalkthroughLayout>
              <WalkthroughHeader
                currentStep={currentStep}
                title={'Burn iBTC'}
                blockchain={networkType}
              />
              {networkType === NetworkType.EVM ? (
                <Text color={'white.01'} fontSize={'md'}>
                  Select the iBTC vault you would like to withdraw from. Burn the desired amount of
                  iBTC to receive the equivalent amount of BTC.
                </Text>
              ) : (
                <Text color={'white.01'} fontSize={'md'}>
                  Select the iBTC vault you would like to withdraw from. Sign a check with the
                  desired amount of iBTC to receive the equivalent amount of BTC.
                </Text>
              )}
            </WalkthroughLayout>
          );
        case 1:
          return (
            <WalkthroughLayout>
              <WalkthroughHeader
                currentStep={currentStep}
                title={'Sign Withdraw Transaction'}
                blockchain={NetworkType.BTC}
              />
              <Text fontSize={'md'} color={'white.01'}>
                {`Once the iBTC has been burned, you can withdraw an `}
                <Text as="span" fontWeight="bold">
                  {` equivalent amount of Bitcoin `}
                </Text>
                {` from the Vault. To do this, sign the Bitcoin transaction using your Bitcoin wallet. After signing, the transaction will be broadcasted, and the amount will be returned to your address.`}
              </Text>
            </WalkthroughLayout>
          );
        case 2:
          return (
            <WalkthroughLayout>
              <WalkthroughHeader
                currentStep={currentStep}
                title={'Receive Bitcoin'}
                blockchain={NetworkType.BTC}
              />
              <Text color={'white.01'} fontSize={'md'}>
                After a successful withdraw (
                <span style={{ color: 'accent.lightBlue.01' }}>~1 hour</span>) your will receive BTC
                in your bitcoin wallet.
              </Text>
            </WalkthroughLayout>
          );
        default:
          return (
            <WalkthroughLayout>
              <WalkthroughHeader
                currentStep={undefined}
                title={'Withdrawn iBTC'}
                blockchain={networkType}
              />
            </WalkthroughLayout>
          );
      }
  }
}
