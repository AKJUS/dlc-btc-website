import { useContext, useState } from 'react';

import { getAttestorExtendedGroupPublicKey } from '@functions/attestor-request.functions';
import { BitcoinError } from '@models/error-types';
import { BitcoinWalletType } from '@models/wallet';
import { bytesToHex } from '@noble/hashes/utils';
import { BitcoinWalletContext } from '@providers/bitcoin-wallet-context-provider';
import { EthereumNetworkConfigurationContext } from '@providers/ethereum-network-configuration.provider';
import { NetworkConfigurationContext } from '@providers/network-configuration.provider';
import { RippleNetworkConfigurationContext } from '@providers/ripple-network-configuration.provider';
import { XRPWalletContext } from '@providers/xrp-wallet-context-provider';
import { LeatherDLCHandler, LedgerDLCHandler, UnisatFordefiDLCHandler } from 'dlc-btc-lib';
import {
  getAttestorConfigurationForChain,
  submitFundingPSBT,
  submitWithdrawDepositPSBT,
} from 'dlc-btc-lib/attestor-request-functions';
import {
  getAttestorGroupPublicKey,
  getFeeRecipient,
  getRawVault,
} from 'dlc-btc-lib/ethereum-functions';
import { AttestorChainID, RawVault, Transaction, VaultState } from 'dlc-btc-lib/models';
import { getRippleVault } from 'dlc-btc-lib/ripple-functions';
import { useAccount } from 'wagmi';

import { NetworkType } from '@shared/constants/network.constants';

import { useLeather } from './use-leather';
import { useLedger } from './use-ledger';
import { useUnisatFordefi } from './use-unisat-fordefi';

interface UsePSBTReturnType {
  handleSignFundingTransaction: (vaultUUID: string, depositAmount: number) => Promise<void>;
  handleSignWithdrawTransaction: (vaultUUID: string, withdrawAmount: number) => Promise<void>;
  bitcoinDepositAmount: number;
  isLoading: [boolean, string];
}

interface NetworkConfig {
  getUserAddress: () => string | undefined;
  getVault: (vaultUUID: string) => Promise<RawVault>;
  getAttestorGroupPublicKey: () => Promise<string>;
  getFeeRecipient: () => Promise<string>;
}

