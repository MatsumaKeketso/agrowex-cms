import React, { useEffect, useState } from "react";
import { Avatar, Badge, Button, Stack, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import BabyChangingStationIcon from "@mui/icons-material/BabyChangingStation";
import { useDispatch, useSelector } from "react-redux";
import { setActiveNav } from "../services/navigation/navigationSlice";
import { getNavIcon } from "../services/navigation-icons";
import { Drawer, Space, Menu as ANTMenu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChatBubbleRounded,
  MailOutlined,
  MessageRounded,
} from "@mui/icons-material";
const Logo = () => (
  <svg
    width="85"
    height="49"
    viewBox="0 0 85 49"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M25.4477 28.0505H25.3981C30.011 33.5442 37.0516 33.708 40.6735 33.3329C41.3028 30.7815 42.7149 22.4301 35.9219 17.1108C33.7535 15.449 31.2155 14.4202 28.5592 14.1262L22.9802 13.5029C22.9802 13.5029 21.91 23.6556 25.4477 28.0505Z"
      fill="#159800"
    />
    <path
      d="M12.0846 48.2514H9.93916C9.73092 48.263 9.52504 48.1997 9.35451 48.0718C9.20942 47.9494 9.0939 47.7919 9.01759 47.6122L8.31402 45.3936H3.77054L3.06697 47.6122C2.99909 47.7884 2.88781 47.9417 2.74491 48.0559C2.57727 48.1877 2.3734 48.2564 2.16521 48.2514H0L4.62771 35.5156H7.4618L12.0846 48.2514ZM4.42456 43.3811H7.68477L6.58482 39.8947C6.50554 39.6728 6.41636 39.414 6.32222 39.1129C6.22808 38.8118 6.1389 38.4896 6.04476 38.1357C5.95557 38.4949 5.87134 38.8224 5.7772 39.1235C5.68306 39.4246 5.60379 39.6887 5.51956 39.9105L4.42456 43.3811Z"
      fill="#82C600"
    />
    <path
      d="M20.6642 48.0653C19.959 48.2831 19.2281 48.3916 18.494 48.3875C17.5828 48.4052 16.6761 48.2459 15.8185 47.9174C15.0512 47.615 14.3486 47.1516 13.7523 46.5545C13.1765 45.9739 12.7223 45.27 12.4195 44.4891C12.1056 43.6675 11.9474 42.7878 11.9538 41.9008C11.9419 40.998 12.0933 40.1012 12.3997 39.2596C12.6794 38.4853 13.11 37.7831 13.6632 37.1995C14.2296 36.6109 14.9045 36.154 15.645 35.8577C16.4795 35.524 17.365 35.3592 18.2562 35.3718C18.7263 35.3707 19.1956 35.4149 19.6584 35.5038C20.0707 35.5844 20.4753 35.7046 20.8673 35.863C21.2218 36.0019 21.5622 36.1788 21.883 36.3913C22.1756 36.5897 22.4493 36.8179 22.7006 37.0727L21.8979 38.4091C21.8441 38.5053 21.7724 38.5886 21.6871 38.654C21.6019 38.7194 21.505 38.7655 21.4024 38.7894C21.1766 38.8265 20.9461 38.7698 20.7583 38.631C20.5403 38.4883 20.3322 38.3669 20.139 38.2665C19.9477 38.1661 19.7488 38.083 19.5444 38.0182C19.3351 37.9534 19.1214 37.9058 18.9052 37.8756C18.6535 37.8468 18.4004 37.8327 18.1472 37.8333C17.6671 37.8261 17.191 37.9269 16.7499 38.1292C16.3474 38.3139 15.9874 38.5897 15.6946 38.9374C15.3927 39.3116 15.1637 39.7462 15.0207 40.2157C14.6873 41.3434 14.6873 42.5532 15.0207 43.6809C15.1761 44.1751 15.4277 44.6288 15.759 45.0121C16.0803 45.374 16.4729 45.6554 16.9085 45.8361C17.6716 46.1404 18.501 46.2028 19.2967 46.0157C19.566 45.9455 19.8295 45.8519 20.0845 45.7357V43.8077H18.93C18.7804 43.8149 18.6337 43.7621 18.5188 43.6598C18.4714 43.6102 18.4338 43.551 18.4082 43.4857C18.3827 43.4204 18.3698 43.3502 18.3701 43.2794V41.6578H22.6213V47.0299C22.031 47.4949 21.3685 47.8454 20.6642 48.0653Z"
      fill="#82C600"
    />
    <path
      d="M27.259 43.5383V48.2501H24.4844V35.5144H28.3738C29.1193 35.4985 29.8632 35.5946 30.5836 35.7996C31.1236 35.9557 31.6289 36.2251 32.0701 36.592C32.4388 36.9086 32.7267 37.3192 32.9074 37.7858C33.0874 38.2642 33.1767 38.7759 33.17 39.2913C33.1729 39.6881 33.1211 40.0832 33.0164 40.4639C32.914 40.8268 32.7567 41.1694 32.5507 41.4782C32.3417 41.7963 32.0876 42.0778 31.7975 42.3128C31.4849 42.5698 31.1374 42.7746 30.767 42.9202C30.9469 43.0194 31.1135 43.1437 31.2624 43.29C31.4257 43.4452 31.569 43.6229 31.6885 43.8182L34.2303 48.2501H31.748C31.5503 48.2643 31.3529 48.2194 31.1778 48.1205C31.0028 48.0215 30.857 47.8725 30.7571 47.6902L28.7752 43.9926C28.6971 43.8542 28.5903 43.7367 28.463 43.6492C28.3103 43.5652 28.1391 43.5269 27.9675 43.5383H27.259ZM27.259 41.4993H28.3738C28.6998 41.508 29.0247 41.458 29.335 41.3514C29.5784 41.2584 29.8011 41.1127 29.9891 40.9235C30.1568 40.7463 30.2825 40.529 30.3557 40.2896C30.4327 40.0372 30.4712 39.7733 30.4697 39.5078C30.484 39.2639 30.447 39.0196 30.3612 38.7929C30.2755 38.5663 30.1433 38.3629 29.9742 38.1978C29.515 37.8449 28.9528 37.6782 28.3887 37.7277H27.259V41.4993Z"
      fill="#82C600"
    />
    <path
      d="M46.7751 41.8781C46.7818 42.7564 46.6304 43.6279 46.3292 44.4453C46.0468 45.2282 45.6158 45.9405 45.0634 46.5376C44.5109 47.1348 43.8488 47.604 43.1185 47.9158C41.4809 48.5778 39.6726 48.5778 38.035 47.9158C37.293 47.6054 36.6185 47.1362 36.0531 46.5371C35.5041 45.9478 35.0742 45.2449 34.7896 44.4717C34.1951 42.8171 34.1951 40.9866 34.7896 39.332C35.0741 38.5604 35.5042 37.8592 36.0531 37.2719C36.6188 36.6745 37.2933 36.2071 38.035 35.8985C38.8419 35.5476 39.7053 35.3681 40.5767 35.3702C41.4485 35.3647 42.3126 35.5442 43.1185 35.8985C43.8467 36.2054 44.5077 36.6693 45.0602 37.261C45.6126 37.8527 46.0446 38.5595 46.3292 39.3373C46.6284 40.1462 46.7798 41.0086 46.7751 41.8781ZM43.941 41.8781C43.9481 41.3016 43.8695 40.7275 43.7081 40.1772C43.582 39.7073 43.3661 39.2703 43.0739 38.8936C42.7858 38.5441 42.4265 38.2695 42.0235 38.0907C41.1062 37.7172 40.0919 37.7172 39.1746 38.0907C38.7673 38.2665 38.4042 38.5415 38.1143 38.8936C37.815 39.2692 37.5908 39.706 37.4553 40.1772C37.1515 41.2898 37.1515 42.4717 37.4553 43.5843C37.5908 44.0555 37.815 44.4923 38.1143 44.8679C38.4045 45.2184 38.7676 45.4915 39.1746 45.6656C40.0932 46.0317 41.1049 46.0317 42.0235 45.6656C42.4262 45.4888 42.7856 45.2159 43.0739 44.8679C43.3749 44.4936 43.5994 44.0564 43.7329 43.5843C43.8859 43.0308 43.9561 42.455 43.941 41.8781Z"
      fill="#82C600"
    />
    <path
      d="M47.5312 35.724H48.8492C48.9763 35.7186 49.1015 35.7576 49.2059 35.8349C49.2963 35.9067 49.3609 36.0092 49.3893 36.1255L51.8171 44.8308C51.8567 44.9893 51.8914 45.1583 51.9261 45.359C51.9608 45.5598 51.9954 45.7288 52.0301 45.9242C52.0698 45.727 52.1094 45.5369 52.149 45.3537C52.1842 45.1751 52.2289 44.9987 52.2828 44.8255L55.0475 36.1202C55.0881 36.0121 55.1548 35.9173 55.2408 35.8455C55.3384 35.7602 55.4615 35.7152 55.5876 35.7187H56.0484C56.171 35.7124 56.2918 35.7516 56.3903 35.8296C56.4782 35.9072 56.5464 36.0071 56.5885 36.1202L59.3433 44.8255C59.3957 44.9867 59.4404 45.1507 59.4771 45.3168C59.5217 45.4911 59.5563 45.6707 59.591 45.845C59.6207 45.6601 59.6554 45.4805 59.6852 45.3168C59.7149 45.153 59.7545 44.9787 59.7942 44.8255L62.2269 36.1202C62.2586 36.007 62.3249 35.9085 62.4152 35.8402C62.5121 35.7541 62.6361 35.7107 62.762 35.7187H64.0007L60.3342 48.2432H58.9073L55.9344 38.6874C55.8638 38.483 55.8091 38.2728 55.7709 38.0588C55.7412 38.175 55.7164 38.2859 55.6917 38.3969C55.6702 38.4952 55.6437 38.5922 55.6124 38.6874L52.6396 48.2432H51.2126L47.5312 35.724Z"
      fill="#159800"
    />
    <path
      d="M72.9654 35.7256V37.1043H67.317V41.2668H71.8903V42.5926H67.317V46.8608H72.9753V48.2448H65.7266V35.7256H72.9654Z"
      fill="#159800"
    />
    <path
      d="M77.9045 41.8168L74.0299 35.7263H75.6105C75.6981 35.7215 75.7852 35.7415 75.8632 35.7844C75.9224 35.8322 75.9728 35.8913 76.0118 35.9587L79.0788 40.9769C79.1248 40.8377 79.1828 40.7033 79.2522 40.5755L82.1457 35.9957C82.1831 35.9195 82.2355 35.8528 82.2993 35.8002C82.3598 35.7492 82.4354 35.723 82.5124 35.7263H84.0285L80.1341 41.7376L84.1623 48.2507H82.5867C82.4839 48.2577 82.3826 48.2217 82.3043 48.1504C82.2385 48.0854 82.1818 48.0107 82.1358 47.9285L78.9896 42.6462C78.9502 42.767 78.9005 42.8837 78.841 42.9948L75.774 47.918C75.7199 47.9967 75.6603 48.0708 75.5956 48.1398C75.5617 48.1749 75.5212 48.2019 75.4768 48.2192C75.4324 48.2365 75.3851 48.2436 75.338 48.2402H73.8516L77.9045 41.8168Z"
      fill="#159800"
    />
    <path
      d="M45.6573 17.0988C45.4244 16.5019 43.0709 10.9079 33.3349 2.86816L31.5611 19.703C31.5611 19.703 31.0161 28.1178 39.9841 33.1572C39.9841 33.1572 40.2467 33.2576 40.7075 33.3843C40.3508 29.5282 40.5044 22.0326 45.6573 17.0988Z"
      fill="#82C600"
    />
    <path
      d="M45.6791 17.1579C45.6803 17.1386 45.6803 17.1192 45.6791 17.0998C40.5262 22.0177 40.3726 29.5292 40.7243 33.3853C43.1175 34.0562 50.9509 35.5616 55.9403 28.3195C57.4881 25.9973 58.4395 23.284 58.7001 20.4488L59.3244 14.5009C59.3244 14.5009 49.8014 13.381 45.6791 17.1579Z"
      fill="#159800"
    />
    <path
      d="M51.2649 10.9662C53.5771 10.9662 55.4516 8.96783 55.4516 6.50265C55.4516 4.03748 53.5771 2.03906 51.2649 2.03906C48.9526 2.03906 47.0781 4.03748 47.0781 6.50265C47.0781 8.96783 48.9526 10.9662 51.2649 10.9662Z"
      fill="#82C600"
    />
    <path
      d="M43.9219 5.31405C45.2983 5.31405 46.4141 4.12446 46.4141 2.65703C46.4141 1.18959 45.2983 0 43.9219 0C42.5455 0 41.4297 1.18959 41.4297 2.65703C41.4297 4.12446 42.5455 5.31405 43.9219 5.31405Z"
      fill="#82C600"
    />
    <path
      d="M46.3286 12.4983C46.9416 12.4983 47.4385 11.9686 47.4385 11.3151C47.4385 10.6616 46.9416 10.1318 46.3286 10.1318C45.7156 10.1318 45.2188 10.6616 45.2188 11.3151C45.2188 11.9686 45.7156 12.4983 46.3286 12.4983Z"
      fill="#82C600"
    />
  </svg>
);

const MenuAppBar = ({ links = [], active, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("mail");
  const [sideNavLinks, setSideNavLinks] = useState([]);
  const navigation = useSelector((state) => state.navigation);
  const handleMenu = (event) => {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleClose = () => {};
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const onClick = (e) => {
    dispatch(setActiveNav(e.key));
    if (e.key === "home") {
      navigate(`/`);
    } else {
      navigate(`/${e.key}`);
    }
  };

  useEffect(() => {}, []);
  return (
    <AppBar
      // variant="outlined"
      elevation={0}
      sx={{
        background: "transparent",
        color: "black",
        borderWidth: 0,
        zIndex: 5,
        // borderRadius: 30,
      }}
      position="static"
    >
      <Drawer
        title="Agrowex"
        placement={"left"}
        width={500}
        onClose={onClose}
        open={open}
      >
        <ANTMenu
          onClick={onClick}
          selectedKeys={[navigation.active]}
          mode="inline"
          items={navigation.links}
        />
      </Drawer>
      <Toolbar variant="dense" sx={{ alignItems: "center" }}>
        <Box
          sx={{
            display: { xs: "block", sm: "block", md: "none", lg: "none" },
          }}
        >
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => showDrawer()}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Box py={2} px={2}>
          <Logo />
        </Box>

        <Stack flex={1}>
          <Stack
            py={1}
            direction={"row"}
            flex={1}
            sx={{
              display: { xs: "none", sm: "none", md: "block", lg: "block" },
            }}
          >
            <ANTMenu
              style={{ background: "transparent" }}
              onClick={onClick}
              selectedKeys={[navigation.active]}
              mode="horizontal"
              items={navigation.links}
            />
          </Stack>
        </Stack>

        <Stack spacing={1} direction={"row"} alignItems={"center"}>
          <Badge badgeContent={5} color="info">
            <IconButton href="/messages" sx={{ alignSelf: "flex-start" }}>
              <MessageRounded />
            </IconButton>
          </Badge>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            sx={{ alignSelf: "flex-start", alignItems: "center" }}
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Stack spacing={-1} alignItems={"center"}>
            <Typography variant="h6">Jane Doe</Typography>
            <Typography color={"GrayText"} variant="overline">
              Procurement
            </Typography>
          </Stack>
          {/* <Menu
            id="menu-appbar"
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}

            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>My account</MenuItem>
          </Menu> */}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
const Layout = (props) => {
  const { navigateTo } = props;
  const navigation = useSelector((state) => state.navigation);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const splitter = location.pathname.split("/");
    if (splitter[1]) {
      dispatch(setActiveNav(splitter[1]));
    } else {
      dispatch(setActiveNav("home"));
    }
  }, []);
  return (
    <Stack
      // p={2}
      flex={1}
      sx={{
        maxHeight: "100vh",
        minHeight: "100vh",
        overflow: "hidden",
        bgcolor: "#F6F6F6",
      }}
    >
      <MenuAppBar links={navigation.links} active={navigation.active} />

      <Stack
        m={{ xs: 0, sm: 1, md: 2, lg: 5 }}
        sx={{ overflowY: "auto", borderRadius: 3, bgcolor: "white" }}
        flex={1}
        height={"100%"}
        borderRadius={{ xs: 0, sm: 10, md: 20, lg: 30 }}
      >
        {props.children}
      </Stack>
    </Stack>
  );
};

export default Layout;
