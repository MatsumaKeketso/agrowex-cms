import React, { useState } from 'react'
import { Check } from '@mui/icons-material';
import { Box, colors, Stack, Typography } from '@mui/material'
import { SystemService } from '../services/systemService';
import Documents from './Documents';
import { useSelector } from 'react-redux';
import { OfftakeService } from '../services/offtakeService';
import { Spin } from 'antd';

const ChatMessage = ({ status, text, time, sender, type = "text", url }) => {
  const [attachment, setAttachment] = useState(null)
  const offtake = useSelector(state => state.offtake.active)
  const style = {
    time: {
      color: colors.grey[400],
      sent: colors.common.white,
      read: colors.blue[400]
    }
  }
  switch (type) {
    case 'update_log':
      return (<Stack p={1} borderRadius={2} bgcolor={colors.blue[50]} >
        <Typography variant='caption' color={colors.blue[900]} textAlign={'center'}>An update has been done to something</Typography>
        <Typography color={style.time.color} textAlign="center" variant='caption'>{SystemService.formatTimestamp(time)}</Typography>
      </Stack>)
      break;
    case 'file':
      OfftakeService.getSingleDocument(offtake.offtake_id, text).then(document => {
        console.log(document);
        setAttachment(document)

      })
      return (
        <Stack position={'relative'} alignSelf={'flex-end'} pb={2} ml={sender ? '30%' : 0} mr={!sender ? '30%' : 0} bgcolor={sender ? colors.green[600] : colors.grey[100]} borderRadius={3} p={1}>
          {/* <Typography variant='body2' sx={{ color: sender ? colors.grey[100] : colors.green[800] }}>{text}</Typography> */}
          {attachment ? (<Documents url={attachment?.file_url} name={attachment?.name} />) : (
            <Stack minWidth={183} height={258} alignItems={'center'} justifyContent={'center'} borderRadius={3} bgcolor={'white'}>
              <Spin />
            </Stack>
          )}

          <Box pr={1} sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            gap: 2,
            color: style.time.color
          }}>
            <Typography variant='caption'>{SystemService.formatTimestamp(time)}</Typography>
            <Check sx={{
              color: style.time[status],
              width: 14, height: 14
            }} />
          </Box>
        </Stack >
      )
      break;
    case "text":
      return (
        <Stack position={'relative'} ml={sender ? '30%' : 0} mr={!sender ? '30%' : 0} bgcolor={sender ? colors.green[600] : colors.grey[100]} borderRadius={3} p={2}>
          <Typography variant='body2' sx={{ color: sender ? colors.grey[100] : colors.green[800] }}>{text}</Typography>
          <Box pr={1} sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            gap: 2,
            color: style.time.color
          }}>
            <Typography variant='caption'>{SystemService.formatTimestamp(time)}</Typography>
            <Check sx={{
              color: style.time[status],
              width: 14, height: 14
            }} />
          </Box>
        </Stack >
      )
    default:
      break;
  }
}

export default ChatMessage