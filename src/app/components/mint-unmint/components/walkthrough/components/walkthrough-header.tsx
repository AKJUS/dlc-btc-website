import { HStack, Text, VStack } from '@chakra-ui/react';

import { NetworkType } from '@shared/constants/network.constants';

import { WalkthroughBlockchainTag } from './walkthrough-blockchain-tag';

interface WalkthroughHeaderProps {
  blockchain: NetworkType;
  currentStep?: number;
  title: string;
}

export function WalkthroughHeader({
  currentStep,
  blockchain,
  title,
}: WalkthroughHeaderProps): React.JSX.Element {
  return (
    <VStack alignItems={'start'} pb={'25px'}>
      <HStack>
        <Text color={'accent.lightBlue.01'} fontSize={'lg'}>
          Step {currentStep !== undefined && currentStep + 1}
        </Text>
        <WalkthroughBlockchainTag blockchain={blockchain} />
      </HStack>
      <Text color={'white.01'} fontSize={'lg'} fontWeight={800}>
        {title}
      </Text>
    </VStack>
  );
}
