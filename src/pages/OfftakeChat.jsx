import React, { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import { AppBar, Box, colors, Grid, IconButton, Paper, Stack, styled, Toolbar, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { ChatItem, MeetingMessage, MessageBox } from 'react-chat-elements'
import { OfftakeService } from '../db/offtake-service'
import OfftakeDetails from '../components/OfftakeDetails'
import { ArrowDownward, AttachFile, Call, ChatBubble } from '@mui/icons-material'
import { Breadcrumb, Button, Drawer, Empty, Form, Input, Modal, Popconfirm } from 'antd'
import ChatMessage from '../components/ChatMessage'
import { AuthService, firestoreDB, realtimeDB } from '../services/authService'
import { doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { ChatService, convertTimestampToDateString, createCurrentTimestamp } from '../services/chatService'
import { useSelector } from 'react-redux'
import { onValue, ref } from 'firebase/database'
import StatusTag from '../components/StatusTag'


const OfftakeChat = () => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [messageType, setMessageType] = useState("text")
  const [planning, setPlanning] = useState(false);
  const [offtakeBackup, setOfftakeBackup] = useState({})
  const { offtake_id } = useParams()
  const [chatform] = Form.useForm()
  const chatEndRef = useRef(null);
  const navigate = useNavigate()
  const { uid } = useSelector((state) => state?.user.profile || {})
  const offtake = useSelector((state) => state?.offtake || {})
  const sendMessage = (data) => {
    AuthService.getUser().then(user => {
      const oM = { ...data, timestamp: createCurrentTimestamp(), status: 'sent', sender: user.uid }
      setLoading(false)
      ChatService.sendMessage(oM, offtake_id).then(res => {

        console.log(res);
        setLoading(false)
        chatform.resetFields()
        return
        ChatService.getMessages(offtake_id).then((data) => {
          setMessages(data)
        })
      })
    })

  }
  const scrollToBottom = () => {
    try {
      chatEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.log(error);
    }
  };
  const uploadFile = () => {

  }

  useEffect(() => {
    setLoading(true)
    OfftakeService.getOfftake(offtake_id).then(o => {
      if (o) {
        setOfftakeBackup(o)
      }
    })
    const negotiationsRef = ref(realtimeDB, `negotiations/${offtake_id}/`);
    onValue(negotiationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let m = [];
        Object.keys(data).forEach(key => {
          let r_data = {
            id: key,
            ...data[key],
            timestamp: convertTimestampToDateString(data[key].timestamp)
          };
          m.push(r_data)
          scrollToBottom()
        })
        setMessages(m);
        setLoading(false);
      } else {
        setLoading(false);
      }

    });
  }, [])
  return (
    <Layout scroll={false}>
      <Modal open={planning} title="Begin Planning" onOk={() => {
        // return
        AuthService.getUser().then(user => {
          OfftakeService.getOfftake(offtake_id).then(offtake => {
            OfftakeService.updateOfftake(offtake_id, { ...offtake, schedule: {}, status: 'planning' }).then(() => {
              navigate(`/offtakes/${offtake_id}/schedule`)
            })
          })
        })

      }} onCancel={() => {
        setPlanning(false)
      }}>
        <Stack justifyContent={'center'} alignItems={'center'} gap={4}>
          <Typography variant='h4'>Begin Planning</Typography>
          <Stack gap={2} alignItems={'center'}>
            <Stack sx={{ opacity: 0.3 }} direction={'row'} gap={1}>
              <Typography>{offtake_id}</Typography>
              <StatusTag status="negotiation"></StatusTag>
            </Stack>
            <ArrowDownward />
            <Stack direction={'row'} gap={1}>
              <Typography>{offtake_id}</Typography>
              <StatusTag status="planning"></StatusTag>
            </Stack>
          </Stack>
          <Typography>This offtake will be put into planning, continue?</Typography>
        </Stack>
      </Modal>
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
                {offtakeBackup?.status !== 'planning' && (
                  <Button type='primary' size='large' type='text' color={colors.lightGreen[700]} onClick={() => {
                    setPlanning(true)
                  }}>Begin Planning</Button>
                )}
                {offtakeBackup?.status === 'planning' && (
                  <Button size='large' type='text' color={colors.lightGreen[700]} onClick={() => {
                    navigate(`/offtakes/${offtake_id}/schedule`)
                  }}>Production Planning</Button>
                )}
              </Stack>
            </Toolbar>
          </AppBar>
          <Stack flex={1} gap={2} p={1} sx={{ overflowY: 'auto', }}>
            {messages.length === 0 && (<Empty description="No Messages..."></Empty>)}
            {messages.map((message) => {
              const { id, status, timestamp, sender, content } = message
              return (
                <>
                  <ChatMessage status={status} time={timestamp} url={""} type={content.type} sender={sender === uid ? true : false} key={id} text={content.data} />
                  <ChatMessage type={'update_log'} time={timestamp} url={""} sender={sender === uid ? true : false} key={id} text={content.data} />
                </>
              )
            })}

            <div ref={chatEndRef} />
          </Stack>

          <Stack direction={'row'} gap={1} p={1} >
            <Form form={chatform} onFinish={(values) => {
              sendMessage({
                content: { ...values, type: messageType }
              });
            }} style={{ width: '100%' }}>
              <Stack flex={1} direction={'row'} gap={1}>
                <Stack flex={1} px={1} sx={{ maxHeight: 150, overflowY: 'auto' }}>
                  <Form.Item style={{ width: '100%' }} name="data" rules={[{ required: true, message: 'Please type in message.' }]}>
                    <Input.TextArea autoSize rows={1} size='large' />
                  </Form.Item>
                </Stack>
                <Button size='large' icon={<AttachFile />}></Button>
                <Button disabled={loading} htmlType='submit' type='primary' size='large'>Send</Button>
              </Stack>
            </Form>
          </Stack>


        </Stack>
      </Stack>

    </Layout >
  )
}

export default OfftakeChat