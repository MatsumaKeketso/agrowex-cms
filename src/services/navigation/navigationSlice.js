import { createSlice } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
const initialState = {
  links: ["home", "orders", "store", "products", "warehouse"],
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
