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
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Layout from "../components/Layout";
import StatsCard from "../components/StatsCard";
import { AddRounded, Search } from "@mui/icons-material";
import {
  ConfigProvider,
  Drawer,
  Form,
  Input,
  Space,
  Statistic,
  Table,
  Upload,
} from "antd";
import CustomTabPanel, { a11yProps } from "../components/CustomTabPanel";
import { theme } from "..";
const { Dragger } = Upload;
const ProductForm = ({ open, onClose }) => {
  const ProductForm = [
    // ... additional controls
    {
      label: "Product Name",
      name: "productName",
      props: { placeholder: "Hello", required: true },
    },
    {
      label: "Price",
      name: "price",
      props: { placeholder: "Hello", required: false },
    },
    {
      label: "Description",
      name: "description",
      props: { placeholder: "Hello", required: true },
    },
  ];
  return (
    <Drawer open={open} title="New Product" onClose={onClose}>
      <Form
        layout="vertical"
        onFinish={(values) => {
          console.log(values);
        }}
      >
        <Upload name="avatar">
          <Avatar sx={{ width: 200, height: 200 }}>Upload</Avatar>
        </Upload>
        <br />
        <br />
        {ProductForm.map((input) => {
          const { placeholder, required } = input?.props;
          return (
            <Form.Item
              rules={[{ required: required }]}
              name={input.name}
              label={input.label}
            >
              <TextField
                placeholder={placeholder}
                fullWidth
                variant="standard"
                size="small"
              />
            </Form.Item>
          );
        })}
        <Button fullWidth type="submit">
          Done
        </Button>
      </Form>
    </Drawer>
  );
};

const Store = () => {
  const [tab, setTab] = React.useState(0);
  const [drawer, setDrawer] = React.useState(false);
  const [swiper, setSwiper] = React.useState(null);
  const [products, setProducts] = useState([]);
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };
  const handleChange = (event, newValue) => {
    // setTab(newValue);
  };
  const tableColumns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text, record) => (
        <Avatar
          sx={{ width: 50, height: 50 }}
          src={record.image}
          alt="Product"
        ></Avatar>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Sizes",
      dataIndex: "sizes",
      key: "sizes",
      render: (text) => text.join(", "), // Assuming sizes is an array
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => setDrawer(true)}>Edit</Button>
          <Button> Delete</Button>
        </Space>
      ),
    },
  ];
  useState(() => {
    const dataSource = [
      // Example data
      {
        key: "1",
        image: "product1.jpg",
        productName: "Product 1",
        price: "$50.00",
        description: "Lorem ipsum dolor sit amet.",
        sizes: ["Small", "Medium", "Large"],
        supplier: "Supplier A",
      },
      {
        key: "1",
        image: "product1.jpg",
        productName: "Product 1",
        price: "$50.00",
        description: "Lorem ipsum dolor sit amet.",
        sizes: ["Small", "Medium", "Large"],
        supplier: "Supplier A",
      },
      {
        key: "1",
        image: "product1.jpg",
        productName: "Product 1",
        price: "$50.00",
        description: "Lorem ipsum dolor sit amet.",
        sizes: ["Small", "Medium", "Large"],
        supplier: "Supplier A",
      },
      {
        key: "1",
        image: "product1.jpg",
        productName: "Product 1",
        price: "$50.00",
        description: "Lorem ipsum dolor sit amet.",
        sizes: ["Small", "Medium", "Large"],
        supplier: "Supplier A",
      },
      // Add more data as needed
    ];
    setProducts(dataSource);
  }, []);
  return (
    <Layout>
      <Stack flex={1} p={2} spacing={2}>
        <Stack direction={"row"} gap={3} alignItems={"center"}>
          <ProductForm onClose={() => setDrawer(false)} open={drawer} />
          <Typography variant="h5">Store</Typography>
          <Box flex={1}></Box>
          <Stack direction={"row"} gap={2}>
            <Button
              onClick={() => {
                setDrawer(true);
              }}
              startIcon={<AddRounded />}
              variant="outlined"
            >
              New Product
            </Button>
            <Button startIcon={<AddRounded />}>New Category</Button>
          </Stack>
        </Stack>
        <Stack spacing={2} flex={1} sx={{ width: "100%", height: "100%" }}>
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="basic tabs example"
              >
                <Tab label="All Products (56)" {...a11yProps(0)} />
                <Tab label="Hidden (10)" {...a11yProps(1)} />
                <Stack
                  height={"100%"}
                  alignItems={"center"}
                  alignSelf={"flex-end"}
                  // pb={1}
                >
                  <Paper elevation={0}>
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      px={1}
                      gap={1}
                    >
                      <Divider orientation="vertical" flexItem />

                      <TextField
                        // sx={{ px: 2 }}
                        focused
                        label="Search"
                        fullWidth
                        variant="standard"
                        size="small"
                      />
                    </Stack>
                  </Paper>
                </Stack>
                {/* <Tab label="Item Three" {...a11yProps(2)} /> */}
              </Tabs>
            </Box>
            <CustomTabPanel value={tab} index={0}>
              <Table
                footer={() => {
                  return (
                    <Stack alignContent={"flex-start"}>
                      <Statistic title="Total Products" value={500} />
                    </Stack>
                  );
                }}
                size="small"
                columns={tableColumns}
                dataSource={products}
              ></Table>
            </CustomTabPanel>
            <CustomTabPanel value={tab} index={1}>
              <Table
                size="small"
                columns={tableColumns}
                dataSource={products}
              ></Table>
            </CustomTabPanel>
          </Box>
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

export default Store;
