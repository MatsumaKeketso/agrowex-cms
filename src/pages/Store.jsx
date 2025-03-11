import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
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
  AddRounded,
  DeleteRounded,
  EditRounded,
  FormatColorResetOutlined,
  Search,
} from "@mui/icons-material";
import {
  ConfigProvider,
  Drawer,
  Form,
  Input,
  Space,
  Statistic,
  Table,
  Select,
  Upload,
} from "antd";
import CustomTabPanel, { a11yProps } from "../components/CustomTabPanel";
import { theme } from "..";
import StoreService from "../services/storeService";
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
              <Input />
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
  const [pageLoading, setPageLoading] = React.useState(true);
  const [openCategoryDrawer, setOpenCategoryDrawer] = useState(false);
  const [products, setProducts] = useState([]);
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };
  const handleChange = (event, newValue) => {
    // setTab(newValue);
  };
  const tableColumns = [
    {
      // title: "Image",
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
      responsive: ["md"],
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
  const onChange = (value) => {
    console.log(`selected ${value}`);
  };
  const onSearch = (value) => {
    console.log("search:", value);
  };

  // Filter `option.label` match the user type `input`
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  useEffect(() => {
    StoreService.getAll().then((data) => {
      console.log(data);
      setProducts(data)
      setPageLoading(false)
    })
  }, [])
  return (
    <Layout>
      <Stack flex={1} p={2} spacing={2}>
        <Drawer
          title="Add Category/Type"
          open={openCategoryDrawer}
          onClose={() => setOpenCategoryDrawer(false)}
        >
          <Stack flex={1} gap={1}>
            <Stack flex={1}>
              <Input.Search placeholder="Search current categories..." />
              <List
                sx={{
                  width: "100%",
                  bgcolor: "background.paper",
                  position: "relative",
                  overflow: "auto",
                  maxHeight: 300,
                  "& ul": { padding: 0 },
                }}
                subheader={<li />}
              >
                {[0, 1, 2, 3, 4].map((value) => (
                  <li key={`section-${value}`}>
                    <ul>
                      <ListSubheader>
                        <Stack direction={"row"}>
                          <Stack flex={1}>{`I'm category ${value}`}</Stack>
                          <IconButton
                            sx={{ alignSelf: "flex-end" }}
                            size="small"
                          >
                            <EditRounded />
                          </IconButton>
                          <IconButton
                            color="error"
                            sx={{ alignSelf: "flex-end" }}
                            size="small"
                          >
                            <DeleteRounded />
                          </IconButton>
                        </Stack>
                      </ListSubheader>
                      {[0, 1, 2].map((item) => (
                        <ListItem key={`item-${value}-${item}`} disablePadding>
                          <ListItemButton>
                            <ListItemAvatar>
                              <Avatar
                                alt={`Avatar n°${value + 1}`}
                                src={`/static/images/avatar/${value + 1}.jpg`}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              id={value}
                              primary={`I'm product type ${value + 1}`}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </ul>
                  </li>
                ))}
              </List>
            </Stack>
            <Stack gap={2} flex={1}>
              <Stack gap={1}>
                <Divider />
                <Typography variant="h6">Product Category</Typography>
                <Form layout="vertical">
                  <Form.Item label="Category">
                    <Input />
                  </Form.Item>
                  <Button variant="outlined">Add Group</Button>
                </Form>
                <Divider />
              </Stack>
              <Stack>
                <Typography variant="h6">Product Type</Typography>
                <Form layout="vertical">
                  <Form.Item label="Group">
                    <Select
                      showSearch
                      placeholder="Select a person"
                      optionFilterProp="children"
                      onChange={onChange}
                      onSearch={onSearch}
                      filterOption={filterOption}
                      options={[
                        {
                          value: "jack",
                          label: "Jack",
                        },
                        {
                          value: "lucy",
                          label: "Lucy",
                        },
                        {
                          value: "tom",
                          label: "Tom",
                        },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="Products Type">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Code">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Store Option">
                    <Input />
                  </Form.Item>
                </Form>
                <Button variant="outlined">Add Type</Button>
                <Divider />
              </Stack>
            </Stack>
          </Stack>
        </Drawer>
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
            <Button
              startIcon={<AddRounded />}
              onClick={() => setOpenCategoryDrawer(true)}
            >
              New Category/Type
            </Button>
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
                      p={1}
                      gap={1}
                    >
                      <Divider orientation="vertical" flexItem />

                      <Input.Search placeholder="Search..." />
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
                // dataSource={products}
              ></Table>
            </CustomTabPanel>
            <CustomTabPanel value={tab} index={1}>
              <Table
                size="small"
                columns={tableColumns}
                // dataSource={products}
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
