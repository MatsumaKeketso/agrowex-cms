import { Container, Stack, Typography } from '@mui/material'
import { Button, Form, Input, message } from 'antd'
import React from 'react'
import { AuthService } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toggleOnline, updateAuth, updateProfile } from '../services/user/userSlice'
import { Logo } from '../components/Layout'
import { AlternateEmailRounded, EmailRounded, MarkEmailRead, Password } from '@mui/icons-material'
import { ProfileService } from '../services/profileService'

const Signin = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate()
  const dispatch = useDispatch()
  return (
    <Container>
      {contextHolder}
      <Stack px={{ xs: 0, sm: 2, md: 20, lg: 30 }} alignItems={'center'} py={{ xs: 0, sm: 1, md: 3, lg: 5 }}>
        <Form layout='vertical' onFinish={(v) => {
          AuthService.signin(v.email, v.password).then((user) => {
            console.log(user);

            messageApi.success("Signin success. Welcome Back ☺️");
            dispatch(updateAuth({ uid: user.uid, displayName: user.displayName, email: user.email }));
            ProfileService.getProfile(user.uid).then((profile) => {
              console.log('====================================');
              console.log(profile);
              console.log('====================================');
              dispatch(updateProfile(profile))
              dispatch(toggleOnline(true))
              navigate('/offtakes')
            }).catch((err) => {
              AuthService.signout().then(() => { messageApi.error('Failed to get profile. Signing out!') })
            })
          }).catch(err => {
            console.log('====================================');
            console.log(err);
            console.log('====================================');
            AuthService.signout().then(() => { messageApi.error('Failed to get profile. Signing out!') })
          })
        }}>
          <Stack width={'100%'} py={10} gap={2} alignItems={'center'}>
            <Logo />
            <Typography variant="h3">Sign In</Typography>
            <Typography textAlign={'center'} variant="body2">Welcome Back</Typography>
            <Stack>
              <Form.Item label="Email" name="email" rules={[{ required: true }, { type: 'email' }]}>
                <Input prefix={<AlternateEmailRounded />} inputMode='email' size='large' />
              </Form.Item>
              <Form.Item label="Password" name="password" rules={[{ required: true }, { min: 5 }]}>
                <Input.Password prefix={<Password />} size='large' />
              </Form.Item>
              <Button style={{ width: '100%' }} htmlType='submit' type='primary'>Sign In</Button>
            </Stack>
          </Stack>
        </Form>
      </Stack>
    </Container>
  )
}

export default Signin