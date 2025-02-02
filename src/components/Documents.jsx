import { AttachFile, Attachment, InboxOutlined, RemoveRedEyeRounded } from '@mui/icons-material';
import { Backdrop, colors, IconButton, Stack, Typography } from '@mui/material'
import { Button, Card, Image, Upload } from 'antd'
import React, { useState } from 'react'
const { Dragger } = Upload;
function Documents({ upload, url, type = "preview", name }) {
    const [preview, setPreview] = useState(false);
    const [hover, setHover] = useState(false)

    return (
        <Stack>
            <Backdrop sx={{ zIndex: (theme) => theme.zIndex.drawer + 2, }} onClick={() => {
                setPreview(false)
            }} open={preview}>
                <Stack width={'70vw'} height={'80vh'} overflow={'hidden'} p={1} borderRadius={1} bgcolor={colors.common.white}>
                    <iframe title='Title heer' style={{ minWidth: '100%', height: '100%', border: 'solid 0px' }} src={url} />
                </Stack>
            </Backdrop>
            <Stack minWidth={183} overflow={'hidden'} borderRadius={2} >
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
                    <>
                        {
                            type == "preview" && (<Stack position={'relative'} onMouseEnter={() => {
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
                                }} open={hover} onClick={() => {
                                    setPreview(true)
                                }}>
                                    <Stack>
                                        <IconButton ><RemoveRedEyeRounded sx={{ color: colors.common.white }} /></IconButton>
                                    </Stack>
                                </Backdrop>
                                <iframe style={{ minWidth: '100%', height: 258, objectFit: 'cover', border: 'solid 0px', overflow: 'hidden' }} src={url} />
                                <Stack position={'absolute'} bottom={0} left={0} right={0} p={1} bgcolor={'white'}>
                                    <Typography variant='caption'>{name}</Typography>
                                </Stack>
                            </Stack>)
                        }
                        {type === 'button' && (
                            <Card size='small' style={{ width: '100%' }}>
                                <Stack direction={"row"} alignItems={'center'} gap={1}>
                                    <Attachment />
                                    <Stack flex={1}>
                                        <Typography variant='body2' bold>{name}</Typography>
                                    </Stack>
                                    <Button onClick={() => {
                                        setPreview(true)
                                    }} >View</Button>
                                </Stack>
                            </Card>
                        )}
                    </>

                )
                }

            </Stack >
        </Stack>

    )
}

export default Documents