import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  links: ["home", "orders", "store", "products"],
  active: "home",
};

export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setActiveNav: (state, action) => {
      state.active = action.payload;
    },
  },
});

export const { setActiveNav } = navigationSlice.actions;
export default navigationSlice.reducer;
