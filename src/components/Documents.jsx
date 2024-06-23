import { InboxOutlined } from '@mui/icons-material';
import { IconButton, Stack, Typography } from '@mui/material'
import { Image, Upload } from 'antd'
import React from 'react'
const { Dragger } = Upload;
function Documents({ upload }) {
    return (
        <Stack overflow={'hidden'} borderRadius={2} >
            {upload ? (
                <Dragger style={{ maxWidth: 225, height: 176, objectFit: 'cover' }} >
                    <IconButton disabled>
                        <InboxOutlined />
                    </IconButton>
                    <Typography variant='subtitle2' >Document Upload</Typography>
                    <Typography variant='caption' >
                        Support for a single upload. Strictly prohibited from uploading company data or other
                        banned files.
                    </Typography>
                </Dragger>
            ) : (
                <Image src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    style={{ minWidth: 125, maxWidth: 125, height: 176, objectFit: 'cover' }} />
            )}

        </Stack>
    )
}

export default Documents