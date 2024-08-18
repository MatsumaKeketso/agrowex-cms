import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Box, Button, IconButton, Stack, Divider, TextField, Typography, Backdrop } from '@mui/material'
import OfftakeDetails from '../components/OfftakeDetails'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { OfftakeService } from '../db/offtake-service'
import { useDispatch } from 'react-redux'
import { setActiveOfftake } from '../services/offtake/offtakeSlice'
// import 'antd/dist/antd.css';
import { Card, ConfigProvider, DatePicker, Drawer, Empty, Form, Input, message, Modal, Popconfirm, Select, Space, Spin, Timeline } from 'antd'
import { ArrowDownwardRounded, CloseOutlined, CloseRounded, DeleteRounded } from '@mui/icons-material'
import toObject from 'dayjs/plugin/toObject'
import dayjs from 'dayjs'
import StatusTag from '../components/StatusTag'
import { AuthService } from '../services/authService'
dayjs.extend(toObject);

const ProductionCost = () => {
  const [disableForm, setDisableForm] = useState(false);
  const [loading, setLoading] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [offtake, setOfftake] = useState({})
  const { offtake_id } = useParams()
  const [costingForm] = Form.useForm()
  const [next, setNext] = useState(false)
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toSubmitted = (ot) => {
    setLoading(true)
    dispatch(setActiveOfftake(ot))
    OfftakeService.updateOfftake(offtake_id, ot).then(() => {
      setLoading(false)
      messageApi.success("Offtake updated")
      navigate("/offtakes")
    }).catch(err => {
      setLoading(false)
      messageApi.error(err.message);
    })
  }

  useEffect(() => {
    setLoading(true)
    // OfftakeService.getOfftake
    OfftakeService.getOfftake(offtake_id).then(o => {
      // dispatch(setActiveOfftake(offtake))
      if (o) {
        setOfftake(o)
        if (o.status === 'submitted') {
          setDisableForm(true)
        } else if (o.status === 'published') {
          setDisableForm(true)
        }
      }
      if (o?.schedule) {

        // schedule exists?
        // prepare scheduling and costing
        var schedule = o.schedule
        var costing = o.costing

        // prefill costing steps with schedule steps
        if (schedule?.steps) {
          costingForm.setFieldsValue({
            steps: schedule?.steps.map(step => {
              console.log(step);

              return ({
                process_name: step?.name || "",
                id: step?.id || ""
              })
            })
          });
        }

        if (costing?.steps) {
          if (costing?.steps?.length !== 0) {
            costingForm.setFieldsValue({
              steps: costing.steps.map((step, i) => {
                if (schedule.steps[i]?.id === step?.id) {
                  console.log(schedule?.steps[i]);

                  // set costing form with previous values
                  if (schedule?.steps[i]?.id) {
                    return ({
                      process_name: schedule.steps[i].name,
                      name: step.name,
                      application: step.application,
                      category: step.category,
                      total: step.total,
                      total_symbol: step.total_symbol,
                      unit: step.unit,
                      unit_symbol: step.unit_symbol,
                    })
                  } else {

                  }
                  setLoading(false)
                }
                setLoading(false)
              })
            });
          }
          setLoading(false)
        } else {
          setLoading(false)
        }
      }
    })
  }, [])

  return (
    <Layout>
      <Backdrop sx={{ zIndex: 99999 }} open={loading}>
        <Spin />
      </Backdrop>
      <Modal title="Publish Offtake" open={next} onOk={() => {
        setLoading(true)
        AuthService.getUser().then(user => {
          toSubmitted({ ...offtake, status: "submitted", pm: offtake.pm ? offtake.pm : user.uid })
          setLoading(false)

        })
      }} onCancel={() => {
        setNext(false)
      }}>
        <Stack gap={3} alignItems={'center'} justifyItems={'center'} justifyContent={'center'}>
          <Typography variant="h4">Submission </Typography>
          <Stack sx={{ opacity: .3 }} direction={'row'} alignSelf={'center'} gap={1}>
            <Typography variant="subtitle2">AGRO-{offtake_id}</Typography>
            <StatusTag status={'planning'} />
          </Stack>
          <ArrowDownwardRounded />
          <Stack direction={'row'} alignSelf={'center'} gap={1}>
            <Typography variant="subtitle2">AGRO-{offtake_id}</Typography>
            <StatusTag status={'published'} />
          </Stack>
          <Typography variant="subtitle2">
            This offtake will be submitted to OP Manager, continue?
          </Typography>
        </Stack>
      </Modal>
      <Drawer title="Offtake Details" size='large' open={openDrawer} placement='right' onClose={() => { setOpenDrawer(false) }}>
        <OfftakeDetails setOfftakeId={() => { }} />
      </Drawer>
      <Stack gap={0} sx={{ overflow: 'auto' }} flex={1} direction={'row'} position={'relative'}>
        {contextHolder}
        <Stack flex={1}>
          <Stack direction={'row'} gap={1}>
            <Typography variant='h6' p={2}>Production Cost</Typography>
          </Stack>
          <Stack flex={1} p={3} sx={{ overflow: 'auto' }} position={'relative'}>
            {loading && (<Stack py={5} alignItems={'center'}>
              <Spin size='large' />
            </Stack>)}
            {!offtake?.costing?.steps.length === 0 && (<Empty />)}
            {offtake?.costing?.steps === 0 && (
              <Stack alignItems={'center'}>
                <Empty />
                <Stack px={15} py={5} gap={4}>
                  <Typography>You need to add steps for Production Plan before you can set up Production Cost.</Typography>
                  <Button onClick={() => {
                    navigate(`/offtakes/${offtake_id}/schedule`);
                  }}>Production Plan</Button>
                </Stack>
              </Stack>
            )}
            <Form layout='vertical' disabled={disableForm} form={costingForm} onError={(event) => {
              console.log(event);
            }}
              onFinish={(values) => {
                setLoading(true)
                offtake.schedule.steps.map((step, i) => {
                  values.steps[i].id = step.id
                })
                OfftakeService.updateOfftake(offtake_id, { ...offtake, costing: values }).then(() => {
                  messageApi.success("Offtake Updated successfully")
                  setNext(true)
                  setLoading(false)
                }).catch(err => {
                  messageApi.error("Error. Data not saved.")
                  console.log(err);

                })
              }}>
              <Form.List name="steps">
                {(fields, { add, remove }) => (
                  <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
                    {fields.map((field) => {
                      const stepName = costingForm.getFieldsValue([[field.name, 'process_name']])
                      console.log(stepName);
                      return (
                        <Stack>
                          <Stack flex={1} direction={'row'} gap={5}>
                            <Stack pt={0.5} gap={1} direction={'row'}>
                              <Typography>Step {field.name + 1}</Typography>
                            </Stack>
                            <Stack
                              flex={1}
                            >
                              <Form.Item label="Process Name" name={[field.name, 'process_name']} rules={[{ required: true }]} >

                                <Input style={{ color: 'black', fontSize: 27 }} disabled bordered={false} size='large' />

                              </Form.Item>
                              {/* <Form.Item hidden={true} name={[field.name, 'id']} rules={[{ required: true }]} >
                                <Input size='large' disabled={true} />
                              </Form.Item> */}
                              {/* <Divider >Details</Divider> */}
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
                                <Form.Item label="Per" name={[field.name, 'unit_symbol']} rules={[{ required: true }]} >
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
                                <Form.Item label="Per" name={[field.name, 'total_symbol']} rules={[{ required: true }]} >
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
                            {/* <Popconfirm title="Remove Step" description="You are about to remove this step, are you sure?" onConfirm={() => {
                              remove(field.name)
                            }}>
                              <IconButton color='error' sx={{ alignSelf: 'start' }} size='small'>
                                <DeleteRounded />
                              </IconButton>
                            </Popconfirm> */}
                          </Stack>
                          <Divider />
                        </Stack>
                      )
                    })}
                    {/* <Stack direction={'row'} alignContent={'flex-end'}>
                      <Button variant='outlined' onClick={() => add()} >
                        + Add Step
                      </Button>
                    </Stack> */}
                  </div>
                )}
              </Form.List>
            </Form>
          </Stack>
          <Stack p={1} direction={'row'} gap={1}>
            <Stack flex={1}>

            </Stack>
            <Button disabled={disableForm} variant='outlined' onClick={() => { costingForm.submit() }}>Save Draft</Button>
            {/* <Button variant='contained'>Continue</Button> */}
            {offtake.status !== "submitted" && (
              <Button variant='contained' onClick={async () => {
                try {
                  await costingForm.validateFields();
                  costingForm.submit()


                } catch (errorInfo) {
                  messageApi.error("Form not valid")
                  console.log('Form validation failed:', errorInfo);
                }

              }}>Publish Offtake</Button>)}

            {offtake.status === "submitted" && (
              <Button variant='contained' onClick={async () => {

              }}>Approve and Publish Offtake</Button>
            )}
          </Stack>
        </Stack>
        <Stack gap={2} p={1} py={2} sx={{ overflowY: 'auto', display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none' } }}>
          <Button variant='outlined' onClick={() => {
            setOpenDrawer(true)
          }}>View Offtake</Button>
        </Stack>
        <Stack flex={0.5} gap={2} p={1} sx={{ overflowY: 'auto', display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex' } }}>
          <OfftakeDetails setOfftakeId={() => { }} />
        </Stack>
      </Stack>
    </Layout >
  )
}

export default ProductionCost