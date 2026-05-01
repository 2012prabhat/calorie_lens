import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  todayStats: null,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setTodayStats: (state, action) => {
      state.todayStats = action.payload;
    },
    clearTodayStats: (state) => {
      state.todayStats = null;
    },
  },
});

export const { setTodayStats, clearTodayStats } = dashboardSlice.actions;

export default dashboardSlice.reducer;
