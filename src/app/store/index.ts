import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { modalSlice } from '@store/slices/modal/modal.slice';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

import { mintUnmintSlice } from './slices/mintunmint/mintunmint.slice';

export interface RootState {
  modal: ReturnType<typeof modalSlice.reducer>;
  mintunmint: ReturnType<typeof mintUnmintSlice.reducer>;
}

const rootReducer = combineReducers({
  modal: modalSlice.reducer,
  mintunmint: mintUnmintSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
