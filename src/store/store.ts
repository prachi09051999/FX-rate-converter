// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import fxCardListSlice from './fxCardListSlice';
export const store = configureStore({
  reducer: {
    fxCardList: fxCardListSlice
  },
});

export default store;
