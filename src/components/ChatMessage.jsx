import { colors, Stack, Typography } from '@mui/material'
import React from 'react'

const ChatMessage = ({ text, time, sender, type = "text" }) => {
  switch (type) {
    case 'file':

      break;
    case "text":
      return (
        <Stack ml={sender ? '30%' : 0} mr={!sender ? '30%' : 0} bgcolor={sender ? colors.green[600] : colors.grey[100]} borderRadius={3} p={2}>
          <Typography variant='body2' sx={{ color: sender ? colors.grey[100] : colors.green[800] }}>{text}</Typography>
        </Stack >
      )
    default:
      break;
  }
}

export default ChatMessage