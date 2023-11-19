import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import {
  AgricultureRounded,
  DriveEtaRounded,
  ForumRounded,
  MessageRounded,
  MoreVertRounded,
  QuestionMarkRounded,
  ReceiptRounded,
  StorefrontRounded,
  WarehouseRounded,
} from "@mui/icons-material";
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
    case "more":
      return <MoreVertRounded />;
      break;
    case "suppliers":
      return <LocalShippingRoundedIcon />;
      break;
    case "farms":
      return <AgricultureRounded />;
      break;
    case "market":
      return <StorefrontRounded />;
      break;
    case "drivers":
      return <DriveEtaRounded />;
      break;
    case "reconcile":
      return <ReceiptRounded />;
      break;
    case "requests":
      return <ForumRounded />;
      break;
    case "messages":
      return <MessageRounded />;
      break;
    case "faq":
      return <QuestionMarkRounded />;
      break;
  }
};
