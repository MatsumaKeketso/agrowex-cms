import { Container, Stack, Typography } from '@mui/material'
import { Button, Form, Input, message, Splitter } from 'antd'
import React, { useEffect, useState } from 'react'
import { AuthService } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toggleOnline, updateAuth, updateProfile } from '../services/user/userSlice'
import { Logo } from '../components/Layout'
import { AlternateEmailRounded, EmailRounded, MarkEmailRead, Password } from '@mui/icons-material'
import { ProfileService } from '../services/profileService'

const Signup = () => {
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [signupForm] = Form.useForm()
  const getProfile = (user) => {
    ProfileService.getProfile(user.uid).then((profile) => {
      dispatch(updateProfile(profile))
      dispatch(toggleOnline(true))
      navigate('/offtakes/1')
    }).catch((err) => {
      AuthService.signout().then(() => { messageApi.error('Failed to get profile. Signing out!') })
    })
  }
  useEffect(() => {
    setLoading(true)
    AuthService.getUser().then(user => {
      if (user) {
        dispatch(updateAuth({ uid: user.uid, displayName: user.displayName, email: user.email }));
        setLoading(false)
        getProfile(user)
        navigate('/offtakes/1')
      } else {
        setLoading(false)
      }
    }).catch(err => {
      setLoading(false)
      console.log(err);
    })
  }, [])
  return (
    <Container>
      {contextHolder}
      <Stack px={{ xs: 0, sm: 2, md: 20, lg: 30 }} alignItems={'center'} py={{ xs: 0, sm: 1, md: 3, lg: 5 }}>
        <Form form={signupForm} layout='vertical' onFinish={(v) => {
          AuthService.signup(v.email, v.password).then((user) => {
            console.log(user);
            messageApi.success("Signup success");
            // dispatch(updateAuth({ uid: user.uid, displayName: user.displayName, email: user.email }));
            // getProfile(user)
            navigate("/admin/create/profile")
          }).catch(err => {
            AuthService.signout().then(() => { messageApi.error('Failed to get profile. Signing out!') })
          })
        }}>
          <Stack width={'100%'} py={10} gap={2} alignItems={'center'}>
            <Logo />
            <Typography variant="h3">Sign Up</Typography>
            <Typography textAlign={'center'} variant="body2">Welcome to Agrowex</Typography>
            <Stack>
              <Form.Item label="Email" name="email" rules={[{ required: true }, { type: 'email' }]}>
                <Input prefix={<AlternateEmailRounded />} inputMode='email' size='large' />
              </Form.Item>
              <Form.Item label="Password" name="password" rules={[{ required: true }, { min: 5 }]}>
                <Input.Password prefix={<Password />} size='large' />
              </Form.Item>
              <Stack gap={2}>
                <Button loading={loading} style={{ width: '100%' }} htmlType='submit' type='primary'>Sign Up</Button>
                <Button style={{ width: '100%' }} type='text' onClick={() => {
                  navigate('/')
                }}>Sign In</Button>
              </Stack>

            </Stack>
          </Stack>
        </Form>
      </Stack>
    </Container>
  )
}

export default Signup