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
import { LedgerDLCHandler, SoftwareWalletDLCHandler } from 'dlc-btc-lib';
import {
  submitFundingPSBT,
  submitWithdrawDepositPSBT,
} from 'dlc-btc-lib/attestor-request-functions';
import { getAttestorGroupPublicKey, getRawVault } from 'dlc-btc-lib/ethereum-functions';
import { AttestorChainID, RawVault, Transaction, VaultState } from 'dlc-btc-lib/models';
import { getRippleVault } from 'dlc-btc-lib/ripple-functions';
import { useAccount } from 'wagmi';

import { NetworkType } from '@shared/constants/network.constants';

import { useLeather } from './use-leather';
import { useLedger } from './use-ledger';
import { useUnisat } from './use-unisat';

interface UsePSBTReturnType {
  handleSignFundingTransaction: (vaultUUID: string, depositAmount: number) => Promise<void>;
  handleSignWithdrawTransaction: (vaultUUID: string, withdrawAmount: number) => Promise<void>;
  bitcoinDepositAmount: number;
  isLoading: [boolean, string];
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
    handleWithdrawalTransaction: handleWithdrawalTransactionWithLedger,
    handleDepositTransaction: handleDepositTransactionWithLedger,
    isLoading: isLedgerLoading,
  } = useLedger();

  const {
    handleFundingTransaction: handleFundingTransactionWithLeather,
    handleWithdrawalTransaction: handleWithdrawalTransactionWithLeather,
    handleDepositTransaction: handleDepositTransactionWithLeather,
    isLoading: isLeatherLoading,
  } = useLeather();

  const {
    handleFundingTransaction: handleFundingTransactionWithUnisat,
    handleWithdrawalTransaction: handleWithdrawalTransactionWithUnisat,
    handleDepositTransaction: handleDepositTransactionWithUnisat,
    isLoading: isUnisatLoading,
  } = useUnisat();

  const [bitcoinDepositAmount, setBitcoinDepositAmount] = useState(0);

  const attestorChainIDs = {
    [NetworkType.EVM]: ethereumAttestorChainID,
    [NetworkType.XRPL]: rippleAttestorChainID,
    [NetworkType.BTC]: '',
  };

  const getRequiredPSBTInformation = async (
    vaultUUID: string
  ): Promise<{ userAddress: string; vault: RawVault; attestorGroupPublicKey: string }> => {
    if (networkType === NetworkType.EVM) {
      if (!ethereumUserAddress) throw new Error('User Address is not setup');
      const vault = await getRawVault(dlcManagerContract, vaultUUID);
      const attestorGroupPublicKey = await getAttestorGroupPublicKey(dlcManagerContract);
      return { userAddress: ethereumUserAddress, vault, attestorGroupPublicKey };
    } else if (networkType === NetworkType.XRPL) {
      if (!rippleUserAddress) throw new Error('User Address is not setup');
      const vault = await getRippleVault(
        rippleClient,
        appConfiguration.rippleIssuerAddress,
        vaultUUID
      );
      const attestorGroupPublicKey = await getAttestorExtendedGroupPublicKey();
      return {
        userAddress: rippleUserAddress,
        vault,
        attestorGroupPublicKey: attestorGroupPublicKey,
      };
    } else {
      throw new Error('Network Type is not setup');
    }
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
                feeRateMultiplier
              );
              break;
            default:
              fundingTransaction = await handleDepositTransactionWithLedger(
                dlcHandler as LedgerDLCHandler,
                vault,
                depositAmount,
                attestorGroupPublicKey,
                feeRateMultiplier
              );
          }
          break;
        case 'Unisat':
          switch (vault.valueLocked.toNumber()) {
            case 0:
              fundingTransaction = await handleFundingTransactionWithUnisat(
                dlcHandler as SoftwareWalletDLCHandler,
                vault,
                depositAmount,
                attestorGroupPublicKey,
                feeRateMultiplier
              );
              break;
            default:
              fundingTransaction = await handleDepositTransactionWithUnisat(
                dlcHandler as SoftwareWalletDLCHandler,
                vault,
                depositAmount,
                attestorGroupPublicKey,
                feeRateMultiplier
              );
              break;
          }
          break;
        case 'Leather':
          switch (vault.valueLocked.toNumber()) {
            case 0:
              fundingTransaction = await handleFundingTransactionWithLeather(
                dlcHandler as SoftwareWalletDLCHandler,
                vault,
                depositAmount,
                attestorGroupPublicKey,
                feeRateMultiplier
              );
              break;
            default:
              fundingTransaction = await handleDepositTransactionWithLeather(
                dlcHandler as SoftwareWalletDLCHandler,
                vault,
                depositAmount,
                attestorGroupPublicKey,
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
            userBitcoinTaprootPublicKey: dlcHandler.getTaprootDerivedPublicKey(),
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
          withdrawalTransactionHex = await handleWithdrawalTransactionWithLedger(
            dlcHandler as LedgerDLCHandler,
            withdrawAmount,
            attestorGroupPublicKey,
            vault,
            feeRateMultiplier
          );
          break;
        case 'Unisat':
          withdrawalTransactionHex = await handleWithdrawalTransactionWithUnisat(
            dlcHandler as SoftwareWalletDLCHandler,
            withdrawAmount,
            attestorGroupPublicKey,
            vault,
            feeRateMultiplier
          );
          break;
        case 'Leather':
          withdrawalTransactionHex = await handleWithdrawalTransactionWithLeather(
            dlcHandler as SoftwareWalletDLCHandler,
            withdrawAmount,
            attestorGroupPublicKey,
            vault,
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
