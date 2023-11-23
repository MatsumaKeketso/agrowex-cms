import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Layout from "../components/Layout";
import StatsCard from "../components/StatsCard";
import {
  Breadcrumb,
  Drawer,
  Empty,
  Form,
  Input,
  Statistic,
  Table,
  Tag,
  theme,
} from "antd";
import { AddRounded } from "@mui/icons-material";
import Search from "antd/es/input/Search";
// import type { ColumnsType } from 'antd/es/table';

const data = [];
for (let i = 0; i < 1; i++) {
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
const AssignDriver = ({ record, open, setOpen }) => {
  const [drivers, setDrivers] = useState([]);

  const [state, setState] = useState("View Details");
  useEffect(() => {
    console.log(record);
  }, []);
  return (
    <Stack>
      <Button
        onClick={() => {
          setOpen(true);
        }}
        sx={{ alignSelf: "flex-start" }}
      >
        {state}
      </Button>
    </Stack>
  );
};
const AssignDriverForm = () => {
  const [details, setDetails] = useState(false);
  const generateRandomProfile = () => {
    const firstNames = ["Jane", "John", "Alice", "Bob", "Eva", "David"];
    const lastNames = ["Doe", "Smith", "Johnson", "Brown", "Lee", "Garcia"];

    const randomFirstName =
      firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName =
      lastNames[Math.floor(Math.random() * lastNames.length)];

    return {
      firstName: randomFirstName,
      lastName: randomLastName,
    };
  };
  return (
    <Stack gap={2}>
      <Breadcrumb>
        <Breadcrumb.Item>Assign Driver</Breadcrumb.Item>
        <Breadcrumb.Item>to Order AGRO-2312412123 22</Breadcrumb.Item>
      </Breadcrumb>
      <Input.Search placeholder="Search Driver...." />
      <Empty />
      <Divider />
      <Paper
        variant="outlined"
        sx={{
          p: 2,
        }}
      >
        <Typography variant="subtitle2">
          Search Results found for: "<b>Thabi</b>"
        </Typography>
        <List>
          {Array(17)
            .fill()
            .map(() => (
              <ListItem divider dense disablePadding disableGutters>
                <ListItemButton>
                  <ListItemAvatar>
                    <Avatar></Avatar>
                  </ListItemAvatar>
                  <ListItemText>
                    {generateRandomProfile().firstName}{" "}
                    {generateRandomProfile().lastName}
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
        </List>
      </Paper>
    </Stack>
  );
};
const ProductItem = () => {
  return (
    <Stack direction={"row"}>
      <Avatar />
      <Stack>
        <Typography variant="h6">Ribola Plastics and Nursery</Typography>
      </Stack>
    </Stack>
  );
};
const OrderDetails = () => {
  return (
    <Stack gap={2}>
      <Stack direction={"row"} alignItems={"center"}>
        <Stack flex={1} gap={1}>
          <Typography variant="h6">Order Details</Typography>
          <Stack gap={1} direction={"row"} alignItems={"center"}>
            <Typography variant="body2">AGRO-1678451052830</Typography>
            <Tag style={{ alignSelf: "flex-start" }} color="red">
              Status
            </Tag>
          </Stack>
        </Stack>
        <Button size="small">Defaulted Drivers</Button>
      </Stack>
      <Divider />
      <Stack gap={2}>
        <Stack direction={"row"} gap={2} alignItems={"center"}>
          <Typography fontWeight={"bold"} variant="subtitle2">
            Invoice Number
          </Typography>
          <Divider flexItem orientation="vertical" />
          <Typography>#323232323123</Typography>
        </Stack>
        <Stack direction={"row"} gap={2} alignItems={"center"}>
          <Typography fontWeight={"bold"} variant="subtitle2">
            Date & Time
          </Typography>
          <Divider flexItem orientation="vertical" />
          <Typography>10 Mar 2023 14:24 PM</Typography>
        </Stack>
        <Stack direction={"row"} gap={2} alignItems={"center"}>
          <Typography fontWeight={"bold"} variant="subtitle2">
            Assigned Driver
          </Typography>
          <Divider flexItem orientation="vertical" />
          <Button startIcon={<AddRounded />} size="small">
            Assign Driver
          </Button>
        </Stack>
      </Stack>
      <Accordion variant="outlined">
        <AccordionSummary>
          <Typography variant="subtitle1" fontWeight={"bold"}>
            Customer Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack gap={2}>
            <Stack direction={"row"} gap={2}>
              <Typography fontWeight={"bold"} variant="body2">
                Phone Number
              </Typography>
              <Divider flexItem orientation="vertical" />
              <Typography variant="body2">0123456789</Typography>
            </Stack>
            <Stack direction={"row"} gap={2}>
              <Typography fontWeight={"bold"} variant="body2">
                Email
              </Typography>
              <Divider flexItem orientation="vertical" />
              <Typography variant="body2">janedoe@gmail.com</Typography>
            </Stack>
            <Stack direction={"row"} gap={2}>
              <Typography fontWeight={"bold"} variant="body2">
                Location
              </Typography>
              <Divider flexItem orientation="vertical" />
              <Typography variant="body2">
                162 King Shaka street , South Africa
              </Typography>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
      {/* <Divider /> */}
      <Stack direction={"row"} gap={5} alignItems={"center"}>
        <Typography variant="h6" flex={1}>
          Products
        </Typography>
        <Input.Search placeholder="Search..." />
      </Stack>
      <Stack
        gap={2}
        bgcolor={"ButtonShadow"}
        p={1}
        direction={"row"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Typography>Items ( 5 )</Typography>
        <Divider flexItem orientation="vertical" />
        <Typography>Total - R0.00</Typography>
      </Stack>
      {Array(1)
        .fill()
        .map((d, i) => {
          const productColumns = [
            {
              title: "Item",
              dataIndex: "item",
              key: "1",
            },
            {
              title: "Quanitity",
              dataIndex: "quantity",
              key: "2",
            },
            {
              title: "Amount",
              dataIndex: "amount",
              key: "3",
            },
          ];
          return (
            <Stack direction={"row"} flex={1} gap={1}>
              <Avatar />
              <Stack flex={1}>
                <Typography variant="h6">
                  Ribola Plastics and Nursery
                </Typography>
                <Breadcrumb>
                  <Breadcrumb.Item>Retailer</Breadcrumb.Item>
                  <Breadcrumb.Item>Agro</Breadcrumb.Item>
                </Breadcrumb>
                <Accordion elevation={0}>
                  <AccordionSummary>More</AccordionSummary>
                  <AccordionDetails>
                    <Table size="small" columns={productColumns} />
                  </AccordionDetails>
                </Accordion>
              </Stack>
            </Stack>
          );
        })}
    </Stack>
  );
};

const Orders = () => {
  const [tab, setTab] = React.useState(0);
  const [swiper, setSwiper] = React.useState(null);
  const [open, setOpen] = useState(false);
  const [openAssignDriver, setAssignDriver] = useState(false);
  const [openNewOrderDrawer, setOpenNewOrderDrawer] = useState(false);
  const { token } = theme.useToken();
  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  function generateRandomState() {
    const states = [
      "On Route",
      "Pending",
      "Delivered",
      "Error",
      "Cancelled",
      "Idle",
    ];
    const colors = [
      "#3498db",
      "#f39c12",
      "#2ecc71",
      "#e74c3c",
      "#9b59b6",
      "#95a5a6",
    ];

    const randomIndex = Math.floor(Math.random() * states.length);

    return {
      state: states[randomIndex],
      color: colors[randomIndex],
    };
  }
  const columns = [
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
    {
      title: "Status",
      dataIndex: "status",
      key: "4",
      width: 150,
      render: () => (
        <Stack>
          <Tag
            style={{ alignSelf: "flex-start" }}
            color={generateRandomState().color}
          >
            {generateRandomState().state}
          </Tag>
        </Stack>
      ),
    },
    {
      title: "Actions",
      key: "operation",
      width: 150,
      fixed: "right",
      render: (record) => {
        return <AssignDriver setOpen={setOpen} record={record} />;
      },
    },
  ];
  return (
    <Layout>
      <Drawer
        title="New Order"
        open={openNewOrderDrawer}
        onClose={() => setOpenNewOrderDrawer(false)}
      >
        <Stack gap={2}>
          <Typography>Invoice Number: AGRO-1664203076594</Typography>
          <Form
            layout="vertical"
            onFinish={(values) => {
              console.log("Form Values: ", values);
            }}
          >
            <Form.Item label="Delivery Fee Exclusive Total">
              <Input />
            </Form.Item>
            <Form.Item label="Delivery Fee Inclusive Total">
              <Input />
            </Form.Item>
            <Form.Item label="Transport Fare">
              <Input />
            </Form.Item>
            <Form.Item label="Location">
              <Input />
            </Form.Item>
            <Button fullWidth variant="contained">
              Submit
            </Button>
          </Form>
          <Stack gap={2}>
            <Stack gap={1}>
              <Typography fontWeight={"bold"}>Customer Details</Typography>
              <Grid container gap={1} direction={"row"}>
                <Grid item>
                  <Statistic
                    valueStyle={{ fontSize: 16 }}
                    title="Phone Number"
                    value={"0726390088"}
                    groupSeparator=""
                  />
                </Grid>
                <Grid item>
                  <Statistic
                    valueStyle={{ fontSize: 16 }}
                    title="Email"
                    value={"agrowex.test@gmail.com"}
                  />
                </Grid>
                <Grid item>
                  <Statistic
                    title="Address"
                    valueStyle={{ fontSize: 16 }}
                    value={
                      "V&A Waterfront, East Pier Rd, Cape Town, Western Cape 8001, South Africa, Cape Town, Western Cape, South Africa"
                    }
                  />
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </Stack>
      </Drawer>
      <Stack position={"relative"} flex={1} p={2} spacing={2}>
        <Stack
          position={"sticky"}
          direction={"row"}
          spacing={2}
          alignItems={"center"}
        >
          <Typography variant="h5">Orders</Typography>
          <Box flex={1}></Box>
          <Button
            variant="contained"
            onClick={() => setOpenNewOrderDrawer(true)}
          >
            New Order
          </Button>
        </Stack>
        <Stack
          spacing={2}
          flex={1}
          sx={{
            width: "100%",
            // maxheight: "100%",
            // minheight: "100%",
          }}
        >
          <Drawer
            title="Details"
            open={open}
            onClose={() => setOpen(false)}
            getContainer={false}
            width={"50%"}
          >
            <OrderDetails />
          </Drawer>
          <Stack direction={"row"} gap={2}>
            <Stack flex={1}>
              <Statistic value={50} title="Total Orders" />
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Statistic
              value={50}
              title="Opened"
              valueStyle={{ color: "green" }}
            />
            <Divider orientation="vertical" flexItem />
            <Statistic
              value={50}
              title="Closed"
              valueStyle={{ color: "red" }}
            />
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
              {
                title: "Status",
                dataIndex: "status",
                key: "4",
                width: 150,
                render: () => (
                  <Stack>
                    <Tag
                      style={{ alignSelf: "flex-start" }}
                      color={generateRandomState().color}
                    >
                      {generateRandomState().state}
                    </Tag>
                  </Stack>
                ),
              },
              {
                title: "Actions",
                key: "operation",
                width: 150,
                fixed: "right",
                render: (record) => {
                  return <AssignDriver setOpen={setOpen} record={record} />;
                },
              },
            ]}
            dataSource={data}
            scroll={{ x: 1500, y: 700 }}
          />
        </Stack>
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

export default Orders;
