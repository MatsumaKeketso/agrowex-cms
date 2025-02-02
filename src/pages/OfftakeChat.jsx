import React, { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import { AppBar, Box, colors, Grid, IconButton, Paper, Stack, styled, Toolbar, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { ChatItem, MeetingMessage, MessageBox } from 'react-chat-elements'
import { OfftakeService } from '../services/offtakeService'
import OfftakeDetails from '../components/OfftakeDetails'
import { ArrowDownward, AttachFile, Call, ChatBubble } from '@mui/icons-material'
import { Breadcrumb, Button, Drawer, Empty, Form, Input, Modal, Popconfirm, Progress, Spin, Upload } from 'antd'
import ChatMessage from '../components/ChatMessage'
import { AuthService, firestoreDB, realtimeDB } from '../services/authService'
import { doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { ChatService, convertTimestampToDateString, createCurrentTimestamp } from '../services/chatService'
import { useDispatch, useSelector } from 'react-redux'
import { onValue, ref } from 'firebase/database'
import StatusTag from '../components/StatusTag'
import { storage, SystemService } from '../services/systemService'
import { getDownloadURL, uploadBytesResumable, ref as sRef } from 'firebase/storage'
import { setActiveOfftake } from '../services/offtake/offtakeSlice'


const OfftakeChat = () => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [messageType, setMessageType] = useState("text")
  const [planning, setPlanning] = useState(false);
  const [offtakeBackup, setOfftakeBackup] = useState({})
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const { offtake_id } = useParams()
  const [chatform] = Form.useForm()
  const chatEndRef = useRef(null);
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { uid } = useSelector((state) => state?.user.profile || {})
  const offtake = useSelector((state) => state?.offtake.active || {})
  const sendMessage = (data) => {
    AuthService.getUser().then(user => {
      const oM = {
        ...data,
        timestamp: SystemService.generateTimestamp(),
        status: 'sent',
        sender: user.uid,
        internal: true
      }

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
  const uploadFile = (path, fileObject) => {
    setLoading(true)
    setUploading(true)
    const metadata = {
      contentType: fileObject.type
    };
    console.log(`cms-documents/${path}/${fileObject.name}`);

    const storageRef = sRef(storage, `cms-documents/${path}${fileObject.name}`);

    if (!uploading) {
      const uploadTask = uploadBytesResumable(storageRef, fileObject, metadata);

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on('state_changed',
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress((progress * 1).toFixed(2))
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log('====================================');
          console.log(error);
          console.log('====================================');
          // A full list of error codes is available at
          switch (error.code) {

            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break;
            case 'storage/canceled':
              // User canceled the upload
              break;
            case 'storage/unknown':
              // Unknown error occurred, inspect error.serverResponse
              break;
            default:
              break;

          }
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const document = {
              name: fileObject.name,
              created_at: SystemService.generateTimestamp(),
              file_url: downloadURL
            }
            OfftakeService.addDocument(offtake.offtake_id, document).then(doc_id => {
              const _message = { content: { data: doc_id, type: "file" } }
              sendMessage(_message)
              setUploading(false)
            })
          });
        }
      );
    }

  }
  const props = {
    name: 'file',
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      const { originFileObj } = info.file;
      uploadFile(`chat_attachments/${offtake.offtake_id}`, originFileObj)
    },
  };
  useEffect(() => {
    setLoading(true)
    OfftakeService.getOfftake(offtake_id).then(o => {
      if (o) {
        dispatch(setActiveOfftake(o))
        setOfftakeBackup(o)
      }
    })
    const negotiationsRef = ref(realtimeDB, `chat/${offtake_id}/`);
    onValue(negotiationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let m = [];
        Object.keys(data).forEach(key => {
          let r_data = {
            id: key,
            ...data[key],
            timestamp: SystemService.formatTimestamp(data[key].timestamp)
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

      {/* Begin Planning */}
      <Modal open={planning} onOk={() => {
        // return
        const _status = {
          status_name: "planning",
          updated_at: SystemService.generateTimestamp()
        }
        var updated_status = [...offtake.status, _status]

        AuthService.getUser().then(user => {
          OfftakeService.getOfftake(offtake_id).then(offtake => {
            OfftakeService.updateOfftake(offtake_id, { ...offtake, schedule: {}, status: updated_status }).then(() => {
              navigate(`/offtakes/${offtake_id}/schedule`)
            })
          })
        })

      }} onCancel={() => {
        setPlanning(false)
      }}>
        <Stack pt={5} justifyContent={'center'} alignItems={'center'} gap={4}>
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
        <Stack flex={2} px={3} sx={{ overflow: 'auto' }} position={'relative'} >
          <OfftakeDetails setOfftakeId={() => { }} />
        </Stack>
        <Stack flex={1} overflow={'hidden'}  >
          <AppBar sx={{ zIndex: 22 }} color='transparent' elevation={1} position='sticky' variant='elevation'>
            <Toolbar >
              <Stack flex={1} gap={2} direction={'row'} alignItems={'center'}>
                <Stack flex={1} color={'white'}>
                  <Typography color={colors.blueGrey[900]}>Chat</Typography>
                </Stack>
                <Popconfirm title="Not Viable" description="Mark this offtake as non viable, meaning we cannot accommodate this request, proceed?" onConfirm={() => {

                }}>
                  <Button type='text' danger>Not Viable</Button>
                </Popconfirm>
                <Button icon={<Call />} size='large'></Button>

                {OfftakeService.getStatus.Name(offtakeBackup?.status) === 'planning' && (
                  <Button size='large' type='text' color={colors.lightGreen[700]} onClick={() => {
                    navigate(`/offtakes/${offtake_id}/schedule`)
                  }}>Production Planning</Button>
                )}
                {
                  OfftakeService.getStatus.Name(offtakeBackup?.status) === 'negotiation'
                  && (
                    <Button type='primary' color={colors.lightGreen[700]} onClick={() => {
                      setPlanning(true)
                    }}>Begin Planning</Button>
                  )}
              </Stack>
            </Toolbar>
          </AppBar>
          <Stack flex={1} gap={2} p={1} sx={{ overflowY: 'auto', }}>
            {messages.length === 0 && (<Empty description="No Messages..."></Empty>)}
            {messages.map((message) => {
              const { id, status, timestamp, sender, content } = message
              console.log(message);

              return (
                <>
                  <ChatMessage status={status} time={timestamp} url={""} type={content.type} sender={sender === uid ? true : false} key={id} text={content.data} />
                  {/* <ChatMessage type={'update_log'} time={timestamp} url={""} sender={sender === uid ? true : false} key={id} text={content.data} /> */}
                </>
              )
            })}

            <div ref={chatEndRef} />
          </Stack>
          {uploading && (
            <Stack direction={'row'} gap={1} p={1} alignItems={'center'}>
              <Stack direction={'row'}>
                <Spin size='small' />
                <Typography>Uploading</Typography>
              </Stack>
              <Progress percent={progress} />
            </Stack>
          )}
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
                <Upload multiple={false} showUploadList={false} accept=".pdf" maxCount={1} {...props}>
                  <Button size='large' icon={<AttachFile />}></Button>
                </Upload>

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