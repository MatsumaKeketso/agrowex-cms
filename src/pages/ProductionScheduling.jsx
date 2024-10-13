import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Box, colors, Divider, IconButton, Stack, TextField, Toolbar, Typography } from '@mui/material'
import OfftakeDetails from '../components/OfftakeDetails'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { OfftakeService } from '../services/offtakeService'
import { useDispatch } from 'react-redux'
import { setActiveOfftake } from '../services/offtake/offtakeSlice'
// import 'antd/dist/antd.css';
import { Card, DatePicker, Form, Input, message, Modal, Space, Button, Timeline, Spin, Empty } from 'antd'
import { ArrowDownwardRounded, CloseOutlined, CloseRounded } from '@mui/icons-material'
import toObject from 'dayjs/plugin/toObject'
import dayjs from 'dayjs'
import StatusTag from '../components/StatusTag'
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData'
import { DeleteOutlined } from '@ant-design/icons'
import { AuthService } from '../services/authService'
import { SystemService } from '../services/systemService'
dayjs.extend(weekday);
dayjs.extend(localeData)
const generateStepId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
export const formatDate = (dateObject) => {
  return dayjs(dateObject).valueOf()
}

const ProductionScheduling = () => {
  const [disableForm, setDisableForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [offtake, setOfftake] = useState({})
  const { offtake_id } = useParams()
  const [scheduleForm] = Form.useForm()
  const [publish, setPublish] = useState(false)
  const [next, setNext] = useState(false)
  const [productionCost, setProductionCost] = useState(0)
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const statusValues = Form.useWatch("status", scheduleForm)

  const submitSchedule = (schedule) => {
    console.log(schedule);

    // will be edited
    // setLoading(true)
    var missing_steps = false
    var new_schedule: any = {
      submission_closing_date: 0,
      offtake_start_and_end_date: [0, 0],
      status: []
    }
    // format steps duration
    // add updated at timestamp

    // TODO
    // Each status needs to be in its own document
    // the uid should always be accessible
    // deleting status should be synced with db
    // update fetch to reflect location
    if (schedule?.status !== undefined) {
      schedule.status.forEach((stat, a) => {

        const formatted_status: any = {
          name: stat.name,
          description: stat.description,
          _steps: []
        }
        if (stat?._steps !== undefined) {
          missing_steps = false
          stat._steps.forEach((step, b) => {
            const start = step.duration[0]
            const end = step.duration[1]
            const formatted_step = {
              duration: [formatDate(start), formatDate(end)],
              updated_at: SystemService.generateTimestamp(),
              name: step.name,
              _costing: step._costing ? step._costing : []
            }
            formatted_status._steps.push(formatted_step)
          });
          new_schedule.status.push(formatted_status)
        } else {
          messageApi.error("Missing steps")
          missing_steps = true
        }
      });
      new_schedule.submission_closing_date = formatDate(schedule.submission_closing_date)
      // format submission start and end dates
      const offtakeStart = formatDate(schedule.offtake_start_and_end_date[0])
      const offtakeEnd = formatDate(schedule.offtake_start_and_end_date[1])
      new_schedule.offtake_start_and_end_date = [offtakeStart, offtakeEnd]
      // check ids for status
      const offtake_with_dates = { ...offtake, offtake_start_and_end_date: new_schedule.offtake_start_and_end_date, submission_closing_date: new_schedule.submission_closing_date }
      if (!missing_steps) {
        new_schedule.status.forEach((stat, i) => {
          const status_doc_id = schedule.status[i].key
          console.log(status_doc_id);
          if (status_doc_id) {
            OfftakeService.updateProductionPlan(offtake_id, status_doc_id, stat).then(() => {
              console.log('Status updated successfully');
            })
          } else {
            OfftakeService.addProductionStatus(offtake_id, stat).then((ref) => {
              console.log('New status pushed successfully');
              // todo fetch the data after pushing to update the hidden form field values
              getProductionStatuses()
            })
          }
        });
        OfftakeService.updateOfftake(offtake_id, offtake_with_dates).then(def => {
          messageApi.success("Offtake Updated successfully")
          setLoading(false)
          if (publish) { setNext(true) }
        }).catch(err => {
          console.log(err);
          // feedback
          messageApi.error("Error. Offtake not saved.")
          setLoading(false)
        })
      }


    } else {
      messageApi.error("Missing status")
    }


  }


  const getProductionStatuses = () => {
    OfftakeService.getProductionPlan(offtake_id).then(status => {
      if (status) {
        scheduleForm.setFieldValue("status", status.map((stat: any) => {
          const { name, description, _steps, key } = stat
          return {
            key: key,
            name: name,
            description: description,
            _steps: _steps ? _steps?.map(step => {
              const { name, duration } = step
              const start = dayjs(duration[0])
              const end = dayjs(duration[1])
              console.log(step);

              return {
                name: name,
                duration: [start, end],
                _costing: step?._costing ? step?._costing?.map((cost) => {
                  return {
                    name: cost.name,
                    amount: cost.amount
                  }
                }) : []
              }
            }) : []
          }
        }))



      }

    })
  }
  useEffect(() => {
    var amount = 0
    if (statusValues) {
      statusValues.map(_status => {
        if (_status) {
          if (_status?._steps) {
            _status?._steps.map(step => {
              if (step?._costing) {
                step?._costing.map(cost => {
                  if (cost) {
                    const _amount = cost?.amount
                    amount = (amount + (_amount * 1))
                  }
                })
              }

            })
          }
        }
      })
      setProductionCost(amount)
    }
  }, [statusValues])
  useEffect(() => {

    // Get offtake
    OfftakeService.getOfftake(offtake_id).then(o => {
      // dispatch(setActiveOfftake(offtake))
      if (o) {
        if (o.submission_closing_date) {
          const closingDate = dayjs(o.submission_closing_date);
          scheduleForm.setFieldValue("submission_closing_date", closingDate);
        }
        if (o.offtake_start_and_end_date) {
          const startDate = dayjs(o.offtake_start_and_end_date[0])
          const endDate = dayjs(o.offtake_start_and_end_date[1])
          scheduleForm.setFieldValue("offtake_start_and_end_date", [startDate, endDate]);
        }

        if (
          OfftakeService.getStatus.Name(o.status) === 'submitted' ||
          OfftakeService.getStatus.Name(o.status) === 'published' ||
          OfftakeService.getStatus.Name(o.status) === 'finalstage' ||
          OfftakeService.getStatus.Name(o.status) === 'active'
        ) {
          setDisableForm(true)
        }
        setOfftake(o)
      } else {
        return;
      }
      // schedule exists?
    })
    getProductionStatuses()

  }, [])

  return (
    <Layout>


      <Modal title="Submit Offtake"
        open={next}
        onOk={() => {
          setLoading(true)
          AuthService.getUser().then(user => {
            const _status = {
              status_name: "submitted",
              updated_at: SystemService.generateTimestamp()
            }
            const updated_status = [...offtake.status, _status]
            const toSubmitted = (ot) => {
              setLoading(true)
              // dispatch(setActiveOfftake(ot))
              OfftakeService.updateOfftake(offtake_id, ot).then(() => {
                setLoading(false)
                messageApi.success("Offtake updated")
                navigate("/offtakes")
              }).catch(err => {
                setLoading(false)
                messageApi.error(err.message);
              })
            }
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


      <Stack gap={1} sx={{ overflow: 'auto' }} flex={1} direction={'row'} position={'relative'}>
        {contextHolder}
        <Stack flex={1} sx={{
          maxHeight: '100%',
          overflowY: 'auto'
        }}>
          <AppBar variant='outlined' position='sticky'>
            <Toolbar>
              <Stack flex={1} direction={'row'} gap={1}>
                <Typography flex={1} variant='h6' p={2}>Production Plan</Typography>
                <Typography variant='subtitle1' p={2}>Production Cost : R{productionCost}</Typography>
              </Stack>
            </Toolbar>
          </AppBar>
          <Stack flex={1}>
            <Stack flex={1} p={3} sx={{ overflow: 'auto' }} position={'relative'}>

              <Form disabled={disableForm} form={scheduleForm} layout='vertical' onFinish={(schedule) => {
                submitSchedule(schedule)
              }}>
                <Form.Item rules={[{ required: true }]} label="Offtake Submission ads closing date" name="submission_closing_date">
                  <DatePicker picker="date" />

                </Form.Item>
                <Form.Item rules={[{ required: true }]} label="Offtake start and end date" name="offtake_start_and_end_date">
                  <DatePicker.RangePicker picker="date" />
                </Form.Item>
                <Form.List name="status" >
                  {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', rowGap: 0, flexDirection: 'column' }}>
                      {fields.map((field) => (
                        <Stack key={field.name}>
                          <Stack py={2}>
                            <Divider>
                              <Stack direction={'row'} gap={1}>Production Category {field.name + 1} {field.name !== 0 ? (
                                <IconButton disabled={disableForm} size='small' onClick={() => {
                                  const key = statusValues[field.name].key
                                  console.log();
                                  OfftakeService.removeProductionStatus(offtake_id, key).then(() => {
                                    remove(field.name);
                                  })
                                }}>
                                  <CloseRounded />
                                </IconButton>) : null}</Stack>
                            </Divider>
                          </Stack>
                          <Accordion
                            elevation={0}
                            variant='elevation'
                            key={field.key}
                          >
                            <AccordionSummary>
                              <Stack flex={1}>
                                <Form.Item hidden
                                  name={[field.name, 'key']}>
                                  <Input disabled />
                                </Form.Item>
                                <Form.Item rules={[{ required: true, message: 'Please enter Step name' }]}
                                  label="Name" name={[field.name, 'name']}>
                                  <Input />
                                </Form.Item>
                                <Form.Item rules={[{ required: true, message: 'Please enter the description of this step' }]}
                                  name={[field.name, 'description']}
                                  label={`Description`}>
                                  <Input.TextArea />
                                </Form.Item>
                              </Stack>

                            </AccordionSummary>
                            <AccordionDetails>
                              <Stack flex={1} gap={1}>

                                <Form.List name={[field.name, '_steps']}>
                                  {(steps, { add, remove }) => (
                                    <Timeline>
                                      {steps.map((step) => {

                                        return (
                                          <Timeline.Item key={step.name} dot={<Spin />}>
                                            <Card title={`Production Step ${step.name + 1}`
                                            }
                                              extra={
                                                <>
                                                  {step.name !== 0 ? (<IconButton onClick={() => { remove(step.name) }}><CloseRounded /></IconButton>) : null}
                                                </>
                                              }
                                            >
                                              <Stack direction={'row'} gap={1}>
                                                <Form.Item
                                                  rules={[{ required: true, message: 'Please enter the name of this step' }]}
                                                  name={[step.name, 'name']}
                                                  label={`Name`}
                                                  style={{ width: '100%' }}
                                                >
                                                  <Input style={{ width: '100%' }} />
                                                </Form.Item>
                                                <Form.Item rules={[{ required: true, message: 'Please enter the duration of this step' }]}
                                                  name={[step.name, 'duration']}
                                                  label={`Duration`}
                                                >
                                                  <DatePicker.RangePicker picker="date" />
                                                </Form.Item>
                                              </Stack>
                                              <Stack py={1}>
                                                <Divider>Production Cost</Divider>
                                              </Stack>
                                              <Form.List name={[step.name, '_costing']}>
                                                {(items, { add, remove }) => (
                                                  <Stack>
                                                    {items.map((item, i) => {
                                                      return (

                                                        <Stack key={item.key} direction={'row'} spacing={1} >
                                                          <Form.Item label="Cost Item" name={[item.name, 'name']} rules={[{ required: true }]} >
                                                            <Input />
                                                          </Form.Item>
                                                          <Form.Item label="Cost Amount" initialValue={(0).toFixed(2)} name={[item.name, 'amount']} rules={[{ required: true }]} >
                                                            <Input addonBefore="R" />
                                                          </Form.Item>
                                                          <Stack pt={3.5}>
                                                            {i !== 0 ? (<Button onClick={() => { remove(item.name) }} icon={<DeleteOutlined />} shape='circle'></Button>) : null}
                                                          </Stack>
                                                        </Stack>
                                                      )
                                                    })}
                                                    <Stack alignItems={'start'}>
                                                      <Button onClick={() => { add() }}>Add Cost Item</Button>
                                                    </Stack>
                                                  </Stack>
                                                )}
                                              </Form.List>
                                            </Card>
                                          </Timeline.Item>
                                        )
                                      })}

                                      <Stack alignItems={'flex-end'}>
                                        <Button disabled={disableForm} type='default' onClick={() => add()} >
                                          + Add Step
                                        </Button>
                                      </Stack>
                                    </Timeline>
                                  )}
                                </Form.List>
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        </Stack>
                      ))}

                      <Stack py={2} gap={2} direction={'row'} alignItems={'center'}>
                        <Divider sx={{ flex: 1, color: colors.green[400] }}>
                          <Button disabled={disableForm} type='default' onClick={() => add()} >
                            + Add Category
                          </Button>
                        </Divider>

                      </Stack>
                    </div>
                  )}
                </Form.List>
              </Form>
            </Stack>
            <Stack direction={'row'} gap={1} p={1} >
              <Stack flex={1}>              </Stack>
              <Button
                loading={loading}
                type='default'
                color={colors.green[400]}
                disabled={disableForm}
                onClick={() => { scheduleForm.submit() }}>Save Draft</Button>
              {/* Update status to submitted */}
              {
                OfftakeService.getStatus.Name(offtake.status) === "planning"
                &&
                (
                  <Button type='primary' onClick={() => {
                    setPublish(true)
                    scheduleForm.submit()
                  }}>Submit Offtake</Button>
                )
              }
            </Stack>
          </Stack>
        </Stack>

        <Stack flex={0.5} gap={2} p={1} sx={{ overflowY: 'auto' }}>
          <OfftakeDetails setOfftakeId={() => { }} />
        </Stack>
      </Stack>
    </Layout >
  )
}

export default ProductionScheduling