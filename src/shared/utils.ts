import { DetailedEvent, FormattedEvent } from '@models/ethereum-models';
import Decimal from 'decimal.js';
import { supportedEthereumNetworks } from 'dlc-btc-lib/constants';
import { unshiftValue } from 'dlc-btc-lib/utilities';
import { pipe, when } from 'ramda';
import { Chain } from 'viem';

import { SUPPORTED_VIEM_CHAINS } from './constants/ethereum.constants';

export function formatNumber(value: number): string {
  if (value < 10000) {
    return new Decimal(value).toFixed(0);
  } else if (value < 1000000) {
    return new Decimal(value).dividedBy(1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else if (value < 1000000000) {
    return new Decimal(value).dividedBy(1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (value < 1000000000000) {
    return new Decimal(value).dividedBy(1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else {
    return new Decimal(value).dividedBy(1000000000000).toFixed(1).replace(/\.0$/, '') + 'T';
  }
}

export function findEthereumNetworkByName(ethereumNetworkName: string): Chain {
  const ethereumNetworkID = supportedEthereumNetworks.find(
    network => network.name.toLowerCase() === ethereumNetworkName
  )?.id;
  if (!ethereumNetworkID) {
    throw new Error(`Could not find Ethereum network with name ${ethereumNetworkName}`);
  }
  const chain = SUPPORTED_VIEM_CHAINS.find(chain => chain.id === parseInt(ethereumNetworkID));

  if (!chain) {
    throw new Error(`Could not find chain with id ${ethereumNetworkID}`);
  }

  return chain;
}

export function formatEvent(event: DetailedEvent): FormattedEvent {
  const isMint = event.eventType === 'mint';
  const date = new Date(event.timestamp * 1000);

  const iBTCAmount = isMint ? event.value : -event.value;

  const displayAmount =
    formatToFourDecimals(unshiftValue(iBTCAmount)) === 0
      ? null
      : formatToFourDecimals(unshiftValue(iBTCAmount));
  return {
    iBTCAmount,
    merchant: isMint ? event.to : event.from,
    txHash: event.txHash,
    date: date
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      .replace(',', ''),
    isMint,
    chain: event.chain,
    isCCIP: event.isCCIP,
    displayAmount,
  };
}

export function parseAssetAmount(assetAmount: string): Decimal {
  const isValidNumber = /^-?\d*\.?\d*$/.test(assetAmount);

  if (isValidNumber) {
    try {
      return new Decimal(assetAmount);
    } catch {
      return new Decimal(0);
    }
  }
  return new Decimal(0);
}

export function formatToFourDecimals(value: number): number {
  const roundedValue =
    value < 0 ? -Math.abs(parseFloat(value.toFixed(4))) : parseFloat(value.toFixed(4));
  return roundedValue;
}

export const convertBitcoinToUSD = (
  bitcoinPrice: number,
  bitcoinAmount: number,
  shouldRound = true
): number =>
  pipe(
    (amount: number) => new Decimal(amount).mul(bitcoinPrice),
    when(
      () => shouldRound,
      decimal => decimal.floor()
    ),
    (decimal: Decimal) => decimal.toNumber()
  )(bitcoinAmount);

export const breakpoints = ['300px', '400px', '600px', '850px', '1280px', '1400px'];
export const titleTextSize = ['2xl', '2xl', '4xl', '6xl'];
