import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Accordion, AccordionDetails, AccordionSummary, Box, colors, Divider, IconButton, Stack, TextField, Typography } from '@mui/material'
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
const checkStepsProperty = (schedule) => {
  // Check if schedule is an object and if the steps property exists
  return schedule && typeof schedule === 'object' && 'steps' in schedule;
};
const checkStepsAndIdProperty = (schedule) => {
  // First, check if the 'steps' property exists and is an array
  if (schedule && typeof schedule === 'object' && Array.isArray(schedule.steps)) {
    // Now check if any object in the 'steps' array has an 'id' property
    return schedule.steps.some(step => step && typeof step === 'object' && 'id' in step);
  }
  return false; // Return false if 'steps' does not exist or is not an array
};
function checkType(expression) {
  try {
    // Evaluate the expression to get the value it points to
    const value = eval(expression);
    // Return the type of the value
    return typeof value;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

const ProductionScheduling = () => {
  const [disableForm, setDisableForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [offtake, setOfftake] = useState({})
  const { offtake_id } = useParams()
  const [scheduleForm] = Form.useForm()
  const [publish, setPublish] = useState(false)
  const [next, setNext] = useState(false)
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch()
  const navigate = useNavigate()


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


  const submitSchedule = (schedule) => {
    // will be edited
    // setLoading(true)
    var { offtakeStartAndEndDate, status, submissionClosingDate } = schedule;
    var dataValid = false;
    // format steps duration
    schedule.status.forEach((stat, a) => {
      stat.steps.forEach((step, b) => {
        const start = step.duration[0]
        const end = step.duration[1]
        const formated_duration = [formatDate(start), formatDate(end)]
        status[a].steps[b].duration = formated_duration

      });
    });
    submissionClosingDate = formatDate(schedule.submissionClosingDate)
    // format submission start and end dates
    const statusStart = formatDate(schedule.offtakeStartAndEndDate[0])
    const statusEnd = formatDate(schedule.offtakeStartAndEndDate[1])
    offtakeStartAndEndDate = [statusStart, statusEnd]
    // check ids for status
    const checkIds = (state: string) => {
      var proceed = false
      switch (state) {
        case "status":
          if ('status' in schedule) {
            status.forEach((d, stat) => {
              if (d.id) { // string
                proceed = true
              } else { // undefined
                proceed = false
              }
            });
            return proceed
          } else {
            return proceed
          }
          break;
        case "steps":
          status.forEach((d, stat) => {
            if ('steps' in d) {
              d.steps.forEach((step) => {
                if (step?.id) { // string
                  proceed = true
                } else { // undefined
                  proceed = false
                }
              })
              return proceed
            } else {
              return proceed
            }
          });
          break;
        default:
          break;
      }

    }
    const finalChecks = () => {
      const formattedSchedule = { offtakeStartAndEndDate, status, submissionClosingDate }
      // const offtakeWithSchedule = { ...offtake, schedule: formattedSchedule };
      if (checkIds("status")) {
        // db offtake update
        console.log('All steps have Ids');
        // TODO need to put the schedule inside a collection of the offtake
        //
        // console.log(formattedSchedule);


        OfftakeService.updateProductionPlan(offtake_id, formattedSchedule).then(() => {
          // local global offtake update
          // setOfftake(offtakeWithSchedule)
          // dispatch(setActiveOfftake(offtakeWithSchedule))
          if (publish) { setNext(true) }
          // feedback
          messageApi.success("Offtake Updated successfully")
          setLoading(false)
        }).catch(err => {
          console.log(err);
          // feedback
          messageApi.error("Error. Data not saved.")
          setLoading(false)
        })


      } else {
        console.log(schedule.steps);
        setLoading(false)
        messageApi.error('Problem with step id, contact dev for fix')
      }
    }

    // does schedule have statuses
    if (status !== undefined) {
      // status Id assignent
      schedule.status.map((_, status_index) => {
        // assign prev step id or generate a new one
        // does status exist in the current active offtake
        // is there a schedule in the current active offtake
        if ('schedule' in offtake) {
          if ('status' in offtake?.schedule) {
            // assign that id
            status[status_index].id = offtake.schedule?.status[status_index]?.id
          } else {
            // generate a new one
            status[status_index].id = generateStepId()
          }
        } else {
          status[status_index].id = generateStepId()
        }

      })
      try {
        schedule.status.forEach((stat, status_index) => {
          if (stat?.steps || stat.steps.length !== 0) {
            stat.steps.forEach((step, step_index) => {
              const steps = stat[status_index]?.steps
              schedule.status.forEach((stat, a) => {
                stat.steps.forEach((step, b) => {
                  // format duration
                  const start = step.duration[0]
                  const end = step.duration[1]
                  const formated_duration = [formatDate(start), formatDate(end)]
                  status[a].steps[b].duration = formated_duration

                  // make sure costing is added
                  if (!step?._costing || step?._costing.length === 0) {
                    messageApi.error('Production Costing is required for each step')
                    return false
                  } else {
                    dataValid = true
                  }


                });
              })
            });
            if (dataValid) { finalChecks() }
          } else {
            setLoading(false);
            messageApi.error("Missing steps for status")
            return
          }
        });

      } catch (error) {
        messageApi.error(error.message)
        setLoading(false)
        console.log(error);
      }
      // steps as status
    } else {
      messageApi.error('Production plan status missing')
      setLoading(false)
    }
  }



  useEffect(() => {

    // Get offtake
    OfftakeService.getOfftake(offtake_id).then(o => {
      // dispatch(setActiveOfftake(offtake))
      if (o) {
        // TODO
        /** need to check if user is om
         * pm should have edit access
         * 
         */
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
    OfftakeService.getProductionPlan(offtake_id).then(schedule => {
      if (schedule) {
        Object.keys(schedule).map((section) => {
          switch (section) {
            case "submissionClosingDate":
              const closingDate = dayjs(schedule.submissionClosingDate);
              scheduleForm.setFieldValue("submissionClosingDate", closingDate);
              break;
            case "status":
              // Something goes wrong in here
              // set values cant be edited
              const status = schedule[section]
              scheduleForm.setFieldValue("status", status.map(stat => {
                const { name, description, steps } = stat
                return {
                  name: name,
                  description: description,
                  steps: steps.map(step => {
                    const { name, duration } = step
                    const start = dayjs(duration[0])
                    const end = dayjs(duration[1])
                    console.log(step);

                    return {
                      name: name,
                      duration: [start, end],
                      _costing: step._costing.map((cost) => {
                        return {
                          name: cost.name,
                          amount: cost.amount
                        }
                      })
                    }
                  })
                }
              }))
              return
              // scheduleForm.setFieldsValue({
              //   steps: s.steps.map((step) => {
              //     const startDate = dayjs(step.stepDuration[0])
              //     const endDate = dayjs(step.stepDuration[1])
              //     return ({
              //       name: step.name,
              //       stepDuration: [startDate, endDate]
              //     })
              //   })
              // });
              break;
            case "offtakeStartAndEndDate":
              const startDate = dayjs(schedule.offtakeStartAndEndDate[0])
              const endDate = dayjs(schedule.offtakeStartAndEndDate[1])
              scheduleForm.setFieldValue("offtakeStartAndEndDate", [startDate, endDate],);
              break;
          }
        })
      }

    })
  }, [])

  return (
    <Layout>


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


      <Stack gap={0} sx={{ overflow: 'auto' }} flex={1} direction={'row'} position={'relative'}>
        {contextHolder}
        <Stack flex={1} sx={{
          maxHeight: '100%',
          overflowY: 'auto'
        }}>
          <Stack direction={'row'} gap={1}>
            <Typography variant='h6' p={2}>Production Plan</Typography>
          </Stack>
          <Stack flex={1}>
            <Stack flex={1} p={3} sx={{ overflow: 'auto' }} position={'relative'}>

              <Form disabled={disableForm} form={scheduleForm} layout='vertical' onFinish={(schedule) => {
                submitSchedule(schedule)
              }}>
                <Form.Item rules={[{ required: true }]} label="Offtake Submission ads closing date" name="submissionClosingDate">
                  <DatePicker picker="date" />

                </Form.Item>
                <Form.Item rules={[{ required: true }]} label="Offtake start and end date" name="offtakeStartAndEndDate">
                  <DatePicker.RangePicker picker="date" />
                </Form.Item>
                <Form.List name="status" >
                  {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', rowGap: 0, flexDirection: 'column' }}>
                      {fields.map((field) => (
                        <Stack key={field.name}>
                          <Stack py={2}>
                            <Divider>
                              <Stack direction={'row'} gap={1}>Production Status {field.name + 1} {field.name !== 0 ? (
                                <IconButton disabled={disableForm} size='small' onClick={() => {
                                  remove(field.name);
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

                                <Form.List name={[field.name, 'steps']}>
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
                            + Add Status
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
              <Button loading={loading} type='default' color={colors.green[400]} disabled={disableForm} onClick={() => { scheduleForm.submit() }}>Save Draft</Button>
              {/* Update status to submitted */}
              {
                OfftakeService.getStatus.Name(offtake.status) === "planning"
                &&
                (
                  <Button type='primary' onClick={async () => {
                    try {
                      await scheduleForm.validateFields().then((v) => {
                        scheduleForm.submit()
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