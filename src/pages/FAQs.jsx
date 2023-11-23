import React from "react";
import Layout from "../components/Layout";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import { green } from "@mui/material/colors";
import { Segmented } from "antd";
import {
  AgricultureRounded,
  DescriptionRounded,
  DirectionsCarRounded,
  ShoppingBagRounded,
  Support,
  SupportRounded,
} from "@mui/icons-material";
const tabs = [
  {
    label: (
      <Stack alignItems={"center"} py={1}>
        <SupportRounded />
        <Typography variant="overline">General</Typography>
      </Stack>
    ),
    value: "general",
  },
  {
    label: (
      <Stack alignItems={"center"} py={1}>
        <AgricultureRounded />
        <Typography variant="overline">Farmer</Typography>
      </Stack>
    ),
    value: "farmer",
  },
  {
    label: (
      <Stack alignItems={"center"} py={1}>
        <DescriptionRounded />
        <Typography variant="overline">Registration</Typography>
      </Stack>
    ),
    value: "registration",
  },
  {
    label: (
      <Stack alignItems={"center"} py={1}>
        <DirectionsCarRounded />
        <Typography variant="overline">Driver</Typography>
      </Stack>
    ),
    value: "driver",
  },
  {
    label: (
      <Stack alignItems={"center"} py={1}>
        <ShoppingBagRounded />
        <Typography variant="overline">Ordering</Typography>
      </Stack>
    ),
    value: "ordering",
  },
];
const faqs = [
  {
    title: "How do I add products to cart?",
    description:
      "Go to the cart icon, click on it and it'll show you an add to cart pop up which you can adjust the quantity according to your liking.",
  },
  {
    title: "How do I download the app?",
    description:
      "You can find the Agrowex app from the Google PLay store and wil soon be available on the web.",
  },
  {
    title: "Do i Buy from Agrowex or from Suppliers?",
    description:
      "Agrowex is a service provider that is responsible for delivering products.",
  },
];
const FAQs = () => {
  return (
    <Layout>
      <Stack></Stack>
      <Stack position={"relative"} flex={1} gap={1}>
        <Stack
          p={2}
          position={"sticky"} 
          direction={"row"}
          spacing={2}
          bgcolor={green[500]}
          color={"white"}
          alignItems={"center"}
        >
          <Stack gap={2}>
            <Typography variant="h5">Frequently Asked Questions</Typography>
            <Typography variant="body1">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              Voluptatem praesentium nesciunt deleniti soluta obcaecati, vero
              nostrum mollitia, dignissimos amet veniam aperiam explicabo
              deserunt quasi est ratione, illum cum. Labore, optio?
            </Typography>
          </Stack>

          <Box flex={1}></Box>
        </Stack>
        <Stack p={2} gap={2}>
          <Segmented options={tabs} />
          <Stack>
            {faqs.map((faq, i) => {
              return (
                <Accordion disableGutters key={i} variant="outlined">
                  <AccordionSummary>
                    <Typography variant="subtitle1">{faq.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>{faq.description}</AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Layout>
  );
};

export default FAQs;
