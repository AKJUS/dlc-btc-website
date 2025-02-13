import { CheckCircleIcon, CopyIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Tooltip, useClipboard } from '@chakra-ui/react';

interface VaultTransactionStackCopyButtonProps {
  value: string;
}

export function VaultTransactionStackCopyButton({
  value,
}: VaultTransactionStackCopyButtonProps): React.JSX.Element {
  const { onCopy, hasCopied } = useClipboard(value);

  return (
    <HStack justifyContent={'flex-end'}>
      <Tooltip
        textAlign={'center'}
        label={hasCopied ? 'Copied' : 'Copy'}
        bg={'white.04'}
        fontWeight={'bold'}
        placement={'left'}
        fontSize={'xs'}
        w={'60px'}
      >
        <IconButton
          aria-label={'Copy Address'}
          size={'xs'}
          variant={'ghost'}
          borderRadius={'full'}
          onClick={onCopy}
          icon={
            hasCopied ? (
              <CheckCircleIcon color={'accent.lightBlue.01'} boxSize={'10px'} />
            ) : (
              <CopyIcon color={'accent.lightBlue.01'} boxSize={'10px'} />
            )
          }
        />
      </Tooltip>
    </HStack>
  );
}
