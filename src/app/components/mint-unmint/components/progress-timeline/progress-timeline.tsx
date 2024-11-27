import { HStack, VStack } from '@chakra-ui/react';

import { StepGraphics, StepText } from './components/progress-timeline-step';

interface ProgressTimelineProps {
  variant: 'mint' | 'unmint';
  currentStep: number;
}

export function ProgressTimeline({
  variant,
  currentStep,
}: ProgressTimelineProps): React.JSX.Element {
  switch (variant) {
    case 'unmint':
      return (
        <VStack w={'100%'}>
          <HStack w={'100%'}>
            <StepGraphics currentStep={currentStep} stepIndex={0} />
            <StepGraphics currentStep={currentStep} stepIndex={1} />
            <StepGraphics currentStep={currentStep} stepIndex={2} isLastStep />
          </HStack>
          <HStack w={'100%'} justifyContent={'space-between'}>
            <StepText currentStep={currentStep} stepIndex={0} title="Burn iBTC" />
            <StepText currentStep={currentStep} stepIndex={1} title="Sign Withdraw Transaction" />
            <StepText currentStep={currentStep} stepIndex={2} title="Receive BTC" />
          </HStack>
        </VStack>
      );
    case 'mint':
      return (
        <VStack w={'100%'}>
          <HStack w={'100%'} p={'0px'}>
            <StepGraphics currentStep={currentStep} stepIndex={0} />
            <StepGraphics currentStep={currentStep} stepIndex={1} />
            <StepGraphics currentStep={currentStep} stepIndex={2} isLastStep />
          </HStack>
          <HStack w={'100%'} justifyContent={'space-between'}>
            <StepText
              currentStep={currentStep}
              stepIndex={0}
              width={'12.5%'}
              isFirstStep
              title="Create Vault"
            />
            <StepText currentStep={currentStep} stepIndex={1} width={'15%'} title="Deposit" />
            <StepText
              currentStep={currentStep}
              stepIndex={3}
              width={'12.5%'}
              isLastStep
              title="Mint iBTC"
            />
          </HStack>
        </VStack>
      );
    default:
      return <HStack w={'100%'} />;
  }
}
