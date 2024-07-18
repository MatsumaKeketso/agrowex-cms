import { Container, Stack } from '@mui/material'
import { Button, Form, Input } from 'antd'
import React from 'react'

const Signin = () => {
  return (
    <Container>
      <Stack alignItems={'center'}>
        <Form>
          <Form.Item label="Email" name="email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Button>Sign In</Button>
        </Form>
      </Stack>
    </Container>
  )
}

export default Signin