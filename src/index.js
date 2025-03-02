import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Button, ConfigProvider, Divider, Result, Typography } from "antd";
import { store } from "./services/redux/store";
import "swiper/css";
// Supports weights 200-800
import "@fontsource-variable/plus-jakarta-sans";
// Supports weights 100-900
import '@fontsource-variable/inter';
import { createBrowserRouter, Link, RouterProvider, useParams, useRouteError } from "react-router-dom";
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
import { colors, Stack } from "@mui/material";
import PMChat from "./pages/PMChat";
import FarmSubmissions from "./pages/FarmSubmissions";
import Signup from "./pages/Signup";
import AdminProfile from "./pages/AdminProfile";
import PendingProfile from "./pages/AdminPending";

const root = ReactDOM.createRoot(document.getElementById("root"));
const ErrorBoundary = (is404) => {
  const error = useRouteError();
  console.log({ error });
  const params = useParams()
  if (is404) {
    return (
      <Result
        status={"404"}
        title={error.name}
        subTitle={error.message}
        children={
          <Typography code>{error.stack}</Typography>
        }
        extra={<Button type="primary"><Link to={"/"}>Back Home</Link></Button>}
      />
    );
  }
  return (
    <Result
      status={error.status}
      title={error.status}
      subTitle={<Typography code >{error.message}</Typography>}
      extra={<Button type="primary"><Link to={'/'}>Back</Link></Button>}
    />
  )
}
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
    // MuiAccordion: {
    //   defaultProps: {

    //   },
    //   styleOverrides: {
    //     root: {
    //       borderRadius: 30
    //     }
    //   }
    // }
  },
  typography: {
    fontFamily: ["Inter", "Inter Variable", "Plus Jakarta Sans", "Plus Jakarta Sans Variable"].join(","),
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
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/admin/create/profile",
    element: <AdminProfile />,
  },
  {
    path: "/admin/pending",
    element: <PendingProfile />,
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
  // {
  //   path: "/offtakes",
  //   element: <Offtake />,

  // },

  {
    path: "/offtakes/:offtake_page",
    element: <Offtake />,

  },

  {
    path: "/offtakes/:offtake_page/:offtake_id/chat",
    element: <OfftakeChat />,

  },
  {
    path: "/offtakes/:offtake_page/:offtake_id/published-chat",
    element: <PMChat />,

  },
  {
    path: "/offtakes/:offtake_page/:offtake_id/schedule",
    element: <ProductionSceduling />,
    errorElement: <ErrorBoundary />

  },
  {
    path: "/offtakes/:offtake_page/:offtake_id/submissions",
    element: <FarmSubmissions />,

  },
  {
    path: "/offtakes/:offtake_page/:offtake_id/costing",
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
  {
    path: "*",
    element: <ErrorBoundary is404={true} />
  }
]);
// linearGradientButton
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider

        theme={{
          token: {
            colorPrimary: theme.palette.primary.main,
          },
          components: {
            Statistic: {
              contentFontSize: 18
            },
            Button: {
              borderRadius: 30
            },
            Badge: {
              borderRadius: 30
            },
            Segmented: {
              borderRadius: 16,
              borderRadiusSM: 16,
              borderRadiusLG: 16,
              borderRadiusXS: 16,
              itemSelectedBg: theme.palette.primary.main,
              itemSelectedColor: theme.palette.common.white,
              itemColor: theme.palette.primary.main
            },
            Input: {
              colorTextDisabled: theme.palette.grey[900],
              colorTextPlaceholder: theme.palette.grey[400],
              borderRadius: 30,
            },
            Progress: {
              defaultColor: theme.palette.primary.main
            },
            Layout: {
              headerBg: theme.palette.common.white,
              siderBg: theme.palette.common.white,
              headerColor: theme.palette.grey[800],
              triggerBg: theme.palette.grey[200],
              triggerColor: theme.palette.grey[700]
            }
          },
        }}
      >
        <ThemeProvider theme={theme}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </ConfigProvider>
    </Provider>
  </React.StrictMode >
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
