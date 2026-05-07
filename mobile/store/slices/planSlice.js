import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPlan: null,
  savedMeals: [],
  isPlanLoaded: false,
  isMealsLoaded: false,
};

export const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    setCurrentPlan: (state, action) => {
      state.currentPlan = action.payload;
      state.isPlanLoaded = true;
    },
    setSavedMeals: (state, action) => {
      state.savedMeals = action.payload;
      state.isMealsLoaded = true;
    },
  },
});

export const { setCurrentPlan, setSavedMeals } = planSlice.actions;

export default planSlice.reducer;
