import { configureStore } from "@reduxjs/toolkit";
import navigationReducer from "../navigation/navigationSlice";
import offtakeReducer from '../offtake/offtakeSlice';
export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    offtake: offtakeReducer
  },
});
