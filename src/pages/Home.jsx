import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Layout from "../components/Layout";
import StatsCard from "../components/StatsCard";
import Chart from "chart.js/auto";
import {
  getAquisitionsByYear,
  liveSalesColumns,
  liveSalesData,
  salesOvertimeColumns,
  salesOvertimeData,
} from "../services/api";
import { Table } from "antd";
const salesOvertime = [
  {
    location: "Johannesburg",
    amount: 15000,
    countryCode: "ZA",
    country: "South Africa",
    flagImage: "https://example.com/southafrica-flag.png",
    numberOfSales: 25,
  },
  {
    location: "Cape Town",
    amount: 12000,
    countryCode: "ZA",
    country: "South Africa",
    flagImage: "https://example.com/southafrica-flag.png",
    numberOfSales: 18,
  },
  {
    location: "Lusaka",
    amount: 9000,
    countryCode: "ZM",
    country: "Zambia",
    flagImage: "https://example.com/zambia-flag.png",
    numberOfSales: 14,
  },
  {
    location: "Mombasa",
    amount: 6000,
    countryCode: "KE",
    country: "Kenya",
    flagImage: "https://example.com/kenya-flag.png",
    numberOfSales: 10,
  },
  {
    location: "Dar es Salaam",
    amount: 8500,
    countryCode: "TZ",
    country: "Tanzania",
    flagImage: "https://example.com/tanzania-flag.png",
    numberOfSales: 20,
  },
  {
    location: "Abuja",
    amount: 18000,
    countryCode: "NG",
    country: "Nigeria",
    flagImage: "https://example.com/nigeria-flag.png",
    numberOfSales: 27,
  },
  {
    location: "Nairobi",
    amount: 9500,
    countryCode: "KE",
    country: "Kenya",
    flagImage: "https://example.com/kenya-flag.png",
    numberOfSales: 16,
  },
];
const Home = () => {
  const [tab, setTab] = React.useState(0);
  const [swiper, setSwiper] = React.useState(null);
  const [checked, setChecked] = React.useState([1]);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const chartData = async () => {
    const data = await getAquisitionsByYear();
    console.log(data);
    var dimensionsChart = new Chart(document.getElementById("dimensions"), {
      type: "bubble",
      options: {
        aspectRatio: 1,
        scales: {
          x: {
            max: 500,
          },
          y: {
            max: 500,
          },
        },
      },
      data: {
        labels: data.map((x) => x.year),
        datasets: [
          {
            label: "Dimensions",
            data: data.map((row) => ({
              x: row.width,
              y: row.height,
              r: row.count,
            })),
          },
        ],
      },
    });
    await dimensionsChart.destroy();
    dimensionsChart = new Chart(document.getElementById("dimensions"), {
      type: "bubble",
      options: {
        aspectRatio: 1,
        scales: {
          x: {
            max: 500,
          },
          y: {
            max: 500,
          },
        },
      },
      data: {
        labels: data.map((x) => x.year),
        datasets: [
          {
            label: "Dimensions",
            data: data.map((row) => ({
              x: row.width,
              y: row.height,
              r: row.count,
            })),
          },
        ],
      },
    });
  };
  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };
  useEffect(() => {
    // chartData();
  });
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
          <Stack direction={"row"} flex={1} spacing={2}>
            {/* Sales Overtime */}
            <Stack spacing={2} p={2} flex={1}>
              <Stack>
                <Typography variant="h6">Sales Overtime</Typography>
              </Stack>
              <Stack>
                <Box
                  width={"100%"}
                  height={250}
                  alignItems={"center"}
                  justifyItems={"center"}
                  alignContent={"center"}
                  justifyContent={"center"}
                  textAlign={"center"}
                  bgcolor={"red"}
                >
                  Chart here...
                </Box>
                <Stack>
                  <Table
                    title={() => (
                      <Typography variant="subtitle1" fontWeight={"bold"}>
                        Locations
                      </Typography>
                    )}
                    columns={salesOvertimeColumns}
                    dataSource={salesOvertimeData}
                    // onChange={onChange}
                  />
                </Stack>
              </Stack>
            </Stack>
            {/* Real-Time Sale */}
            <Stack p={2} flex={1} spacing={2}>
              <Stack>
                <Typography variant="h6">Real-Time Sale</Typography>
              </Stack>
              <Stack>
                <Box
                  width={"100%"}
                  height={250}
                  alignItems={"center"}
                  justifyItems={"center"}
                  alignContent={"center"}
                  justifyContent={"center"}
                  textAlign={"center"}
                  bgcolor={"red"}
                >
                  Chart here...
                </Box>
                <Stack>
                  <Table
                    title={() => (
                      <Typography variant="subtitle1" fontWeight={"bold"}>
                        Locations
                      </Typography>
                    )}
                    columns={liveSalesColumns}
                    dataSource={liveSalesData}
                    // onChange={onChange}
                  />
                </Stack>
              </Stack>
            </Stack>
            {/* Inventory */}
            <Stack p={2} flex={1} spacing={2}>
              <Stack>
                <Typography variant="h6">Inventory Quantity</Typography>
              </Stack>
              <Box
                width={"100%"}
                height={250}
                alignItems={"center"}
                justifyItems={"center"}
                alignContent={"center"}
                justifyContent={"center"}
                textAlign={"center"}
                bgcolor={"red"}
              >
                Chart here...
              </Box>
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
          export data
        </Button>
      </Stack>
    </Stack>
  );
};

export default Home;
