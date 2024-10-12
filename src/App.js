import logo from "./logo.svg";
import Layout from "./components/Layout";
import { Typography, Button, Stack } from "@mui/material";
import Home from "./pages/Home";
import { useSelector } from "react-redux";
import Orders from "./pages/Orders";
import Store from "./pages/Store";
import Products from "./pages/Products";

function App() {
  const navigation = useSelector((state) => state.navigation);
  return (
    <Layout>
      <Stack flex={1}>
        {navigation.active === "home" && <Home />}
        {navigation.active === "orders" && <Orders />}
        {navigation.active === "store" && <Store />}
        {navigation.active === "products" && <Products />}
      </Stack>
    </Layout>
  );
}

export default App;
