import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  active: {},
  updated: false,
  publish: false,
};
export const offtakeSlice = createSlice({
  name: "offtake",
  initialState,

  reducers: {
    setActiveOfftake: (state, action) => {
      state.active = action.payload;
    },
    offtakeUpdateSuccess: (state, action) => {
      state.updated = action.payload
    },
    setPublishState: (state, action) => {
      // console.log('clicked');
      state.publish = action.payload
    }
  },
});

export const { setActiveOfftake, offtakeUpdateSuccess, setPublishState } = offtakeSlice.actions;
export default offtakeSlice.reducer;
