import { createSlice } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import { getNavIcon } from "../navigation-icons";

const initialState = {
  links: [
    // follow ANTD menu structure
    { label: "Dashboard", key: "dashboard", icon: getNavIcon("home") },
    { label: "Orders", key: "orders", icon: getNavIcon("orders") },
    { label: "Offtakes", key: "offtakes/1", icon: getNavIcon("offtakes") },
    { label: "Store", key: "store", icon: getNavIcon("store") },
    { label: "Products", key: "products", icon: getNavIcon("products") },
    { label: "Warehouse", key: "warehouse", icon: getNavIcon("warehouse") },
    {
      label: "More",
      key: "more",
      icon: getNavIcon("more"),
      children: [
        { label: "Suppliers", key: "suppliers", icon: getNavIcon("suppliers") },
        { label: "Market", key: "market", icon: getNavIcon("market") },
        { label: "Farms", key: "farms", icon: getNavIcon("farms") },
        { label: "Drivers", key: "drivers", icon: getNavIcon("drivers") },
        { label: "Reconcile", key: "reconcile", icon: getNavIcon("reconcile") },
        { label: "Requests", key: "requests", icon: getNavIcon("requests") },
        // { label: "Message", key: "messages", icon: getNavIcon("messages") }, can be accessed near the profile icon
        { label: "FAQs", key: "faq", icon: getNavIcon("faq") },
      ],
    },
  ],
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
