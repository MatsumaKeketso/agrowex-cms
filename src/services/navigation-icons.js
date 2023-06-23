import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
export const getNavIcon = (name) => {
  switch (name) {
    case "home":
      return <DashboardRoundedIcon />;
      break;
    case "orders":
      return <LocalShippingRoundedIcon />;
      break;
    case "store":
      return <StorefrontRoundedIcon />;
      break;
    case "products":
      return <ShoppingCartRoundedIcon />;
      break;
  }
};
