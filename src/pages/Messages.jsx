import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
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
import { Empty, Input, Typography as ANTTypography, Spin, Drawer } from "antd";
import { MessageService } from "../services/messageService";
const MessageList = ({ onSelect }) => {
  const [messages, setMessages] = useState([])
  useEffect(() => {
    MessageService.getMessages().then((messages: any) => {
      setMessages(messages)
    })
  }, [])

  return (
    <Stack>
      {/* <Input.Search placeholder="Search..." /> */}
      {messages.length === 0 && (<Stack py={5}>
        <Spin size="large" />
      </Stack>)}
      <List sx={{ height: "100%", overflowY: "auto" }}>
        {messages.map((message: any, i) => {
          return (
            <ListItem
              draggable
              key={i}
              divider
              disablePadding
              dense
            >
              <ListItemButton onClick={() => {
                onSelect(message)
              }}>
                <ListItemAvatar>
                  <Avatar>
                    <MessageRounded />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%'
                  }}
                  primary={message.subject}
                  secondary={message.message}
                ></ListItemText>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  )
}
const Messages = () => {
  const [openMessageDrawer, setOpenMessageDrawer] = useState(false)
  const [value, setValue] = React.useState(0);
  const [activeMessage, setActiveMessage] = useState({})
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Layout scroll={false}>
      <Drawer placement="left" title="Messages" open={openMessageDrawer}>
        <MessageList onSelect={(message) => {
          setActiveMessage(message)
          setOpenMessageDrawer(false)
        }} />
      </Drawer>
      <Stack sx={{ overflow: 'hidden' }} gap={1} height={"100%"}>
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
          <Box sx={{ width: "100%" }} height={'100%'}>
            <AppBar
              color="inherit"
              elevation={0}
              position="sticky"
              sx={{ borderBottom: 1, borderColor: "divider", zIndex: 5 }}
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
                // position={'relative'}
                sx={{ overflow: 'hidden' }}
                direction={"row"}
              >
                <Stack sx={{ display: { sm: 'flex', md: 'none' } }}>
                  <IconButton onClick={() => {
                    setOpenMessageDrawer(true)
                  }}>
                    <MessageRounded />
                  </IconButton>
                </Stack>
                <Stack maxWidth={400} minWidth={350} maxHeight={"100%"} sx={{ overflowY: "auto", display: { sm: 'none', md: 'flex' } }}>
                  <MessageList onSelect={(message) => {
                    setActiveMessage(message)
                  }} />
                </Stack>
                <Divider orientation="vertical" flexItem />
                <Stack flex={1} >
                  <Stack alignSelf={'flex-start'} sx={{ overflowY: "auto", position: 'sticky' }} p={2} maxHeight={'100%'}>
                    <ANTTypography.Title level={5}>{activeMessage?.message}</ANTTypography.Title>
                    <ANTTypography.Title level={4}>{activeMessage?.subject}</ANTTypography.Title>
                  </Stack>
                </Stack>
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
    </Layout >
  );
};

export default Messages;
