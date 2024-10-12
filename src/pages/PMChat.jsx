import React, { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import { AppBar, colors, Stack, Toolbar, Typography } from '@mui/material'
import OfftakeDetails from '../components/OfftakeDetails'
import { Button, Empty, Form, Input, Popconfirm } from 'antd'
import { AttachFile, Call } from '@mui/icons-material'
import { onValue, ref } from 'firebase/database'
import { useParams } from 'react-router-dom'
import { AuthService, realtimeDB } from '../services/authService'
import ChatMessage from '../components/ChatMessage'
import { useDispatch, useSelector } from 'react-redux'
import { OfftakeService } from '../services/offtakeService'
import { ChatService, convertTimestampToDateString, createCurrentTimestamp } from '../services/chatService'
import { setPublishState } from '../services/offtake/offtakeSlice'
import { SystemService } from '../services/systemService'

// Overview
// Comminucation between OM and PM during offtake in submitted stage going to published
const PMChat = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [messageType, setMessageType] = useState("text")
  const chatEndRef = useRef(null);
  const [chatform] = Form.useForm()
  const { offtake_id } = useParams()
  const dispatch = useDispatch();
  const profile = useSelector((state) => state?.user.profile || {})
  const sendMessage = (data) => {
    AuthService.getUser().then(user => {
      const oM = { ...data, timestamp: SystemService.generateTimestamp(), status: 'sent', sender: user.uid }
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
  const listenForChatMessages = () => {
    const chatRef = ref(realtimeDB, `chat/${offtake_id}`);
    onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(data);

        let m = [];
        Object.keys(data).forEach(key => {
          let r_data = {
            id: key,
            ...data[key],
            timestamp: convertTimestampToDateString(data[key].timestamp)
          };

          m.push(r_data)
        })
        scrollToBottom()
        setMessages(m);
        setLoading(false);
      }

    });
  }
  useEffect(() => {
    listenForChatMessages()
  }, [])
  return (
    <Layout>
      <Stack gap={2} sx={{ overflow: 'auto' }} flex={1} direction={'row'} position={'relative'} >
        <Stack flex={1} p={3} sx={{ overflow: 'auto' }} position={'relative'}>
          <OfftakeDetails setOfftakeId={() => { }} />
        </Stack>
        <Stack flex={1} overflow={'hidden'} >
          <AppBar sx={{ zIndex: 22 }} color='transparent' elevation={1} position='sticky' variant='elevation'>
            <Toolbar >
              <Stack flex={1} gap={2} direction={'row'} alignItems={'center'}>
                <Stack flex={1} color={'white'}>
                  <Typography color={colors.blueGrey[900]}>Communication</Typography>
                </Stack>
                <Popconfirm title="Not Viable" description="Mark this offtake as non viable, meaning we cannot accommodate this request, proceed?" onConfirm={() => {

                }}>
                  <Button type='text' danger>Not Viable</Button>
                </Popconfirm>
                <Button icon={<Call />} size='large'></Button>
                <Button type='primary' size='large' onClick={() => {
                  dispatch(setPublishState(true))
                }}>Publish Offtake</Button>
              </Stack>
            </Toolbar>
          </AppBar>
          <Stack flex={1} gap={2} p={1} sx={{ overflowY: 'auto', }}>
            {messages.length === 0 && (
              <Stack flex={1} alignItems={'center'} py={20}>
                <Empty description="No Messages" />
              </Stack>
            )}
            {messages.map((message) => {
              console.log(message);

              const { id, status, timestamp, sender, data, type } = message
              return (
                <>
                  <ChatMessage status={status} time={timestamp} url={""} type={type} sender={sender === profile.uid ? true : false} key={id} text={data} />
                  <ChatMessage status={null} type={'update_log'} time={timestamp} url={""} sender={sender === profile.uid ? true : false} key={id} text={data} />
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
              return
              AuthService.getUser().then(user => {
                if (user) {
                  const content = { ...values, type: messageType, status: 'sent', sender: user.uid, timestamp: createCurrentTimestamp() }
                  OfftakeService.sendOMMessage(offtake_id, content).then(res => {
                    console.log(res);
                  }).catch(err => {
                    console.log(err);
                  })
                }
              })

            }} style={{ width: '100%' }}>
              <Stack flex={1} direction={'row'} gap={1}>
                <Stack flex={1} px={1} sx={{ maxHeight: 150, overflowY: 'auto' }}>
                  <Form.Item style={{ width: '100%' }} name="data" rules={[{ required: true, message: 'Please type in message.' }]}>
                    <Input.TextArea placeholder='Send message...' autoSize rows={1} size='large' />
                  </Form.Item>
                </Stack>
                <Button size='large' icon={<AttachFile />}></Button>
                <Button disabled={loading} htmlType='submit' type='primary' size='large'>Send</Button>
              </Stack>
            </Form>
          </Stack>
        </Stack>
      </Stack>
    </Layout>
  )
}

export default PMChat