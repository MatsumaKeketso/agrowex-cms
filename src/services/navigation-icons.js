import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import {
  AgricultureRounded,
  DriveEtaRounded,
  ForumRounded,
  HomeMaxRounded,
  MessageRounded,
  MoreVertRounded,
  QuestionMarkRounded,
  ReceiptRounded,
  StorefrontRounded,
  WarehouseRounded,
} from "@mui/icons-material";
export const getNavIcon = (name) => {
  return null;
  switch (name) {
    case "home":
      return <DashboardRoundedIcon />;

    case "orders":
      return <LocalShippingRoundedIcon />;

    case "store":
      return <StorefrontRoundedIcon />;

    case "offtakes":
      return <StorefrontRoundedIcon />;

    case "products":
      return <ShoppingCartRoundedIcon />;

    case "warehouse":
      return <WarehouseRounded />;

    case "more":
      return <MoreVertRounded />;

    case "suppliers":
      return <LocalShippingRoundedIcon />;

    case "farms":
      return <AgricultureRounded />;

    case "market":
      return <StorefrontRounded />;

    case "drivers":
      return <DriveEtaRounded />;

    case "reconcile":
      return <ReceiptRounded />;

    case "requests":
      return <ForumRounded />;

    case "messages":
      return <MessageRounded />;

    case "faq":
      return <QuestionMarkRounded />;

    default:
      return <HomeMaxRounded />

  }
};
