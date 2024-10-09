import { Box, Stack, Typography } from '@mui/material';
import { Tag } from 'antd';
import React from 'react'
import { SystemService } from '../services/systemService';
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
const TagRender = ({ status }) => {
  return (<Stack direction={'row'} alignItems={'center'} position={'relative'}>
    <Tag color={colors[status]}  >{status ? status?.toUpperCase() : 'no status'}</Tag>
    {status === 'published' && (<Box width={90} height={20}>
      <iframe style={{ width: '100%', height: '100%', border: 'solid 0px', background: 'rgba(0,0,0,0)' }} src="https://lottie.host/embed/d152d186-3db6-4d62-97cf-4cbdddf40f05/EaSvK3C8NM.json"></iframe>
    </Box>)}
  </Stack>)
}
const StatusTag = (props) => {
  const { status } = props;
  // handling the different status structures
  if (typeof status === 'string') {
    // deprecated
    return <TagRender status={status} />
  } else {
    // new
    const currentStatus = status[status.length - 1].status_name
    const updatedAt = SystemService.formatTimestamp(status[status.length - 1].updated_at)
    return (
      <Stack gap={1}>
        <TagRender status={currentStatus} />
        <Typography variant='caption'>Updated at - {updatedAt}</Typography>
      </Stack>
    )
  }
}

export default StatusTag