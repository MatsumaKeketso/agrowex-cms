import { Stack, Typography } from '@mui/material'
import { Avatar, Button } from 'antd'
import React from 'react'

const Persona = ({ user }) => {
    return (
        <Stack direction={'row'} gap={2}>
            <Avatar size={'large'} src={user.profilePicture} />
            <Stack>
                <Typography variant='subtitle1'>{user.name}</Typography>
                <Typography variant='overline'>PM | {user.department}</Typography>
                <Button type='default' size='small'>Unasign</Button>
            </Stack>
        </Stack>
    )
}

export default Persona