import { Stack, Typography, colors } from '@mui/material'
import { Form, Input, Statistic } from 'antd'
import React from 'react'
function formatText(input) {
    // Split the input text by spaces
    const words = input.split(' ');

    // Initialize an array to hold the formatted words
    const formattedWords = words.map((word, index) => {
        // Convert the first word to lowercase
        if (index === 0) {
            return word.toLowerCase();
        }
        // Capitalize the first letter of the subsequent words and convert the rest to lowercase
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    // Join the formatted words into a single string
    return formattedWords.join('');
}

const Statistics = ({ inputMode, title, value, disabled }) => {

    return (
        <Stack flex={1}>
            {inputMode && (
                <Stack spacing={1}>
                    {/* <Typography color={colors.grey[500]} sx={{ py: 0.3 }} variant=''>{title}</Typography> */}
                    <Form.Item rules={[{required: true}]} value={value} name={formatText(title)} label={title}>
                        <Input size='middle' disabled={disabled} />
                    </Form.Item>
                </Stack>
            )}
            {!inputMode && (<Statistic title={title} value={value} />)}
        </Stack>
    )
}

export default Statistics