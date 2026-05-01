import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import planReducer from './slices/planSlice';
import historyReducer from './slices/historySlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    plan: planReducer,
    history: historyReducer,
  },
});
