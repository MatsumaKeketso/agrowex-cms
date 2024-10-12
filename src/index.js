import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ConfigProvider } from "antd";
import { store } from "./services/redux/store";
import "swiper/css";
// Supports weights 200-800
import "@fontsource-variable/plus-jakarta-sans";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Store from "./pages/Store";
import Orders from "./pages/Orders";
import Warehouse from "./pages/Warehouse";
import Messages from "./pages/Messages";
import Suppliers from "./pages/Suppliers";
import Market from "./pages/Market";
import Farms from "./pages/Farms";
import Drivers from "./pages/Drivers";
import Reconcile from "./pages/Reconcile";
import FAQs from "./pages/FAQs";
import Requests from "./pages/Requests";
import Offtake from "./pages/Offtakes";
import OfftakeChat from "./pages/OfftakeChat";
import ProductionSceduling from "./pages/ProductionScheduling";
import Signin from "./pages/Signin";
import ProductionCost from "./pages/ProductionCost";
import Account from "./pages/Account";
import { colors } from "@mui/material";
import PMChat from "./pages/PMChat";
import FarmSubmissions from "./pages/FarmSubmissions";

const root = ReactDOM.createRoot(document.getElementById("root"));
export const theme = createTheme({

  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
      main: "#01954B",
    },
    secondary: {
      main: "#A5DF55",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        borderRadius: 30,
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 30,
        },
      },
    },
    MuiAccordion: {
      defaultProps: {

      },
      styleOverrides: {
        root: {
          borderRadius: 30
        }
      }
    }
  },
  typography: {
    fontFamily: ["Plus Jakarta Sans Variable"],
    h1: {
      fontWeight: "bold",
    },
    h2: {
      fontWeight: "bold",
    },
    h3: {
      fontWeight: "bold",
    },
    h4: {
      fontWeight: "bold",
    },
    h5: {
      fontWeight: "bold",
    },
    h6: {
      fontWeight: "bold",
    },
  },
});
const router = createBrowserRouter([
  {
    path: "/",
    element: <Signin />,
  },
  {
    path: "/dashboard",
    element: <Home />,
  },
  {
    path: "/orders",
    element: <Orders />,
  },
  {
    path: "/store",
    element: <Store />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/offtakes",
    element: <Offtake />,
  },
  {
    path: "/offtakes/:offtake_id/chat",
    element: <OfftakeChat />,
  },
  {
    path: "/offtakes/:offtake_id/published-chat",
    element: <PMChat />,
  },
  {
    path: "/offtakes/:offtake_id/schedule",
    element: <ProductionSceduling />,
  },
  {
    path: "/offtakes/:offtake_id/submissions",
    element: <FarmSubmissions />,
  },
  {
    path: "/offtakes/:offtake_id/costing",
    element: <ProductionCost />,
  },
  {
    path: "/account",
    element: <Account />,
  },
  {
    path: "/warehouse",
    element: <Warehouse />,
  },
  {
    path: "/messages",
    element: <Messages />,
  },
  {
    path: "/suppliers",
    element: <Suppliers />,
  },
  {
    path: "/market",
    element: <Market />,
  },
  {
    path: "/farms",
    element: <Farms />,
  },
  {
    path: "/drivers",
    element: <Drivers />,
  },
  {
    path: "/reconcile",
    element: <Reconcile />,
  },
  {
    path: "/requests",
    element: <Requests />,
  },
  {
    path: "/faq",
    element: <FAQs />,
  },
]);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: { colorPrimary: theme.palette.primary.main, "borderRadius": 30 },
          components: {
            Table: {
              headerBg: theme.palette.primary.main,
              headerColor: theme.palette.common.white,
              headerSortActiveBg: theme.palette.primary.light,
            },
            Statistic: {
              contentFontSize: 18
            },
            Segmented: {
              borderRadius: 16,
              borderRadiusSM: 16,
              borderRadiusLG: 16,
              borderRadiusXS: 16,
              itemSelectedBg: theme.palette.primary.main,
              itemSelectedColor: 'white',
              itemColor: theme.palette.primary.main
            },
            Input: {
              colorTextDisabled: "rgb(0,0,0)",
              colorTextPlaceholder: "rgb(84,82,82)"
            }, Progress: {
              defaultColor: theme.palette.primary.main
            }
          },
        }}
      >
        <ThemeProvider theme={theme}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
