import { InboxOutlined, RemoveRedEyeRounded } from '@mui/icons-material';
import { Backdrop, colors, IconButton, Stack, Typography } from '@mui/material'
import { Image, Upload } from 'antd'
import React, { useState } from 'react'
const { Dragger } = Upload;
function Documents({ upload, url, type, name }) {
    const [preview, setPreview] = useState(false);
    const [hover, setHover] = useState(false)

    return (
        <Stack>
            <Backdrop sx={{ zIndex: 99, }} onClick={() => {
                setPreview(false)
            }} open={preview}>
                <Stack width={'70vw'} height={'80vh'} overflow={'hidden'} p={1} borderRadius={1} bgcolor={colors.common.white}>
                    <iframe title='Title heer' style={{ minWidth: '100%', height: '100%', border: 'solid 0px' }} src={url} />
                </Stack>
            </Backdrop>
            <Stack minWidth={183} maxWidth={183} overflow={'hidden'} borderRadius={2} >

                {upload ? (
                    <Dragger style={{ maxWidth: 225, height: 276, objectFit: 'cover' }} >
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
                    // <Image src={url}
                    //      style={{ minWidth: '100%', height: 176, objectFit: 'cover' }} />
                    <Stack position={'relative'} onMouseEnter={() => {
                        setHover(true)
                    }} onMouseLeave={() => {
                        setHover(false)
                    }} >
                        <Backdrop sx={{
                            position: 'absolute', // Position relative to the Stack
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: (theme) => theme.zIndex.drawer + 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
                        }} open={hover}>
                            <Stack>
                                <IconButton onClick={() => {
                                    setPreview(true)
                                }}><RemoveRedEyeRounded sx={{ color: colors.common.white }} /></IconButton>
                            </Stack>
                        </Backdrop>
                        <iframe style={{ minWidth: '100%', height: 258, objectFit: 'cover', border: 'solid 0px', overflow: 'hidden' }} src={url} />
                    </Stack>
                )
                }

            </Stack >
        </Stack>

    )
}

export default Documents