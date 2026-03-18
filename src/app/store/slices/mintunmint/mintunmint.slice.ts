import { Vault } from '@models/vault';
import { createSlice } from '@reduxjs/toolkit';

export enum MintSteps {
  SETUP = 0,
  DEPOSIT = 1,
  PENDING = 2,
}

export enum RedeemSteps {
  BURN = 0,
  WITHDRAW = 1,
  PENDING = 2,
}

export enum MintRedeemTabs {
  MINT = 0,
  REDEEM = 1,
}

interface MintRedeemStep {
  step: MintSteps | RedeemSteps;
  vault: Vault | undefined;
}
interface MintUnmintState {
  mintStep: MintRedeemStep;
  unmintStep: MintRedeemStep;
  activeTab: MintRedeemTabs;
  isBitsafeWithdraw: boolean;
  bitsafeWithdrawAmount: number | undefined;
}

const initialMintUnmintState: MintUnmintState = {
  mintStep: { step: MintSteps.SETUP, vault: undefined },
  unmintStep: { step: RedeemSteps.BURN, vault: undefined },
  activeTab: MintRedeemTabs.MINT,
  isBitsafeWithdraw: false,
  bitsafeWithdrawAmount: undefined,
};

export const mintUnmintSlice = createSlice({
  name: 'mintunmint',
  initialState: initialMintUnmintState,
  reducers: {
    setMintStep: (state, action) => {
      state.mintStep = action.payload;
      state.activeTab = MintRedeemTabs.MINT;
    },
    setUnmintStep: (state, action) => {
      state.unmintStep = action.payload;
      state.activeTab = MintRedeemTabs.REDEEM;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setIsBitsafeWithdraw: (state, action) => {
      state.isBitsafeWithdraw = action.payload;
    },
    setBitsafeWithdrawAmount: (state, action) => {
      state.bitsafeWithdrawAmount = action.payload;
    },
    resetMintUnmintState: state => {
      state.mintStep = { step: MintSteps.SETUP, vault: undefined };
      state.unmintStep = { step: RedeemSteps.BURN, vault: undefined };
      state.activeTab = MintRedeemTabs.MINT;
      state.isBitsafeWithdraw = false;
      state.bitsafeWithdrawAmount = undefined;
    },
  },
});
