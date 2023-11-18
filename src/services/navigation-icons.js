import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import { WarehouseRounded } from "@mui/icons-material";
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
    case "warehouse":
      return <WarehouseRounded />;
      break;
  }
};
