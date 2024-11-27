import { VStack } from '@chakra-ui/react';

import { VaultAssetRow } from './components/vault.main-stack.asset-information-stack.asset-row';

interface VaultAssetInformationStackProps {
  vaultTotalLockedValue: number;
  vaultTotalMintedValue: number;
}
export function VaultAssetInformationStack({
  vaultTotalLockedValue,
  vaultTotalMintedValue,
}: VaultAssetInformationStackProps): React.JSX.Element {
  return (
    <VStack w={'50%'}>
      <VaultAssetRow
        assetLogo={'images/logos/ibtc-logo.svg'}
        assetValue={vaultTotalMintedValue}
        assetSymbol={'iBTC'}
      />
      <VaultAssetRow
        assetLogo={'images/logos/bitcoin-logo.svg'}
        assetValue={vaultTotalLockedValue}
        assetSymbol={'BTC'}
      />
    </VStack>
  );
}
