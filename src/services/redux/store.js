import { configureStore } from "@reduxjs/toolkit";
import navigationReducer from "../navigation/navigationSlice";
export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
  },
});
