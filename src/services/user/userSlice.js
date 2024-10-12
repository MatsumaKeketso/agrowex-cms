import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  profile: {},
  auth: {},
  online: false
};
export const offtakeSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateAuth: (state, action) => {
      state.auth = action.payload;
    },
    toggleOnline: (state, action) => {
      state.online = action.payload
    }
  },
});

export const { updateProfile, updateAuth, toggleOnline } = offtakeSlice.actions;
export default offtakeSlice.reducer;
