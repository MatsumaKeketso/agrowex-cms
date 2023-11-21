
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

const Farms = () => {
  return (
    <Layout>
       <Stack position={"relative"} flex={1} p={2} spacing={2}>
        <Stack
          position={"sticky"}
          direction={"row"}
          spacing={2}
          alignItems={"center"}
        >
          <Typography variant="h5">Farms</Typography>
          <Box flex={1}></Box>
        </Stack>
      </Stack>
    </Layout>
  );
}

export default Farms;
