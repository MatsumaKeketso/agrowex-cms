import { createSlice } from "@reduxjs/toolkit";
const initialState = {};
export const offtakeSlice = createSlice({
  name: "offtake",
  initialState,
  reducers: {
    setActiveOfftake: (state, action) => {
      state.active = action.payload;
    },
  },
});

export const { setActiveOfftake } = offtakeSlice.actions;
export default offtakeSlice.reducer;
