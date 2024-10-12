import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Box, IconButton, Stack, Divider, TextField, Typography, Backdrop, colors } from '@mui/material'
import OfftakeDetails from '../components/OfftakeDetails'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { OfftakeService } from '../services/offtakeService'
import { useDispatch } from 'react-redux'
import { setActiveOfftake } from '../services/offtake/offtakeSlice'
// import 'antd/dist/antd.css';
import { Card, Button, Drawer, Empty, Form, Input, message, Modal, Popconfirm, Select, Space, Spin, Timeline } from 'antd'
import { ArrowDownwardRounded, CloseOutlined, CloseRounded, DeleteRounded, Schedule } from '@mui/icons-material'
import toObject from 'dayjs/plugin/toObject'
import dayjs from 'dayjs'
import StatusTag from '../components/StatusTag'
import { AuthService } from '../services/authService'
import { SystemService } from '../services/systemService'
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import { formatDate } from './ProductionScheduling'
dayjs.extend(toObject);

const ProductionCost = () => {
  const [disableForm, setDisableForm] = useState(false);
  const [loading, setLoading] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [offtake, setOfftake] = useState({})
  const { offtake_id } = useParams()
  const [costingForm] = Form.useForm()
  const [next, setNext] = useState(false)
  const [publish, setPublish] = useState(false)
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
        if (
          OfftakeService.getStatus.Name(o.status) === 'submitted' ||
          OfftakeService.getStatus.Name(o.status) === 'published' ||
          OfftakeService.getStatus.Name(o.status) === 'finalstage' ||
          OfftakeService.getStatus.Name(o.status) === 'active'
        ) {
          setDisableForm(true)
        }
      }
      if ('schedule' in o) {

        // schedule exists?
        // prepare scheduling and costing
        var schedule = o.schedule
        var costing = o.costing
        // console.log({ schedule, costing });

        // prefill costing steps with schedule steps
        if (schedule?.status) {
          costingForm.setFieldsValue({
            status: schedule?.status.map(stat => {
              return ({
                name: stat?.name || "",
                description: stat?.description || "",
                id: stat?.id || "",
                steps: stat.steps.map(step => {
                  const { name, duration, process_name, total, total_symbol, unit, unit_symbol, category, application } = step
                  const start = dayjs(duration[0])
                  const end = dayjs(duration[1])
                  console.log(step);

                  return {
                    name: name,
                    process_name: process_name,
                    total: total,
                    application: step.application
                  }
                })
              })
            })
          });
        } else {
          messageApi.error('Status missing steps')
        }

        if (costing?.status) {
          if (costing?.status?.length !== 0) {
            costingForm.setFieldsValue({
              status: costing.status.map((stat, i) => {
                return {
                  name: stat.name,
                  description: stat.description,
                  steps: stat.steps.map((step, b) => {
                    return ({
                      process_name: step.process_name,
                      name: step.name,
                      application: step.application,
                      category: step.category,
                      total: step.total,
                      total_symbol: step.total_symbol,
                      unit: step.unit,
                      unit_symbol: step.unit_symbol,
                    })

                  })
                }

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
      <Modal title="Submit Offtake" open={next} onOk={() => {
        setLoading(true)
        AuthService.getUser().then(user => {
          const _status = {
            status_name: "submitted",
            updated_at: SystemService.generateTimestamp()
          }
          const updated_status = [...offtake.status, _status]

          toSubmitted({ ...offtake, status: updated_status, pm: offtake.pm ? offtake.pm : user.uid })
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
            <StatusTag status={'submitted'} />
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
            {offtake?.costing?.status?.length === 0 && (<Empty />)}
            {!offtake?.costing?.status || !offtake?.schedule?.status && (
              <Stack alignItems={'center'}>
                <Empty />
                <Stack px={15} py={5} gap={4}>
                  <Typography>You need to add steps for Production Plan before you can set up Production Cost.</Typography>
                  <Button type='primary' onClick={() => {
                    navigate(`/offtakes/${offtake_id}/schedule`);
                  }}>Production Plan</Button>
                </Stack>
              </Stack>
            )}
            <Form layout='vertical' disabled={disableForm} form={costingForm}
              onFinish={(values) => {
                // setLoading(true)

                if (offtake.schedule.status) {
                  offtake.schedule.status.map((stat, i) => {
                    if (!stat.id) {
                      messageApi.error('Step Missing Id',);
                      return
                    } else {
                      values.status[i].id = stat.id
                      stat.steps.forEach((step, b) => {
                        const { id } = step
                        values.status[i].steps[b].id = id
                        //   const start = formatDate(values.status[i].steps[b].duration[0])
                        //   const end = formatDate(values.status[i].steps[b].duration[1])
                        //   values.status[i].steps[b].duration = [start, end]
                      });

                      OfftakeService.updateOfftake(offtake_id, { ...offtake, costing: values }).then(() => {
                        messageApi.success("Offtake Updated successfully")
                        if (publish) { setNext(true) }
                        setLoading(false)
                      }).catch(err => {
                        setLoading(false)
                        messageApi.error("Error. Data not saved.")
                        console.log(err);
                      })

                    }
                  })
                } else {
                  messageApi.error('Production plan missing');

                }
              }}>
              <Form.List name="status">
                {(fields, { add, remove }) => (
                  <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
                    {fields.map((field) => {
                      // const stepName = costingForm.getFieldsValue([[field.name, 'process_name']])
                      return (
                        <Stack>
                          <Stack flex={1} direction={'row'} gap={5}>
                            <Stack pt={0.5} gap={1} direction={'row'}>
                              <Typography>Status {field.name + 1}</Typography>
                            </Stack>
                            <Stack
                              flex={1}
                            >

                              <Form.Item label="Status" name={[field.name, 'name']} rules={[{ required: true }]} >
                                <Input style={{ color: 'black', fontSize: 27 }} disabled bordered={false} size='large' />
                              </Form.Item>
                              <Form.Item label="Description" name={[field.name, 'description']} rules={[{ required: true }]}>
                                <Input.TextArea disabled bordered={false} size='large' />
                              </Form.Item>
                              <Form.List name={[field.name, 'steps']}>
                                {(steps, { add, remove }) => (
                                  <Timeline>
                                    {steps.map((step) => {

                                      return (
                                        <Timeline.Item key={step.name} >
                                          <Stack>
                                            <Form.List name={[step.name, 'item']}>
                                              {(items, { add, remove }) => (
                                                <Stack>
                                                  {items.map((item) => {
                                                    return (

                                                      <Stack direction={'row'} spacing={1} >
                                                        <Form.Item label="Cost Item" name={[item.name, 'name']} rules={[{ required: true }]} >
                                                          <Input />
                                                        </Form.Item>
                                                        <Form.Item label="Cost Amount" initialValue={(0).toFixed(2)} name={[item.name, 'amount']} rules={[{ required: true }]} >
                                                          <Input addonBefore="R" />
                                                        </Form.Item>
                                                        <Button onClick={() => { remove(item.name) }} icon={<DeleteOutlined />} shape='circle'></Button>
                                                      </Stack>
                                                    )
                                                  })}
                                                  <Stack alignItems={'start'}>

                                                    <Button onClick={() => { add() }}>Add Step Cost Item</Button>
                                                  </Stack>
                                                </Stack>
                                              )}
                                            </Form.List>
                                          </Stack>
                                        </Timeline.Item>
                                      )
                                    })}
                                    <Button onClick={() => { add() }}>Add Step</Button>
                                  </Timeline>
                                )}
                              </Form.List>

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
            <Button color={colors.green[400]} disabled={disableForm} type='default' onClick={() => { costingForm.submit() }}>Save Draft</Button>
            {/* Update status to published */}
            {
              OfftakeService.getStatus.Name(offtake.status) === "submitted" &&
              (
                <Button type='primary' onClick={async () => {
                  navigate(`/offtakes/${offtake.offtake_id}/published-chat`)
                }}>Chat to PM</Button>
              )
            }
            {/* Update status to submitted */}
            {
              OfftakeService.getStatus.Name(offtake.status) === "planning"
              &&
              (
                <Button type='primary' onClick={async () => {
                  try {
                    await costingForm.validateFields().then((v) => {
                      console.log('====================================');
                      console.log(v);
                      console.log('====================================');
                      costingForm.submit()
                    }).finally(() => {
                      setPublish(true)
                    })
                  } catch (errorInfo) {
                    messageApi.error("Form not valid")
                    console.log('Form validation failed:', errorInfo);
                  }
                }}>Submit Offtake</Button>
              )
            }

            {/* {OfftakeService.getStatus.Name(offtake.status) === "submitted" && (
              <Button type='primary' onClick={async () => {

              }}>Approve and Publish Offtake</Button>
            )} */}
          </Stack>
        </Stack>
        <Stack gap={2} p={1} py={2} sx={{ overflowY: 'auto', display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none' } }}>
          <Button type='link' onClick={() => {
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