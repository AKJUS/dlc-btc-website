import { useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { formatVault } from '@functions/vault.functions';
import { Vault } from '@models/vault';
import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { mintUnmintActions } from '@store/slices/mintunmint/mintunmint.actions';
import { MintSteps, RedeemSteps } from '@store/slices/mintunmint/mintunmint.slice';
import { modalActions } from '@store/slices/modal/modal.actions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Decimal from 'decimal.js';
import { getAllAddressVaults } from 'dlc-btc-lib/ethereum-functions';
import { VaultState } from 'dlc-btc-lib/models';
import { useAccount } from 'wagmi';

import { NetworkType } from '@shared/constants/network.constants';

interface useEVMVaultsReturnType {
  allVaults: Vault[];
  readyVaults: Vault[];
  pendingVaults: Vault[];
  fundedVaults: Vault[];
  closingVaults: Vault[];
  closedVaults: Vault[];
  isLoading: boolean;
}

const filterVaultsByState = (vaults: Vault[], state: VaultState) => {
  return (vaults || [])
    .filter(vault => vault.state === state)
    .sort((a, b) => b.timestamp - a.timestamp);
};

const isVaultMissing = (previousVaults: Vault[], newVaults: Vault[]) => {
  return (
    previousVaults.filter(previousVault => {
      return !newVaults.some(vault => vault.uuid === previousVault.uuid);
    }).length > 0
  );
};

const getUpdatedVaults = (xrplVaults: Vault[], previousVaults: Vault[]) => {
  return xrplVaults.filter(vault => {
    return !previousVaults.some(
      previousVault =>
        previousVault.uuid === vault.uuid &&
        previousVault.state === vault.state &&
        previousVault.valueLocked === vault.valueLocked &&
        previousVault.valueMinted === vault.valueMinted
    );
  });
};

export function useEVMVaults(): useEVMVaultsReturnType {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);

  const { networkType } = useContext(NetworkConfigurationContext);

  const { isConnected, address: ethereumUserAddress } = useAccount();

  const { ethereumNetworkConfiguration, isEthereumNetworkConfigurationLoading } = useContext(
    EthereumNetworkConfigurationContext
  );

  const { data: evmVaults } = useQuery({
    queryKey: ['evm-vaults', ethereumUserAddress, ethereumNetworkConfiguration.chain.id],
    initialData: [],
    queryFn: fetchEVMVaults,
    refetchInterval: 10000,
    enabled:
      isConnected && networkType === NetworkType.EVM && !isEthereumNetworkConfigurationLoading,
  });

  async function fetchEVMVaults(): Promise<Vault[]> {
    if (!ethereumUserAddress) return [];
    setIsLoading(true);

    const previousVaults: Vault[] | undefined = queryClient.getQueryData([
      'evm-vaults',
      ethereumUserAddress,
      ethereumNetworkConfiguration.chain.id,
    ]);

    try {
      const evmRawVaults = await getAllAddressVaults(
        ethereumNetworkConfiguration.dlcManagerContract,
        ethereumUserAddress
      );
      const evmVaults = evmRawVaults.map(formatVault);

      if (
        previousVaults?.length === 0 &&
        evmVaults.length === 1 &&
        evmVaults[0].state === VaultState.READY
      ) {
        handleVaultStateChange(previousVaults[0], evmVaults[0]);
      } else if (previousVaults?.length === 0) {
        return evmVaults;
      }

      if (previousVaults && isVaultMissing(previousVaults, evmVaults)) {
        return previousVaults;
      }

      const updatedVaults = previousVaults ? getUpdatedVaults(evmVaults, previousVaults) : [];

      updatedVaults.forEach(vault => {
        const previousVault = previousVaults?.find(
          previousVault => previousVault.uuid === vault.uuid
        );

        handleVaultStateChange(previousVault, vault);
      });

      return evmVaults;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching EVM Vaults', error);
      return previousVaults ?? [];
    } finally {
      setIsLoading(false);
    }
  }

  const handleVaultStateChange = (previousVault: Vault | undefined, vault: Vault) => {
    if (!previousVault) {
      dispatch(mintUnmintActions.setMintStep({ step: MintSteps.DEPOSIT, vault: vault }));
      return;
    } else if (previousVault && previousVault.state !== vault.state) {
      switch (vault.state) {
        case VaultState.FUNDED:
          if (previousVault.valueMinted < previousVault.valueLocked) {
            dispatch(
              modalActions.toggleSuccessfulFlowModalVisibility({
                vaultUUID: vault.uuid,
                vault: vault,
                flow: 'burn',
                assetAmount: new Decimal(previousVault.valueLocked)
                  .minus(vault.valueLocked)
                  .toNumber(),
              })
            );
            dispatch(mintUnmintActions.setMintStep({ step: MintSteps.SETUP, vault: vault }));
          } else {
            dispatch(
              modalActions.toggleSuccessfulFlowModalVisibility({
                vaultUUID: vault.uuid,
                vault: vault,
                flow: 'mint',
                assetAmount: new Decimal(vault.valueLocked)
                  .minus(previousVault.valueLocked)
                  .toNumber(),
              })
            );
            dispatch(mintUnmintActions.setMintStep({ step: MintSteps.SETUP, vault: vault }));
          }
          break;

        case VaultState.PENDING:
          dispatch(
            vault.valueLocked !== vault.valueMinted
              ? mintUnmintActions.setUnmintStep({ step: RedeemSteps.PENDING, vault: vault })
              : mintUnmintActions.setMintStep({ step: MintSteps.PENDING, vault: vault })
          );
          break;
      }
    } else if (previousVault && previousVault.valueMinted !== vault.valueMinted) {
      dispatch(mintUnmintActions.setUnmintStep({ step: RedeemSteps.WITHDRAW, vault: vault }));
    }
  };

  const allVaults = useMemo(() => evmVaults || [], [evmVaults]);
  const readyVaults = useMemo(() => filterVaultsByState(evmVaults, VaultState.READY), [evmVaults]);
  const fundedVaults = useMemo(
    () => filterVaultsByState(evmVaults, VaultState.FUNDED),
    [evmVaults]
  );
  const pendingVaults = useMemo(
    () => filterVaultsByState(evmVaults, VaultState.PENDING),
    [evmVaults]
  );
  const closingVaults = useMemo(
    () => filterVaultsByState(evmVaults, VaultState.CLOSING),
    [evmVaults]
  );
  const closedVaults = useMemo(
    () => filterVaultsByState(evmVaults, VaultState.CLOSED),
    [evmVaults]
  );

  return {
    allVaults,
    readyVaults,
    pendingVaults,
    closingVaults,
    fundedVaults,
    closedVaults,
    isLoading,
  };
}
