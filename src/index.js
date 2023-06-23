import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { store } from "./services/redux/store";
import "swiper/css";
// Supports weights 200-800
import "@fontsource-variable/plus-jakarta-sans";
const root = ReactDOM.createRoot(document.getElementById("root"));
const theme = createTheme({
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
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
