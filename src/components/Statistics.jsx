import { Stack, Typography, colors } from '@mui/material'
import { Form, Input, Segmented, Statistic, Switch } from 'antd'
import React from 'react'
export const formatText = (input) => {
    // Replace spaces with underscores
    let snakeCaseString = input.replace(/[^\w\s]/g, '_') // Replace non-word characters (except underscores) with underscores
        .replace(/\s+/g, '_')       // Replace spaces with underscores
        .toLowerCase();             // Convert to lowercase 
    return snakeCaseString;
}

const Statistics = ({ inputMode, title, value, disabled }) => {

    return (
        <Stack flex={1}>
            {inputMode && (
                <Stack spacing={1}>
                    {/* <Typography color={colors.grey[500]} sx={{ py: 0.3 }} variant=''>{title}</Typography> */}
                    <Form.Item rules={[{ required: true }]} value={value} name={formatText(title)} label={title}>
                        {/* <Input size='middle' disabled={disabled} /> */}
                        <Segmented
                            options={['Enable', 'Disable']}
                            onChange={(value) => {
                                console.log(value); // string
                            }}
                        />
                    </Form.Item>
                </Stack>
            )}
            {!inputMode && (<Statistic title={title} value={value} />)}
        </Stack>
    )
}

export default Statistics