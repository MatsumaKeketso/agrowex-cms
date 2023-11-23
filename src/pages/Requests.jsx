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
import { Drawer, Statistic, Table } from "antd";
import { CallRounded } from "@mui/icons-material";

const Requests = () => {
  const [openDetails, setOpenDetails] = useState(true);
  const columns = [
    {
      title: "Ref ID",
      dataIndex: "refId",
      key: "refId",
    },
    {
      title: "Produce Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 150,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 150,
    },
    {
      title: "Contract Type",
      dataIndex: "cType",
      key: "cType",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "x",
      render: () => {
        <Stack>
          <Button onClick={() => setOpenDetails(true)}>View Details</Button>
        </Stack>;
      },
    },
  ];
  const detailCols = [
    {
      title: "Production/Farming Method",
      dataIndex: "refId",
      key: "refId",
      rowScope: "row",
    },
    {
      title: "Produce Name",
      dataIndex: "name",
      key: "name",
      rowScope: "row",
    },
    {
      title: "Frequency Check",
      dataIndex: "duration",
      key: "duration",

      rowScope: "row",
    },
    {
      title: "Supply Duration",
      dataIndex: "date",
      key: "date",
      rowScope: "row",
    },
    {
      title: "Grade",
      dataIndex: "cType",
      key: "cType",
      rowScope: "row",
    },
  ];
  return (
    <Layout>
      <Stack position={"relative"} flex={1} p={2} spacing={2}>
        <Drawer
          title="#73C69FA3-E011"
          width={"50%"}
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          footer={
            <Stack direction={"row"} gap={1}>
              <Button variant="contained">Assign</Button>
              <Button color="error">Decline</Button>
            </Stack>
          }
        >
          <Stack gap={2}>
            <Grid container gap={1}>
              <Grid item>
                <Statistic title="Start Date" value={"01 Feb 2022"} />
              </Grid>
              <Grid item>
                <Statistic title="Completion Date" value={"01 Feb 2022"} />
              </Grid>
            </Grid>
            <Divider />
            <Stack direction={"row"}>
              <Typography flex={1} variant="h6">
                Offtaker's Details
              </Typography>
              <Typography>R69,000.00</Typography>
            </Stack>
            <List>
              <ListItem
                secondaryAction={
                  <IconButton>
                    <CallRounded />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar />
                </ListItemAvatar>
                <ListItemText
                  primary="James"
                  secondary="0123456789 - customer"
                />
              </ListItem>
            </List>
            <Grid container gap={3}>
              <Grid item>
                <Statistic title="Pricing Options" value={"Consignment"} />
              </Grid>
              <Grid item>
                <Statistic title="Request Date" value={"01 Feb 2022"} />
              </Grid>
              <Grid item>
                <Statistic title="Unit Price" value={"R23.00"} />
              </Grid>
              <Grid item>
                <Statistic title="Region" value={"Somewhere"} />
              </Grid>
            </Grid>
            <Divider />
            <Stack gap={2}>
              <Stack direction={"row"} gap={3}>
                <Typography flex={1} variant="h6">
                  Request Details
                </Typography>
                <Statistic title="Quantities" value={2500} />
                <Statistic title="Weight" value={700000} suffix="kg" />
              </Stack>

              <Table columns={detailCols} />
            </Stack>
          </Stack>
        </Drawer>
        <Stack
          position={"sticky"}
          direction={"row"}
          spacing={2}
          alignItems={"center"}
        >
          <Typography variant="h5">Requests</Typography>
          <Box flex={1}></Box>
        </Stack>
        <Table columns={columns} />
      </Stack>
    </Layout>
  );
};

export default Requests;
