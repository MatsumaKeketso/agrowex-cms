import React, { useState } from "react";
import Layout from "../components/Layout";
import { Box, Stack, Typography } from "@mui/material";
import { Drawer, Form, Table, DatePicker, Input, InputNumber, Button } from "antd";
import { AddRounded } from "@mui/icons-material";
import { SystemService } from "../services/systemService";
const { TimePicker } = DatePicker;
const WarehouseFrom = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const _warehouse = { ...values, created_at: SystemService.generateTimestamp(), craeted_by: 'uid' }
    console.log('Form values:', values);
    // Here you would typically send the data to your backend
  };
  return (
    <Form
      form={form}
      name="warehouseForm"
      onFinish={onFinish}
      layout="vertical"
    >
      <Form.Item
        name="warehouse_name"
        label="Warehouse Name"
        rules={[{ required: true, message: 'Please input the warehouse name!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please input the email!' },
          { type: 'email', message: 'Please enter a valid email!' }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone"
        rules={[{ required: true, message: 'Please input the phone number!' }]}
      >
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="logo"
        label="Logo"
        rules={[{ required: true, message: 'Please input the logo URL!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="_address" label="Address">
        <Input.TextArea />
      </Form.Item>

      <Form.Item name="manager_name" label="Manager Name">
        <Input />
      </Form.Item>

      <Form.Item
        name="capacity"
        label="Capacity"
        rules={[{ required: true, message: 'Please input the capacity!' }]}
      >
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="floor_sqr_meters"
        label="Floor Area (sq meters)"
        rules={[{ required: true, message: 'Please input the floor area!' }]}
      >
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>
      <Stack direction={'row'} gap={1}>
        <Form.Item name="opening_time" label="Opening Time">
          <TimePicker format="HH:mm" />
        </Form.Item>

        <Form.Item name="closing_time" label="Closing Time">
          <TimePicker format="HH:mm" />
        </Form.Item>

      </Stack>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}
const Warehouse = () => {
  const [open, setOpen] = useState(false);
  const columns = [
    {
      title: "Warehouse Name",
      dataIndex: "warehouseName",
      key: "1",
      fixed: "left",
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "1",
      fixed: "left",
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "1",
      fixed: "left",
    },
  ];
  return (
    <Layout>
      <Stack p={2} flex={1} position={"relative"}>
        <Drawer
          size="large"
          title="New Warehouse"
          open={open}
          onClose={() => {
            setOpen(false);
          }}
        >
          <WarehouseFrom />
        </Drawer>
        <Stack flex={1} gap={2}>
          <Stack
            position={"sticky"}
            direction={"row"}
            spacing={2}
            alignItems={"center"}
          >
            <Typography variant="h5">Warehouse</Typography>
            <Box flex={1}></Box>
            <Button
              onClick={() => {
                setOpen(true);
              }}
              variant="contained"
              startIcon={<AddRounded />}
            >
              New Warehouse
            </Button>
          </Stack>
          <Table columns={columns} />
        </Stack>
        <Stack>
          <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
            export data
          </Button>
        </Stack>
      </Stack>
    </Layout>
  );
};

export default Warehouse;
