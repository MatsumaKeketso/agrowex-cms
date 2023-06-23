import {
  Box,
  Button,
  Chip,
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
import { Table } from "antd";
// import type { ColumnsType } from 'antd/es/table';

const columns = [
  {
    title: "Order ID",
    width: 130,
    dataIndex: "id",
    key: "id",
    fixed: "left",
  },
  {
    title: "Customer",
    width: 100,
    dataIndex: "customer",
    key: "customer",
  },
  {
    title: "Location",
    dataIndex: "location",
    key: "1",
    width: 150,
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "2",
    width: 150,
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "3",
    width: 150,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "4",
    width: 150,
    render: () => (
      <Stack>
        <Chip label="status" />
      </Stack>
    ),
  },
  {
    title: "Assigned to",
    key: "operation",
    width: 150,
    fixed: "right",
    render: () => (
      <Stack>
        <Button>Assign driver</Button>
      </Stack>
    ),
  },
];

const data = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    id: `AGRO-1678451052830 ${i}`,
    customer: "Jane Doe",
    location: `London Park no. ${i}`,
    amount: "R20,3554.00",
    date: "34 Jul, 202x",
    status: "status",
  });
}

const Orders = () => {
  const [tab, setTab] = React.useState(0);
  const [swiper, setSwiper] = React.useState(null);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };
  return (
    <Stack flex={1} p={2} spacing={2}>
      <Stack
        position={"sticky"}
        direction={"row"}
        spacing={2}
        alignItems={"center"}
      >
        <Typography variant="h5">Orders</Typography>
        <Box flex={1}></Box>
      </Stack>
      <Stack
        spacing={2}
        flex={1}
        sx={{ width: "100%", maxheight: "100%", minheight: "100%" }}
      >
        <Table
          style={{ height: "100%" }}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1500 }}
        />
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

export default Orders;
