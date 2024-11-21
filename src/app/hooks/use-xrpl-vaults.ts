import { useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { formatVault } from '@functions/vault.functions';
import { Vault } from '@models/vault';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { XRPWalletContext } from '@providers/xrp-wallet-context-provider';
import { mintUnmintActions } from '@store/slices/mintunmint/mintunmint.actions';
import { MintSteps, RedeemSteps } from '@store/slices/mintunmint/mintunmint.slice';
import { modalActions } from '@store/slices/modal/modal.actions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Decimal from 'decimal.js';
import { VaultState } from 'dlc-btc-lib/models';
import { connectRippleClient, getAllRippleVaults } from 'dlc-btc-lib/ripple-functions';

const INITIAL_VAULT_UUID = '0x0000000000000000000000000000000000000000000000000000000000000000';

interface useXRPLVaultsReturnType {
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

export function useXRPLVaults(): useXRPLVaultsReturnType {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);

  const { networkType } = useContext(NetworkConfigurationContext);
  const { userAddress: xrpUserAddress } = useContext(XRPWalletContext);
  const { rippleClient } = useContext(RippleNetworkConfigurationContext);

  const issuerAddress = appConfiguration.rippleIssuerAddress;

  const { data: xrplVaults } = useQuery({
    queryKey: ['xrpl-vaults', xrpUserAddress],
    initialData: [],
    queryFn: fetchXRPLVaults,
    refetchInterval: 20000,
    enabled: networkType === 'xrpl' && !!xrpUserAddress,
  });

  async function fetchXRPLVaults(): Promise<Vault[]> {
    setIsLoading(true);

    const previousVaults: Vault[] | undefined = queryClient.getQueryData([
      'xrpl-vaults',
      xrpUserAddress,
    ]);

    try {
      await connectRippleClient(rippleClient);

      const xrplRawVaults = await getAllRippleVaults(rippleClient, issuerAddress, xrpUserAddress);
      const xrplVaults = xrplRawVaults.map(formatVault);

      if (
        previousVaults?.length === 0 &&
        xrplVaults.length === 1 &&
        xrplVaults[0].state === VaultState.READY
      ) {
        handleVaultStateChange(previousVaults[0], xrplVaults[0]);
      } else if (previousVaults?.length === 0) {
        return xrplVaults;
      }

      if (previousVaults && isVaultMissing(previousVaults, xrplVaults)) {
        return previousVaults;
      }

      const updatedVaults = previousVaults ? getUpdatedVaults(xrplVaults, previousVaults) : [];

      updatedVaults.forEach(vault => {
        const previousVault = previousVaults?.find(
          previousVault => previousVault.uuid === vault.uuid
        );
        handleVaultStateChange(previousVault, vault);
      });

      return xrplVaults;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching XRPL Vaults', error);
      return previousVaults ?? [];
    } finally {
      setIsLoading(false);
    }
  }

  const handleVaultStateChange = (previousVault: Vault | undefined, vault: Vault) => {
    if (!previousVault && vault.uuid !== INITIAL_VAULT_UUID) {
      dispatch(mintUnmintActions.setMintStep({ step: MintSteps.DEPOSIT, vault }));
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
            dispatch(mintUnmintActions.setMintStep({ step: MintSteps.SETUP, vault: undefined }));
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
            dispatch(mintUnmintActions.setMintStep({ step: MintSteps.SETUP, vault: undefined }));
          }
          break;

        case VaultState.PENDING:
          dispatch(
            vault.valueLocked !== vault.valueMinted
              ? mintUnmintActions.setUnmintStep({ step: RedeemSteps.PENDING, vault })
              : mintUnmintActions.setMintStep({ step: MintSteps.PENDING, vault })
          );
          break;
      }
    } else if (previousVault && previousVault.valueMinted !== vault.valueMinted) {
      dispatch(mintUnmintActions.setUnmintStep({ step: RedeemSteps.WITHDRAW, vault }));
    }
  };

  const allVaults = useMemo(() => xrplVaults || [], [xrplVaults]);
  const readyVaults = useMemo(
    () => filterVaultsByState(xrplVaults, VaultState.READY),
    [xrplVaults]
  );
  const fundedVaults = useMemo(
    () => filterVaultsByState(xrplVaults, VaultState.FUNDED),
    [xrplVaults]
  );
  const pendingVaults = useMemo(
    () => filterVaultsByState(xrplVaults, VaultState.PENDING),
    [xrplVaults]
  );
  const closingVaults = useMemo(
    () => filterVaultsByState(xrplVaults, VaultState.CLOSING),
    [xrplVaults]
  );
  const closedVaults = useMemo(
    () => filterVaultsByState(xrplVaults, VaultState.CLOSED),
    [xrplVaults]
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
