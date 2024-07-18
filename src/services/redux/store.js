import { configureStore } from "@reduxjs/toolkit";
import navigationReducer from "../navigation/navigationSlice";
import offtakeReducer from '../offtake/offtakeSlice';
import userReducer from '../user/userSlice';
export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    offtake: offtakeReducer,
    user: userReducer
  },
});
