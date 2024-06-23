import { Stack } from '@mui/material'
import { Badge } from 'antd'
import React from 'react'

const OfftakeStatus = () => {
    const STATUS = {
        new: {

        },
        inprogress: {

        },
        planning: {

        },
        active: {

        },
        cancelled: {

        },
        notViable: {

        },
        negotiation: {

        },
        verified: {
            
        },
        pipeline: {

        }, submitted: {

        },
        published: {

        },
        final: {
            
        }
    }
    return (
        <Stack>
            <Badge />
        </Stack>
    )
}

export default OfftakeStatus