import { Box, Stack } from '@mui/material';
import { Tag } from 'antd';
import React from 'react'
const colors = {
  inprogress: 'yellow',
  negotiation: '#061724',
  planning: '#62ABF5',
  active: 'success',
  published: '#54B054',
  notViable: '#3F1011',
  submitted: '#EAA300',
  finalstage: 'red'
}
const StatusTag = (props) => {
  const { status } = props;
  return <Stack direction={'row'} alignItems={'center'} position={'relative'}>
    <Tag color={colors[status]}  >{status.toUpperCase()}</Tag>
    {status === 'published' && (<Box width={90} height={20}>
      <iframe style={{ width: '100%', height: '100%', border: 'solid 0px', background: 'rgba(0,0,0,0)' }} src="https://lottie.host/embed/d152d186-3db6-4d62-97cf-4cbdddf40f05/EaSvK3C8NM.json"></iframe>
    </Box>)}
  </Stack>
}

export default StatusTag