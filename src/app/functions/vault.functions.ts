import { Vault } from '@models/vault';
import { RawVault } from 'dlc-btc-lib/models';
import { unshiftValue } from 'dlc-btc-lib/utilities';

export function formatVault(vault: RawVault): Vault {
  return {
    uuid: vault.uuid,
    timestamp: vault.timestamp.toNumber(),
    valueLocked: unshiftValue(vault.valueLocked.toNumber()),
    valueMinted: unshiftValue(vault.valueMinted.toNumber()),
    state: vault.status,
    userPublicKey: vault.taprootPubKey,
    fundingTX: vault.fundingTxId,
    closingTX: vault.closingTxId,
    withdrawDepositTX: vault.wdTxId,
    btcFeeRecipient: vault.btcFeeRecipient,
    btcMintFeeBasisPoints: vault.btcMintFeeBasisPoints.toNumber(),
    btcRedeemFeeBasisPoints: vault.btcRedeemFeeBasisPoints.toNumber(),
    taprootPubKey: vault.taprootPubKey,
  };
}
