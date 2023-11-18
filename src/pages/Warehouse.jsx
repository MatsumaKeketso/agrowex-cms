import React, { useState } from "react";
import Layout from "../components/Layout";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Drawer, Form, Table, DatePicker, Input } from "antd";
import { AddRounded } from "@mui/icons-material";
const { TimePicker } = DatePicker;
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
  const warehouseForm = [
    { label: "Warehouse Name", name: "warehoueName", type: "text" },
    { label: "Owner/Manager", name: "manager", type: "text" },
    { label: "Phone Number", name: "phone", type: "tel" },
    { label: "Email", name: "email", type: "email" },
  ];
  return (
    <Layout>
      <Drawer
        title="New Warehouse"
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Stack>
          <Form
            layout="vertical"
            onFinish={(values) => {
              console.log(values);
            }}
          >
            {warehouseForm.map((item, i) => (
              <Form.Item label={item.label} name={item.name}>
                <Input type={item.type} />
              </Form.Item>
            ))}
            <Stack direction={"row"} gap={1}>
              <Form.Item name="openingTime" label="Opening Time">
                <TimePicker />
              </Form.Item>
              <Form.Item name="closingTime" label="Closing Time">
                <TimePicker />
              </Form.Item>
            </Stack>
            <Button type="submit" fullWidth variant="contained">
              Submit
            </Button>
          </Form>
          <Box></Box>
        </Stack>
      </Drawer>
      <Stack p={2} flex={1}>
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
