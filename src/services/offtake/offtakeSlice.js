import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  active: {},
  updated: false
};
export const offtakeSlice = createSlice({
  name: "offtake",
  initialState,
  reducers: {
    setActiveOfftake: (state, action) => {
      state.active = action.payload;
    },
    offtakeUpdateSuccess: (state, action) => {
      state.updated = action;
    }
  },
});

export const { setActiveOfftake, offtakeUpdateSuccess } = offtakeSlice.actions;
export default offtakeSlice.reducer;
