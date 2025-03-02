import { Container, Stack, Typography } from '@mui/material'
import { Button, Form, Input, message, Spin, Splitter } from 'antd'
import React, { useEffect, useState } from 'react'
import { AuthService, firestoreDB } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toggleOnline, updateAuth, updateProfile } from '../services/user/userSlice'
import { Logo } from '../components/Layout'
import { AlternateEmailRounded, EmailRounded, MarkEmailRead, Password } from '@mui/icons-material'
import { ProfileService } from '../services/profileService'
import { doc, onSnapshot } from 'firebase/firestore'

const AdminPending = () => {
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const getProfile = (user) => {
    const unsub = onSnapshot(doc(firestoreDB, "agents", user.uid), (profile) => {
      if (profile.data().approved) {
        console.log("Current data: ", profile.data());
        navigate('/offtakes/1')
        dispatch(updateProfile(profile.data()))
        dispatch(toggleOnline(true))
        setLoading(false)
        unsub()
      }
    }, (err) => {
      console.log(err);
      AuthService.signout().then(() => { messageApi.error('⚠⚠⚠ Failed to get profile. Signing out!') })
      unsub()
      navigate('/')
      dispatch(updateProfile({}))
      dispatch(toggleOnline(false))
    })
  }
  useEffect(() => {
    setLoading(true)
    AuthService.getUser().then(user => {
      if (user) {
        dispatch(updateAuth({ uid: user.uid, displayName: user.displayName, email: user.email }));

        getProfile(user)
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
        <Stack width={'100%'} py={10} gap={2} alignItems={'center'}>
          <Logo />
          <Typography variant="h3">Profile Pending Approval</Typography>
          <Typography textAlign={'center'} variant="body2">Please wait until your profile gets approved by the admin</Typography>
          <Spin size='large' />
        </Stack>
      </Stack>
    </Container>
  )
}

export default AdminPending