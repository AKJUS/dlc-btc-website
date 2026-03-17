import { Vault } from '@models/vault';
import { createSlice } from '@reduxjs/toolkit';

interface ModalState {
  isSelectWalletModalOpen: boolean;
  isSuccesfulFlowModalOpen: [boolean, Vault | undefined, string, string, number, string];
  isSelectBitcoinWalletModalOpen: boolean;
  isLedgerModalOpen: boolean;
}

const initialModalState: ModalState = {
  isSelectWalletModalOpen: false,
  isSuccesfulFlowModalOpen: [false, undefined, '', 'mint', 0, ''],
  isSelectBitcoinWalletModalOpen: false,
  isLedgerModalOpen: false,
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState: initialModalState,
  reducers: {
    toggleSelectWalletModalVisibility: state => {
      state.isSelectWalletModalOpen = !state.isSelectWalletModalOpen;
    },
    toggleSuccessfulFlowModalVisibility: (state, action) => {
      const { vaultUUID, vault, flow, assetAmount, btcTxId } = action.payload;
      state.isSuccesfulFlowModalOpen = [
        !state.isSuccesfulFlowModalOpen[0],
        vault,
        vaultUUID,
        flow,
        assetAmount,
        btcTxId ?? '',
      ];
    },
    toggleSelectBitcoinWalletModalVisibility: state => {
      state.isSelectBitcoinWalletModalOpen = !state.isSelectBitcoinWalletModalOpen;
    },
    toggleLedgerModalVisibility: state => {
      state.isLedgerModalOpen = !state.isLedgerModalOpen;
    },
  },
});
