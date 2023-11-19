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
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Slider,
  Table,
  Upload,
} from "antd";

const Products = () => {
  const [tab, setTab] = React.useState(0);
  const [swiper, setSwiper] = React.useState(null);
  const [open, setOpen] = useState(false);
  const [productType, setProduceType] = useState("Fruits/Veggies/Greens");
  const [inputValue, setInputValue] = useState(1);

  const onChange = (newValue) => {
    setInputValue(newValue);
  };
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
      label: "Price",
      name: "price",
    },
  ];
  return (
    <Layout>
      <Drawer
        title="Add Produce"
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Stack>
            <Segmented
              onChange={(e) => {
                setProduceType(e);
              }}
              default={productType}
              options={["Fruits/Veggies/Grains", "Livestock"]}
            />
          </Stack>
        }
        width={500}
        // style={{ width: 400 }}
      >
        <Stack>
          {productType === "Livestock" ? (
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
                  // style={{ width: 120 }}
                  options={[
                    { value: "fruits", label: "Fruits" },
                    { value: "veggies", label: "Vegetables" },
                    { value: "grains", label: "Grains" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Quantity">
                <Stack direction={"row"}>
                  <Slider
                    style={{ width: "100%" }}
                    min={1}
                    max={500}
                    onChange={onChange}
                    value={typeof inputValue === "number" ? inputValue : 0}
                  />
                  <InputNumber
                    min={1}
                    max={500}
                    style={{ margin: "0 16px" }}
                    value={inputValue}
                    onChange={onChange}
                  />
                </Stack>
              </Form.Item>
              <Button variant="contained" fullWidth>
                Add
              </Button>
            </Form>
          ) : (
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
              <Form.Item label="Livestock">
                <Input />
              </Form.Item>
              <Form.Item label="Quantity">
                <Stack direction={"row"}>
                  <Slider
                    style={{ width: "100%" }}
                    min={1}
                    max={500}
                    onChange={onChange}
                    value={typeof inputValue === "number" ? inputValue : 0}
                  />
                  <InputNumber
                    min={1}
                    max={500}
                    style={{ margin: "0 16px" }}
                    value={inputValue}
                    onChange={onChange}
                  />
                </Stack>
              </Form.Item>
              <Button variant="contained" fullWidth>
                Add
              </Button>
            </Form>
          )}
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
