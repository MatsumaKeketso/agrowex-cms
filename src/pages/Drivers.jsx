import React from "react";
import Layout from "../components/Layout";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Table } from "antd";

const Drivers = () => {
  return (
    <Layout>
      <Stack position={"relative"} flex={1} p={2} spacing={2}>
        <Stack
          position={"sticky"}
          direction={"row"}
          spacing={2}
          alignItems={"center"}
        >
          <Typography variant="h5">Drivers</Typography>
          <Box flex={1}></Box>
        </Stack>
        <Table
        style={{ height: "100%" }}
        columns={[
          {
            title: "Invoice Number",
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
        ]}
        scroll={{ x: 1500, y: 700 }}
      />
      </Stack>
    </Layout>
  );
};

export default Drivers;
