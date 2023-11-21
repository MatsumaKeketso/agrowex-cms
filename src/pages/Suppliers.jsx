import React, { useState } from "react";
import Layout from "../components/Layout";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Drawer, Form, Image, Input, Popconfirm, Select, Table } from "antd";
import { DeleteRounded, EditRounded } from "@mui/icons-material";

const Suppliers = () => {
  const [open, setOpen] = useState(false);
  const data = [
    {
      image:
        "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/driverImgs%2F1624967280734?alt=media&token=cce0e2d1-413f-4333-9227-6c3ede70d853",
      supplierName: "SupraSuppliers",
      address: "Heloma Avenue, Pretoria, Gauteng 0157, South Africa",
      industry: "Tech Industry",
      type: "Live Stock Transportation",
    },
  ];
  const columns = [
    {
      title: "",
      width: 70,
      key: "image",
      render: (record) => {
        console.log(record);
        return (
          <Avatar>
            <Image style={{ objectFit: "cover" }} src={record.image} />
          </Avatar>
        );
      },
    },
    {
      title: "Supplier name",
      dataIndex: "supplierName",
      key: "supplierName",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Industry",
      dataIndex: "industry",
      key: "industry",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Actions",
      key: "operation",
      width: 150,
      fixed: "right",
      render: (record) => {
        return (
          <Stack direction={"row"} gap={1}>
            <IconButton>
              <EditRounded />
            </IconButton>
            <Popconfirm
              title="Delete the Supplier"
              description="Are you sure to delete this Supplier?"
              okText="Yes"
              cancelText="No"
            >
              <IconButton color="error">
                <DeleteRounded />
              </IconButton>
            </Popconfirm>
          </Stack>
        );
      },
    },
  ];
  return (
    <Layout>
      <Drawer open={open} onClose={() => setOpen(false)} title="Add Supplier">
        <Stack gap={1}>
          <Form layout="vertical">
            <Stack gap={1}>
              <Divider>Add Supplier Type or Industry</Divider>
              <Form.Item label="Supplier Type or Industry">
                <Select
                  options={[
                    { value: "type", label: "Type" },
                    { value: "industry", label: "Industry" },
                  ]}
                />
              </Form.Item>
              <Divider>Supplier Details</Divider>

              <Form.Item label="Type">
                <Select
                  options={[
                    { value: "vendor", label: "Vendor" },
                    { value: "service-provider", label: "Service Provider" },
                    {
                      value: "service-provider",
                      label: "Livestock Transportaion",
                    },
                    { value: "service-provider", label: "Soil Health" },
                    { value: "service-provider", label: "Supplier" },
                  ]}
                />
              </Form.Item>

              <Form.Item label="Add Supplier Type or Industry">
                <Input />
              </Form.Item>

              <Form.Item label="Add Supplier Type or Industry">
                <Input />
              </Form.Item>

              <Form.Item label="Add Supplier Type or Industry">
                <Input />
              </Form.Item>

              <Form.Item label="Add Supplier Type or Industry">
                <Input />
              </Form.Item>
              <Button variant="contained">Submit</Button>
            </Stack>
          </Form>
        </Stack>
      </Drawer>
      <Stack position={"relative"} flex={1} p={2} spacing={2}>
        <Stack
          position={"sticky"}
          direction={"row"}
          spacing={2}
          alignItems={"center"}
        >
          <Typography variant="h5">Suppliers</Typography>
          <Box flex={1}></Box>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add Supplier
          </Button>
        </Stack>
        <Table columns={columns} dataSource={data} />
      </Stack>
    </Layout>
  );
};

export default Suppliers;
