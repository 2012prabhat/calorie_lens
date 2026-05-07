import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  weightData: null,
  lastFetchedPage: null,
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setHistoryData: (state, action) => {
      state.data = action.payload.data;
      state.lastFetchedPage = action.payload.page;
    },
    setWeightData: (state, action) => {
      state.weightData = action.payload;
    },
  },
});

export const { setHistoryData, setWeightData } = historySlice.actions;

export default historySlice.reducer;
