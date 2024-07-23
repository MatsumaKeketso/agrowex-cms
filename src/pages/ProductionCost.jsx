import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Box, Button, IconButton, Stack, Divider, TextField, Typography } from '@mui/material'
import OfftakeDetails from '../components/OfftakeDetails'
import { useLocation, useParams } from 'react-router-dom'
import { OfftakeService } from '../db/offtake-service'
import { useDispatch } from 'react-redux'
import { setActiveOfftake } from '../services/offtake/offtakeSlice'
// import 'antd/dist/antd.css';
import { Card, DatePicker, Form, Input, message, Select, Space, Timeline } from 'antd'
import { CloseOutlined, CloseRounded } from '@mui/icons-material'
import toObject from 'dayjs/plugin/toObject'
import dayjs from 'dayjs'
dayjs.extend(toObject);
const ProductionCost = () => {
  const [offtake, setOfftake] = useState({})
  const { offtake_id } = useParams()
  const [costingForm] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {

    OfftakeService.getOfftake(offtake_id).then(o => {
      // dispatch(setActiveOfftake(offtake))
      if (o) {
        setOfftake(o)
      }
      if (o?.costing) { // schedule exists?
        var costing = o.costing
        if (costing) {
      
          costingForm.setFieldsValue({
            steps: costing.steps.map(step => ({

              application: step.application,
              category: step.category,
              name: step.name,
              process_name: step.process_name,
              total: step.total,
              total_symbol: step.total_symbol,
              unit: step.unit,
              unit_symbol: step.unit_symbol,
            }))
          });
        }
      }
    })
  }, [])

  return (
    <Layout>
      <Stack gap={0} sx={{ overflow: 'auto' }} flex={1} direction={'row'} position={'relative'}>
        {contextHolder}
        <Stack flex={1}>
          <Stack direction={'row'} gap={1}>
            <Typography variant='h6' p={2}>Production Cost</Typography>
          </Stack>
          <Stack flex={1} p={3} sx={{ overflow: 'auto' }} position={'relative'}>
            <Form form={costingForm} onFinish={(v) => {
              var costing = v
              console.log(costing)
              OfftakeService.updateOfftake(offtake_id, { ...offtake, costing: costing }).then(() => {
                messageApi.success("Offtake Updated successfully")
              }).catch(err => {
                messageApi.error("Error. Data not saved.")
                console.log(err);

              })

            }}>

              <Form.List name="steps">
                {(fields, { add, remove }) => (
                  <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
                    {fields.map((field) => (
                      <Stack>
                        <Stack flex={1} direction={'row'} gap={5}>
                          <Stack pt={1.5} gap={1} direction={'row'}>
                            <Typography>Step {field.name + 1}</Typography>

                          </Stack>
                          <Stack
                            flex={1}
                          >
                            <Form.Item label="Process Name" name={[field.name, 'process_name']} rules={[{ required: true }]} >
                              <Input />
                            </Form.Item>
                            <Divider >Details</Divider>
                            <Form.Item label="Name" name={[field.name, 'name']} rules={[{ required: true }]} >
                              <Input />
                            </Form.Item>
                            <Form.Item label="Application" name={[field.name, 'application']} rules={[{ required: true }]} >
                              <Input />
                            </Form.Item>
                            <Stack direction={'row'} gap={2}>
                              <Form.Item style={{ width: '100%' }} label="Unit" name={[field.name, 'unit']} rules={[{ required: true }]} >
                                <Input />
                              </Form.Item>
                              <Form.Item name={[field.name, 'unit_symbol']} rules={[{ required: true }]} >
                                <Select placeholder="Select unit">
                                  <Select.Option value="ha">/Ha</Select.Option>
                                </Select>
                              </Form.Item>

                            </Stack>
                            <Form.Item label="Category" name={[field.name, 'category']} rules={[{ required: true }]} >
                              <Select >
                                <Select.Option value="ha">/Ha</Select.Option>
                              </Select>
                            </Form.Item>
                            <Stack direction={'row'} gap={2}>
                              <Form.Item style={{ width: '100%' }} label="Total" name={[field.name, 'total']} rules={[{ required: true }]} >
                                <Input />
                              </Form.Item>
                              <Form.Item name={[field.name, 'total_symbol']} rules={[{ required: true }]} >
                                <Select placeholder="Select unit">
                                  <Select.Option value="ha">/Ha</Select.Option>
                                </Select>
                              </Form.Item>

                            </Stack>
                            {/* <IconButton size='small' onClick={() => {
                          remove(field.name);
                        }}>
                          <CloseRounded />
                        </IconButton> */}
                          </Stack>
                          <Button onClick={() => {
                            remove(field.name)
                          }} sx={{ alignSelf: 'start' }} size='small'>Remove</Button>
                        </Stack>
                        <Divider />
                      </Stack>
                    ))}
                    <Stack direction={'row'} alignContent={'flex-end'}>
                      <Button variant='outlined' onClick={() => add()} >
                        + Add Step
                      </Button>
                    </Stack>
                  </div>
                )}
              </Form.List>
            </Form>
          </Stack>
          <Stack p={1} direction={'row'} gap={1}>
            <Stack flex={1}>
              <Button sx={{ alignSelf: 'start' }} variant='text'>Production Cost</Button>
            </Stack>
            <Button variant='outlined' onClick={() => { costingForm.submit() }}>Save Draft</Button>
            {/* <Button variant='contained'>Continue</Button> */}
          </Stack>
        </Stack>
        <Stack flex={0.5} gap={2} p={1} sx={{ overflowY: 'auto', display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex' } }}>
          <OfftakeDetails setOfftakeId={() => { }} />
        </Stack>
      </Stack>
    </Layout >
  )
}

export default ProductionCost