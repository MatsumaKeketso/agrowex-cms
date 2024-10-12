import { CommentOutlined, Person2, Person3Outlined } from '@mui/icons-material'
import { AppstoreAddOutlined, CloseOutlined, DatabaseOutlined, FireFilled } from '@ant-design/icons'
import { Stack } from '@mui/material'
import { FloatButton, Popconfirm, Spin, Switch } from 'antd'
import React, { useState } from 'react'
import { OfftakeService } from '../services/offtakeService'

const DevTools = () => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false)
  return (
    <Stack>
      <FloatButton.Group
        onClick={() => {
          setOpen(false)
        }}
        style={{ insetInlineEnd: 24 }}
        icon={<DatabaseOutlined />}
      >
        <Popconfirm
          title="Warning! DB Offtakes Refresh!"
          description="For DEV Purposes Only. This will reset the current offtakes, continue?"
          onConfirm={() => {
            setLoading(true)
            OfftakeService._testing.generateStableOfftakes().then(() => {
              setLoading(false)
            })
          }}>
          <FloatButton
            description="RESET"
            icon={loading ? <Spin /> : <FireFilled />}
          />
        </Popconfirm>

      </FloatButton.Group>

    </Stack>
  )
}

export default DevTools