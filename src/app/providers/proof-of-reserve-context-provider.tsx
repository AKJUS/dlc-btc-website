import { createContext } from 'react';

import { useBitcoinPrice } from '@hooks/use-bitcoin-price';
import { useDepositLimits } from '@hooks/use-deposit-limits';
import { useMintBurnEvents } from '@hooks/use-mint-burn-events';
import { useProofOfReserve } from '@hooks/use-proof-of-reserve';
import { useTotalSupply } from '@hooks/use-total-supply';
import { DetailedEvent } from '@models/ethereum-models';
import { HasChildren } from '@models/has-children';
import { MerchantProofOfReserve } from '@models/merchant';

interface ProofOfReserveContextProviderType {
  proofOfReserve: [number | undefined, MerchantProofOfReserve[]] | undefined;
  totalSupply: number | undefined;
  bitcoinPrice: number | undefined;
  allMintBurnEvents: DetailedEvent[] | undefined;
  merchantMintBurnEvents: { name: string; mintBurnEvents: DetailedEvent[] }[] | undefined;
  depositLimit: { minimumDeposit: number; maximumDeposit: number } | undefined;
}

export const ProofOfReserveContext = createContext<ProofOfReserveContextProviderType>({
  proofOfReserve: undefined,
  totalSupply: undefined,
  bitcoinPrice: undefined,
  allMintBurnEvents: undefined,
  merchantMintBurnEvents: undefined,
  depositLimit: undefined,
});

export function ProofOfReserveContextProvider({ children }: HasChildren): React.JSX.Element {
  const { proofOfReserve } = useProofOfReserve();
  const { totalSupply } = useTotalSupply();
  const { bitcoinPrice } = useBitcoinPrice();
  const { allMintBurnEvents, merchantMintBurnEvents } = useMintBurnEvents();
  const { depositLimit } = useDepositLimits();

  return (
    <ProofOfReserveContext.Provider
      value={{
        proofOfReserve,
        totalSupply,
        bitcoinPrice,
        allMintBurnEvents,
        merchantMintBurnEvents,
        depositLimit,
      }}
    >
      {children}
    </ProofOfReserveContext.Provider>
  );
}
