import { Box, colors, Stack, Typography } from '@mui/material';
import { Tag } from 'antd';
import React from 'react'
import { SystemService } from '../services/systemService';
import { CheckCircle } from '@mui/icons-material';
const _colors = {
  inprogress: colors.yellow[600],
  negotiation: colors.blueGrey[600],
  planning: colors.blue[600],
  active: 'success',
  published: colors.green[600],
  notViable: '#3F1011',
  submitted: '#EAA300',
  contracting: 'red',
  done: ''
}
const TagRender = ({ status }) => {
  return (<Stack direction={'row'} alignItems={'center'} position={'relative'}>
    <Tag color={_colors[status]}  >{status ? status?.toUpperCase() : 'no status'}</Tag>
    {status === 'published' && (<Box width={90} height={20}>
      <iframe style={{ width: '100%', height: '100%', border: 'solid 0px', background: 'rgba(0,0,0,0)' }} src="https://lottie.host/embed/d152d186-3db6-4d62-97cf-4cbdddf40f05/EaSvK3C8NM.json"></iframe>
    </Box>)}
    {status === 'active' && (<Box width={20} height={20}>
      <iframe style={{ width: '100%', height: '100%', border: 'solid 0px', background: 'rgba(0,0,0,0)' }} src="https://lottie.host/embed/4e5aeabb-fa54-4e50-94c9-1259fcf20053/TtyR1VJRVP.json"></iframe>
    </Box>)}
    {status === 'done' && (<Box width={20} height={20}>
      <CheckCircle sx={{ width: '100%', height: '100%', color: colors.green[600] }} />
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