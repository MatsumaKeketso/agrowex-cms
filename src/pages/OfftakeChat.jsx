import React, { useEffect } from 'react'
import Layout from '../components/Layout'
import { AppBar, Box, colors, Grid, IconButton, Paper, Stack, styled, Toolbar, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { ChatItem, MeetingMessage, MessageBox } from 'react-chat-elements'
import { OfftakeService } from '../db/offtake-service'
import OfftakeDetails from '../components/OfftakeDetails'
import { Call, ChatBubble } from '@mui/icons-material'
import { Breadcrumb, Button, Drawer, Empty, Form, Input, Popconfirm } from 'antd'
import ChatMessage from '../components/ChatMessage'

const OfftakeChat = () => {
  const { offtake_id } = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    OfftakeService.getOfftake(offtake_id).then((oftake) => {
      console.log('====================================');
      console.log(oftake);
      console.log('====================================');
    })
  }, [])
  return (
    <Layout scroll={false}>
      <Stack gap={2} sx={{ overflow: 'auto' }} flex={1} direction={'row'} position={'relative'} >
        <Stack flex={1} p={3} sx={{ overflow: 'auto' }} position={'relative'} >
          <OfftakeDetails setOfftakeId={() => { }} />
        </Stack>
        {/* <Stack flex={1.5}></Stack> */}
        <Stack flex={1} overflow={'hidden'}  >
          <AppBar sx={{ zIndex: 22 }} color='transparent' elevation={1} position='sticky' variant='elevation'>
            <Toolbar >
              <Stack flex={1} gap={2} direction={'row'} alignItems={'center'}>
                <Stack flex={1} color={'white'}>
                  <Typography color={colors.blueGrey[900]}>Negotiation</Typography>

                </Stack>
                <Popconfirm title="Not Viable" description="Mark this offtake as non viable, meaning we cannot accommodate this request, proceed?" onConfirm={() => {

                }}>
                  <Button type='text' danger>Not Viable</Button>
                </Popconfirm>
                <Button icon={<Call />} size='large'></Button>
                <Button size='large' type='primary'>Production Plan</Button>
              </Stack>
            </Toolbar>
          </AppBar>
          <Stack flex={1} gap={2} p={1} sx={{ overflowY: 'auto', }}>
            <Empty description="No Messages..."></Empty>

            <ChatMessage sender={true} text={"Hi Samuel, my name is John! I hope you're doing well. I wanted to discuss the recent offtake flow for our contract with GreenGrocers Co. Are you available to go over the details?"} />
            <ChatMessage sender={false} text={"Hi John! Yes, I'm available. Let's go over it. What do you need to discuss?"} />
            <ChatMessage sender={true} text={"Great! So, as you know, the offtake flow for GreenGrocers Co. is part of our On Demand Supply contract, which started on March 10th and was completed on June 10th. I wanted to review the key highlights and action items to ensure we captured all the necessary details for future reference."} />
            <ChatMessage sender={false} text={"That sounds good. Could you remind me of the key highlights from this offtake flow?"} />
            <ChatMessage sender={true} text={"Sure! Here are the key highlights: \nContract Type: On Demand Supply. Contract Duration:March 10th, 2024 to June 10th, 2024. Status: Completed. Total Quantity Delivered: 500 metric tons of fresh produce. Delivery Schedule: Weekly deliveries, each comprising approximately 50 metric tons. Quality Checks: Passed all inspections with an average quality score of 95%."} />
          </Stack>

          <Stack direction={'row'} gap={1} p={1} >
            <Form style={{ width: '100%' }}>
              <Stack flex={1} direction={'row'} gap={1}>
                <Form.Item style={{ width: '100%' }} name="text" rules={[{ required: true }]}>
                  <Input size='large' />
                </Form.Item>
                <Button htmlType='submit' type='primary' size='large'>Send</Button>
              </Stack>
            </Form>
          </Stack>


        </Stack>
      </Stack>

    </Layout>
  )
}

export default OfftakeChat