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

const Store = () => {
  const [tab, setTab] = React.useState(0);
  const [swiper, setSwiper] = React.useState(null);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };
  return (
    <Stack flex={1} p={2} spacing={2}>
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <Typography variant="h5">Store</Typography>
        <Box flex={1}></Box>
      </Stack>
      <Stack spacing={2} flex={1} sx={{ width: "100%", height: "100%" }}>
        content here...
      </Stack>
      <Divider />
      <Stack>
        <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
          export data
        </Button>
      </Stack>
    </Stack>
  );
};

export default Store;
