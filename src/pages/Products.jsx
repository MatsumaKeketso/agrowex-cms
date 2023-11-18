import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Layout from "../components/Layout";
import StatsCard from "../components/StatsCard";
import { AddRounded, EditRounded, RemoveRounded } from "@mui/icons-material";
import { Drawer, Form, Input, Select, Table, Upload } from "antd";

const Products = () => {
  const [tab, setTab] = React.useState(0);
  const [swiper, setSwiper] = React.useState(null);
  const [open, setOpen] = useState(false);
  const handleChange = (event, newValue) => {
    setTab(newValue);
  };
  const columns = [
    {
      title: "Image",
      width: 50,
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",

      dataIndex: "name",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "1",
    },

    {
      title: "Actions",
      key: "operation",
      width: 150,
      fixed: "right",
      render: (record) => {
        return (
          <Stack>
            <IconButton>
              <EditRounded />
            </IconButton>
            <IconButton>
              <RemoveRounded />
            </IconButton>
          </Stack>
        );
      },
    },
  ];
  const produceForm = [
    {
      label: "Product Name",
      name: "name",
    },
    {
      label: "Location",
      name: "location",
    },
    {
      label: "Price",
      name: "price",
    },
  ];
  return (
    <Layout>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Stack>
          <Form layout="vertical">
            <Upload
              name="avatar"
              listType="picture-circle"
              className="avatar-uploader"
              showUploadList={false}
              action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
            >
              <Avatar />
            </Upload>

            {produceForm.map((item) => (
              <Form.Item label={item.label} name={item.name} key={item.name}>
                <Input />
              </Form.Item>
            ))}
            <Form.Item label="Category">
              <Select
                defaultValue="lucy"
                // style={{ width: 120 }}
                options={[
                  { value: "jack", label: "Jack" },
                  { value: "lucy", label: "Lucy" },
                  { value: "Yiminghe", label: "yiminghe" },
                  { value: "disabled", label: "Disabled", disabled: true },
                ]}
              />
            </Form.Item>
            <Button variant="contained" fullWidth>
              Add
            </Button>
          </Form>
        </Stack>
      </Drawer>
      <Stack flex={1} p={2} spacing={2}>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <Typography variant="h5">Products</Typography>
          <Box flex={1}></Box>
          <Button onClick={() => setOpen(true)} startIcon={<AddRounded />}>
            New Produce
          </Button>
        </Stack>
        <Stack spacing={2} flex={1} sx={{ width: "100%", height: "100%" }}>
          <Table columns={columns} />
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

export default Products;
