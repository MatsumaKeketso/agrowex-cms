import {
  Box,
  Button,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Layout from "../components/Layout";
import StatsCard from "../components/StatsCard";

const Home = () => {
  const [tab, setTab] = React.useState(0);
  const [swiper, setSwiper] = React.useState(null);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };
  return (
    <Stack height={"100%"} flex={1} p={2} spacing={2}>
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <Typography variant="h5">Dashboard</Typography>
        <Box flex={1}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tab}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Sales" />
              <Tab label="Stock" />
            </Tabs>
          </Box>
        </Box>
      </Stack>
      {tab == 0 && (
        <Stack spacing={2} flex={1} sx={{ width: "100%", height: "100%" }}>
          <Stack direction={"row"} spacing={2} overflow={"auto"} py={1}>
            <StatsCard />
            <StatsCard />
            <StatsCard />
            <StatsCard />
          </Stack>
          <Stack>
            <Stack p={2}>
              <Typography variant="h6">Sales Overtime</Typography>
            </Stack>
          </Stack>
        </Stack>
      )}
      {tab == 1 && (
        <Stack flex={1} sx={{ width: "100%", height: "100%" }}>
          <Typography>Stock</Typography>
        </Stack>
      )}
      <Divider />
      <Stack>
        <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
          close
        </Button>
      </Stack>
    </Stack>
  );
};

export default Home;
