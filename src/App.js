import logo from "./logo.svg";
import Layout from "./components/Layout";
import { Typography, Button, Stack } from "@mui/material";
import Home from "./pages/Home";
import { useSelector } from "react-redux";
import Orders from "./pages/Orders";
import Store from "./pages/Store";
import Products from "./pages/Products";
import { ConfigProvider } from "antd";
import { createStyles } from 'antd-style';
import { useState } from "react";
import { SystemService } from "./services/systemService";
const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));
function App() {
  const navigation = useSelector((state) => state.navigation);
  const { styles } = useStyle();
  useState(() => {
    SystemService.setCurrencyList();
    SystemService.setLocale();
  }, []);
  return (
    <ConfigProvider
      button={{
        className: styles.linearGradientButton,
      }}>
      <Layout>
        <Stack flex={1}>
          {navigation.active === "home" && <Home />}
          {navigation.active === "orders" && <Orders />}
          {navigation.active === "store" && <Store />}
          {navigation.active === "products" && <Products />}
        </Stack>
      </Layout>
    </ConfigProvider>

  );
}

export default App;
