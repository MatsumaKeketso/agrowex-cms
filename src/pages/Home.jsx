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
import { Radio, Table } from "antd";
import { Area } from "@ant-design/charts";
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
  const [tab, setTab] = React.useState("sales");
  const [swiper, setSwiper] = React.useState(null);
  const [checked, setChecked] = React.useState([1]);
  const [mode, setMode] = useState("sales");
  const [data, setData] = useState([]);

  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = () => {
    fetch(
      "https://gw.alipayobjects.com/os/bmw-prod/1d565782-dde4-4bb6-8946-ea6a38ccf184.json"
    )
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => {
        console.log("fetch data failed", error);
      });
  };
  const handleModeChange = (e) => {
    setTab(e.target.value);
  };
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
  const config = {
    data,
    xField: "Date",
    yField: "scales",
    xAxis: {
      range: [0, 1],
      tickCount: 5,
    },
    areaStyle: () => {
      return {
        fill: "l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff",
      };
    },
  };
  useEffect(() => {
    // chartData();
  });
  return (
    <Layout>
      <Stack height={"100%"} flex={1} p={2} spacing={2}>
        <Stack direction={"row"} spacing={2}>
          <Typography variant="h5">Dashboard</Typography>
          <Box flex={1}>
            <Radio.Group
              onChange={handleModeChange}
              value={tab}
              style={{ marginBottom: 8 }}
            >
              <Radio.Button value="sales">Sales</Radio.Button>
              <Radio.Button value="stock">Stock</Radio.Button>
            </Radio.Group>
          </Box>
        </Stack>
        {tab == "sales" && (
          <Stack spacing={2} flex={1} sx={{ width: "100%", height: "100%" }}>
            <Stack direction={"row"} spacing={2} overflow={"auto"} py={1}>
              <StatsCard />
              <StatsCard />
              <StatsCard />
              <StatsCard />
            </Stack>
            <Stack
            
              flex={1}
              spacing={2}
            >
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
                  >
                    <Area {...config} />
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
              <Stack direction={{ sm: "column", md: "row" }} flex={1}>
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
                    >
                      <Area {...config} />
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
                  >
                    <Area {...config} />
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
            </Stack>
          </Stack>
        )}
        {tab == "stock" && (
          <Stack flex={1} sx={{ width: "100%", height: "100%" }}>
            <Area {...config} />
          </Stack>
        )}
        <Divider />
        <Stack>
          <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
            export data
          </Button>
        </Stack>
      </Stack>
    </Layout>
  );
};

export default Home;
