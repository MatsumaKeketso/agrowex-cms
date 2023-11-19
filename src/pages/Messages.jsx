import React from "react";
import Layout from "../components/Layout";
import {
  AppBar,
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CustomTabPanel, { a11yProps } from "../components/CustomTabPanel";
import { green } from "@mui/material/colors";
import { MessageRounded } from "@mui/icons-material";
import { Empty, Input } from "antd";

const Messages = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const inboxMessages = [
    {
      subject: "Inquiry about Listing Process",
      content:
        "Hey Keketso,\n\nI trust this message finds you well. I'm currently in the process of listing my farm produce on the platform. Can you guide me through the steps involved and provide any additional information I might need? Your assistance is highly appreciated.\n\nBest regards,\n[Farmer's Name]",
    },
    {
      subject: "Product Image Guidelines",
      content:
        "Hello Keketso,\n\nI hope you're having a great day! Quick question: Are there any specific guidelines or recommendations for the images I upload for my produce listings? I want to make sure they showcase my products in the best light possible.\n\nThanks in advance,\n[Farmer's Name]",
    },
    {
      subject: "Delivery Options Inquiry",
      content:
        "Hi Keketso,\n\nI've been exploring the platform, and it looks fantastic. Before I proceed with listing my produce, could you provide more details on the available delivery options? I want to ensure a smooth experience for both myself and potential buyers.\n\nLooking forward to your response,\n[Farmer's Name]",
    },
    {
      subject: "Payment Process Clarification",
      content:
        "Hi Keketso,\n\nI hope this message reaches you well. I'm curious about the payment process once a buyer purchases my produce. Could you provide some clarity on how payments are handled and when I can expect to receive them?\n\nThanks a bunch,\n[Farmer's Name]",
    },
    {
      subject: "Product Promotion Opportunities",
      content:
        "Hello Keketso,\n\nI've noticed some featured products on the platform. How can I get my produce to be featured, and are there any specific criteria for promotion? I'm eager to maximize the visibility of my offerings.\n\nBest regards,\n[Farmer's Name]",
    },
    {
      subject: "Technical Issue with Listing",
      content:
        "Hey Keketso,\n\nI encountered a technical issue while trying to list my produce. The system seems to be displaying an error message. Could you please assist in resolving this matter? I appreciate your prompt attention to this.\n\nWarm regards,\n[Farmer's Name]",
    },
    {
      subject: "Bulk Listing Assistance",
      content:
        "Hi Keketso,\n\nI'm planning to list a significant quantity of produce. Is there a bulk listing feature available, or should I go through the regular listing process for each item? Your guidance on this matter is much appreciated.\n\nThanks,\n[Farmer's Name]",
    },
    {
      subject: "Feedback on User Interface",
      content:
        "Hello Keketso,\n\nI've been using the platform for a while now, and overall, it's been a great experience. I wanted to share some feedback on the user interface. Is there a designated channel for providing feedback, or should I share it here?\n\nBest regards,\n[Farmer's Name]",
    },
    {
      subject: "Inquiry about Buyer Reviews",
      content:
        "Hey Keketso,\n\nI hope you're doing well. I'm curious about how buyer reviews work on the platform. Can you provide some insights into how reviews are collected and displayed? I want to ensure transparency for potential buyers.\n\nThanks in advance,\n[Farmer's Name]",
    },
    {
      subject: "Upcoming Platform Updates",
      content:
        "Hi Keketso,\n\nI've heard there might be some updates to the platform soon. Could you share any information on what changes are expected and how they might impact users like myself? I like to stay informed.\n\nLooking forward to your response,\n[Farmer's Name]",
    },
    {
      subject: "Marketing Support Inquiry",
      content:
        "Hello Keketso,\n\nI'm interested in learning more about the marketing support the platform offers to farmers. Are there any promotional campaigns or initiatives that I can participate in to boost the visibility of my products?\n\nThanks a bunch,\n[Farmer's Name]",
    },
    {
      subject: "Account Security Concerns",
      content:
        "Hi Keketso,\n\nI've been actively using the platform, and I'm concerned about the security of my account. What measures are in place to ensure the safety of user accounts, and do you have any recommendations for enhancing security?\n\nAppreciate your assistance,\n[Farmer's Name]",
    },
    {
      subject: "Educational Resources Inquiry",
      content:
        "Hey Keketso,\n\nI've heard about educational resources related to farming practices available on the platform. Could you point me in the right direction or provide more details on how I can access these resources? I'm eager to expand my knowledge.\n\nBest regards,\n[Farmer's Name]",
    },
    {
      subject: "Platform Terms and Conditions",
      content:
        "Hello Keketso,\n\nI hope this message finds you well. Before I proceed with listing my produce, I'd like to familiarize myself with the platform's terms and conditions. Could you direct me to where I can find this information?\n\nThanks in advance,\n[Farmer's Name]",
    },
    {
      subject: "Community Forum Participation",
      content:
        "Hi Keketso,\n\nI've heard there's a community forum for farmers on the platform. How can I join, and are there any specific benefits to participating in the community discussions? I'm interested in connecting with fellow farmers.\n\nLooking forward to your guidance,\n[Farmer's Name]",
    },
  ];
  return (
    <Layout>
      <Stack gap={1} height={"100%"}>
        <Stack
          bgcolor={green[600]}
          alignItems={"center"}
          gap={2}
          p={2}
          direction={"row"}
          position={"sticky"}
        >
          <MessageRounded sx={{ color: "white" }} />
          <Typography variant="h5" color={"white"}>
            Messages
          </Typography>
        </Stack>
        <Stack gap={2} p={2} height={"100%"}>
          <Box sx={{ width: "100%" }}>
            <AppBar
              color="inherit"
              elevation={0}
              position="sticky"
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Stack direction={"row"} gap={2}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  <Tab label="Inbox" {...a11yProps(0)} />
                  <Tab label="Broadcasting" {...a11yProps(1)} />
                </Tabs>
                <Stack pt={1}>
                  <Input.Search
                    style={{ width: 250 }}
                    placeholder="Search..."
                  />
                </Stack>
              </Stack>
            </AppBar>
            <CustomTabPanel value={value} index={0}>
              <Stack
                height={"100%"}
                sx={{ overflowY: "auto" }}
                direction={"row"}
              >
                <Stack width={400} height={"100%"} sx={{ overflowY: "auto" }}>
                  <List sx={{ height: "100%", overflowY: "auto" }}>
                    {inboxMessages.map((message, i) => {
                      return (
                        <ListItem draggable key={i} divider dense>
                          <ListItemAvatar>
                            <Avatar>
                              <MessageRounded />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemButton>
                            <ListItemText
                              primary={message.subject}
                              secondary={"Short Message..."}
                            ></ListItemText>
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Stack>
                <Stack></Stack>
              </Stack>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <Empty />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              Item Three
            </CustomTabPanel>
          </Box>
        </Stack>
      </Stack>
    </Layout>
  );
};

export default Messages;