export function usePSBT(): UsePSBTReturnType {
  const {
    ethereumNetworkConfiguration: { dlcManagerContract, ethereumAttestorChainID },
  } = useContext(EthereumNetworkConfigurationContext);
  const { address: ethereumUserAddress } = useAccount();
  const { userAddress: rippleUserAddress } = useContext(XRPWalletContext);
  const {
    rippleClient,
    rippleNetworkConfiguration: { rippleAttestorChainID },
  } = useContext(RippleNetworkConfigurationContext);

  const { bitcoinWalletType, dlcHandler, resetBitcoinWalletContext } =
    useContext(BitcoinWalletContext);

  const { networkType } = useContext(NetworkConfigurationContext);

  const {
    handleFundingTransaction: handleFundingTransactionWithLedger,
    handleWithdrawTransaction: handleWithdrawTransactionWithLedger,
    handleDepositTransaction: handleDepositTransactionWithLedger,
    isLoading: isLedgerLoading,
  } = useLedger();

  const {
    handleFundingTransaction: handleFundingTransactionWithLeather,
    handleWithdrawTransaction: handleWithdrawTransactionWithLeather,
    handleDepositTransaction: handleDepositTransactionWithLeather,
    isLoading: isLeatherLoading,
  } = useLeather();

  const {
    handleFundingTransaction: handleFundingTransactionWithUnisatFordefi,
    handleWithdrawTransaction: handleWithdrawTransactionWithUnisatFordefi,
    handleDepositTransaction: handleDepositTransactionWithUnisatFordefi,
    isLoading: isUnisatLoading,
  } = useUnisatFordefi();

  const [bitcoinDepositAmount, setBitcoinDepositAmount] = useState(0);

  const attestorChainIDs = {
    [NetworkType.EVM]: ethereumAttestorChainID,
    [NetworkType.XRPL]: rippleAttestorChainID,
    [NetworkType.BTC]: '',
  };

  type SupportedNetworkType = Exclude<NetworkType, NetworkType.BTC>;

  const isSupportedNetwork = (network: NetworkType): network is SupportedNetworkType => {
    return network === NetworkType.EVM || network === NetworkType.XRPL;
  };

  const networkConfigs: Record<SupportedNetworkType, NetworkConfig> = {
    [NetworkType.EVM]: {
      getUserAddress: () => ethereumUserAddress,
      getVault: vaultUUID => getRawVault(dlcManagerContract, vaultUUID),
      getAttestorGroupPublicKey: () => getAttestorGroupPublicKey(dlcManagerContract),
      getFeeRecipient: () => getFeeRecipient(dlcManagerContract),
    },
    [NetworkType.XRPL]: {
      getUserAddress: () => rippleUserAddress,
      getVault: vaultUUID =>
        getRippleVault(rippleClient, appConfiguration.rippleIssuerAddress, vaultUUID),
      getAttestorGroupPublicKey: getAttestorExtendedGroupPublicKey,
      getFeeRecipient: async () => {
        const config = await getAttestorConfigurationForChain(
          appConfiguration.attestorSharedConfigurationURL,
          'ripple',
          attestorChainIDs[NetworkType.XRPL]
        );
        return config.btcFeeRecipient;
      },
    },
  };

  const getRequiredPSBTInformation = async (
    vaultUUID: string
  ): Promise<{
    userAddress: string;
    vault: RawVault;
    attestorGroupPublicKey: string;
    feeRecipient: string;
  }> => {
    if (!isSupportedNetwork(networkType)) {
      throw new Error('Network Type is not supported');
    }

    const config = networkConfigs[networkType];
    if (!config) {
      throw new Error('Network Type is not setup');
    }

    const userAddress = config.getUserAddress();
    if (!userAddress) {
      throw new Error('User Address is not setup');
    }

    const [vault, attestorGroupPublicKey, feeRecipient] = await Promise.all([
      config.getVault(vaultUUID),
      config.getAttestorGroupPublicKey(),
      config.getFeeRecipient(),
    ]);

    return {
      userAddress,
      vault,
      attestorGroupPublicKey,
      feeRecipient,
    };
  };

  async function handleSignFundingTransaction(
    vaultUUID: string,
    depositAmount: number
  ): Promise<void> {
    try {
      if (!dlcHandler) throw new Error('DLC Handler is not setup');

      const feeRateMultiplier = import.meta.env.VITE_FEE_RATE_MULTIPLIER;

      const { userAddress, vault, attestorGroupPublicKey } =
        await getRequiredPSBTInformation(vaultUUID);

      let fundingTransaction: Transaction;
      switch (bitcoinWalletType) {
        case 'Ledger':
          switch (vault.valueLocked.toNumber()) {
            case 0:
              fundingTransaction = await handleFundingTransactionWithLedger(
                dlcHandler as LedgerDLCHandler,
                vault,
                depositAmount,
                attestorGroupPublicKey,
                vault.btcFeeRecipient,
                feeRateMultiplier
              );
              break;
            default:
              fundingTransaction = await handleDepositTransactionWithLedger(
                dlcHandler as LedgerDLCHandler,
                vault,
                depositAmount,
                attestorGroupPublicKey,
                vault.btcFeeRecipient,
                feeRateMultiplier
              );
          }
          break;
        case 'Unisat':
          switch (vault.valueLocked.toNumber()) {
            case 0:
              fundingTransaction = await handleFundingTransactionWithUnisatFordefi(
                dlcHandler as UnisatFordefiDLCHandler,
                vault,
                depositAmount,
                attestorGroupPublicKey,
                vault.btcFeeRecipient,
                feeRateMultiplier
              );
              break;
            default:
              fundingTransaction = await handleDepositTransactionWithUnisatFordefi(
                dlcHandler as UnisatFordefiDLCHandler,
                vault,
                depositAmount,
                attestorGroupPublicKey,
                vault.btcFeeRecipient,
                feeRateMultiplier
              );
              break;
          }
          break;
        case 'Leather':
          switch (vault.valueLocked.toNumber()) {
            case 0:
              fundingTransaction = await handleFundingTransactionWithLeather(
                dlcHandler as LeatherDLCHandler,
                vault,
                depositAmount,
                attestorGroupPublicKey,
                vault.btcFeeRecipient,
                feeRateMultiplier
              );
              break;
            default:
              fundingTransaction = await handleDepositTransactionWithLeather(
                dlcHandler as LeatherDLCHandler,
                vault,
                depositAmount,
                attestorGroupPublicKey,
                vault.btcFeeRecipient,
                feeRateMultiplier
              );
              break;
          }
          break;
        default:
          throw new BitcoinError('Invalid Bitcoin Wallet Type');
      }

      switch (vault.status) {
        case VaultState.READY:
          await submitFundingPSBT([appConfiguration.coordinatorURL], {
            vaultUUID,
            fundingPSBT: bytesToHex(fundingTransaction.toPSBT()),
            userEthereumAddress: userAddress,
            userBitcoinTaprootPublicKey: dlcHandler.getUserTaprootPublicKey(),
            attestorChainID: attestorChainIDs[networkType] as AttestorChainID,
          });
          break;
        default:
          await submitWithdrawDepositPSBT([appConfiguration.coordinatorURL], {
            vaultUUID,
            withdrawDepositPSBT: bytesToHex(fundingTransaction.toPSBT()),
          });
      }

      setBitcoinDepositAmount(depositAmount);
      resetBitcoinWalletContext();
    } catch (error) {
      throw new BitcoinError(`Error signing Funding Transaction: ${error}`);
    }
  }

  async function handleSignWithdrawTransaction(
    vaultUUID: string,
    withdrawAmount: number
  ): Promise<void> {
    try {
      if (!dlcHandler) throw new Error('DLC Handler is not setup');

      const feeRateMultiplier = import.meta.env.VITE_FEE_RATE_MULTIPLIER;

      const { vault, attestorGroupPublicKey } = await getRequiredPSBTInformation(vaultUUID);

      let withdrawalTransactionHex: string;
      switch (bitcoinWalletType) {
        case 'Ledger':
          withdrawalTransactionHex = await handleWithdrawTransactionWithLedger(
            dlcHandler as LedgerDLCHandler,
            vault,
            withdrawAmount,
            attestorGroupPublicKey,
            vault.btcFeeRecipient,
            feeRateMultiplier
          );
          break;
        case 'Unisat':
          withdrawalTransactionHex = await handleWithdrawTransactionWithUnisatFordefi(
            dlcHandler as UnisatFordefiDLCHandler,
            vault,
            withdrawAmount,
            attestorGroupPublicKey,
            vault.btcFeeRecipient,
            feeRateMultiplier
          );
          break;
        case 'Leather':
          withdrawalTransactionHex = await handleWithdrawTransactionWithLeather(
            dlcHandler as LeatherDLCHandler,
            vault,
            withdrawAmount,
            attestorGroupPublicKey,
            vault.btcFeeRecipient,
            feeRateMultiplier
          );
          break;
        default:
          throw new BitcoinError('Invalid Bitcoin Wallet Type');
      }

      await submitWithdrawDepositPSBT([appConfiguration.coordinatorURL], {
        vaultUUID,
        withdrawDepositPSBT: withdrawalTransactionHex,
      });

      resetBitcoinWalletContext();
    } catch (error) {
      throw new BitcoinError(`Error signing Withdraw Transaction: ${error}`);
    }
  }

  const loadingStates = {
    [BitcoinWalletType.Ledger]: isLedgerLoading,
    [BitcoinWalletType.Leather]: isLeatherLoading,
    [BitcoinWalletType.Unisat]: isUnisatLoading,
    [BitcoinWalletType.Fordefi]: isUnisatLoading,
  };

  return {
    handleSignFundingTransaction,
    handleSignWithdrawTransaction,
    bitcoinDepositAmount,
    isLoading: bitcoinWalletType ? loadingStates[bitcoinWalletType] : [false, ''],
  };
}
