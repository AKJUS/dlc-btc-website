import { useDispatch } from 'react-redux';

// import { useNavigate } from 'react-router-dom';
import { Button, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { modalActions } from '@store/slices/modal/modal.actions';

export function WelcomeStack(): React.JSX.Element {
  // const navigate = useNavigate();
  const dispatch = useDispatch();

  const setupText = 'Ready to\n mint iBTC?';

  function onConnectWalletClick(): void {
    dispatch(modalActions.toggleSelectWalletModalVisibility());
  }

  return (
    <HStack spacing={'100px'} align={'start'}>
      <VStack alignItems={'start'} spacing={'25px'}>
        <Text variant={'welcome'} alignContent={'start'}>
          {setupText}
        </Text>
        {/* <Text variant={'navigate'} onClick={() => navigate('/how-it-works')}>
          How it works?
        </Text> */}
        <Button variant={'account'} onClick={onConnectWalletClick}>
          Connect Wallet
        </Button>
      </VStack>
      <Image src={'/images/dlc-btc-mint-visualization.png'} h={'295px'} />
    </HStack>
  );
}
