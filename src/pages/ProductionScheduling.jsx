import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Box, colors, IconButton, Stack, TextField, Typography } from '@mui/material'
import OfftakeDetails from '../components/OfftakeDetails'
import { useLocation, useParams } from 'react-router-dom'
import { OfftakeService } from '../services/offtakeService'
import { useDispatch } from 'react-redux'
import { setActiveOfftake } from '../services/offtake/offtakeSlice'
// import 'antd/dist/antd.css';
import { Card, DatePicker, Form, Input, message, Modal, Space, Button } from 'antd'
import { ArrowDownwardRounded, CloseOutlined, CloseRounded } from '@mui/icons-material'
import toObject from 'dayjs/plugin/toObject'
import dayjs from 'dayjs'
import StatusTag from '../components/StatusTag'
const generateStepId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
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
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch()
  const submitSchedule = (schedule) => {
    setLoading(true)
    schedule.submissionClosingDate = dayjs(schedule.submissionClosingDate).valueOf()
    const checkIds = () => {
      var proceed = false
      if ('steps' in schedule) {
        schedule.steps.forEach((d, step) => {
          if (d.id) {
            proceed = true
          } else {
            proceed = false
          }
        });
        return proceed
      } else {
        return proceed
      }
    }
    // does schedule have steps
    if (schedule.steps !== undefined) {
      // loop steps
      console.log(schedule);

      schedule.steps.map((_, step) => {
        // assign prev step id or generate a new one
        if ('steps' in offtake.schedule) {
          schedule.steps[step].id = offtake.schedule?.steps[step]?.id
        } else {
          schedule.steps[step].id = generateStepId()
        }
        try {
          // // format step duration start and end dates
          const stepDurationStartDate = dayjs(schedule.steps[step].stepDuration[0]).valueOf()
          const stepDurationEndDate = dayjs(schedule.steps[step].stepDuration[1]).valueOf()
          schedule.steps[step].stepDuration = [stepDurationStartDate, stepDurationEndDate]
        } catch (error) {
          console.log(error);
        }
      })
      console.log(schedule);


    } else {
      messageApi.error('Production plan steps missing')
      setLoading(false)
    }
    // format submission start and end dates
    const startDate = dayjs(schedule.offtakeStartAndEndDate[0]).valueOf()
    const endDate = dayjs(schedule.offtakeStartAndEndDate[1]).valueOf()
    const startAndEndDates = [startDate, endDate]
    schedule.offtakeStartAndEndDate = startAndEndDates

    const offtakeWithSchedule = { ...offtake, schedule: schedule };
    // return
    if (checkIds()) {
      OfftakeService.updateOfftake(offtake_id, offtakeWithSchedule).then(() => {
        dispatch(setActiveOfftake(offtakeWithSchedule))
        messageApi.success("Offtake Updated successfully")
        setLoading(false)
      }).catch(err => {
        console.log(err);

        messageApi.error("Error. Data not saved.")
        setLoading(false)
      })
    } else {
      console.log(schedule.steps);
      setLoading(false)
      messageApi.error('Problem with step id, contact dev for fix')
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
      if (o?.schedule) {

        // access and store schedule
        var s = o.schedule

        // set form fields
        Object.keys(o.schedule).map((section) => {
          switch (section) {
            case "submissionClosingDate":
              const closingDate = dayjs(s.submissionClosingDate);
              scheduleForm.setFieldValue("submissionClosingDate", closingDate);
              break;
            case "steps":
              // Something goes wrong in here
              // set values cant be edited
              scheduleForm.setFieldsValue({
                steps: s.steps.map((step) => {
                  const startDate = dayjs(step.stepDuration[0])
                  const endDate = dayjs(step.stepDuration[1])
                  return ({
                    name: step.name,
                    stepDuration: [startDate, endDate]
                  })
                })
              });
              break;
            case "offtakeStartAndEndDate":
              const startDate = dayjs(s.offtakeStartAndEndDate[0])
              const endDate = dayjs(s.offtakeStartAndEndDate[1])
              scheduleForm.setFieldValue("offtakeStartAndEndDate", [startDate, endDate],);
              break;
          }
        })

      }
    })
  }, [])

  return (
    <Layout>
      <Stack gap={0} sx={{ overflow: 'auto' }} flex={1} direction={'row'} position={'relative'}>
        {contextHolder}
        <Stack flex={1}>
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
                <Form.List name="steps">
                  {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
                      {fields.map((field) => (
                        <Card
                          size="small"
                          title={`Step ${field.name + 1}`}
                          key={field.key}
                          extra={
                            <Stack>
                              {field.name !== 0 ? (<IconButton disabled={disableForm} size='small' onClick={() => {
                                remove(field.name);
                                const stepId = offtake?.schedule.steps[field.name]?.id
                                if (stepId) {
                                  OfftakeService.removeCostingStep(offtake_id, stepId).then(() => {
                                    console.log('costing step removed');
                                  })
                                }
                              }}>
                                <CloseRounded />
                              </IconButton>) : null}
                            </Stack>


                          }
                        >
                          <Stack flex={1} direction={'row'} gap={1}>
                            <Stack flex={1}>
                              <Form.Item rules={[{ required: true, message: 'Please enter Step name' }]} label="Name" name={[field.name, 'name']}>
                                <Input />
                              </Form.Item>
                            </Stack>

                            <Form.Item rules={[{ required: true, message: 'Please enter duration of this step' }]} name={[field.name, 'stepDuration']} label="Days">
                              <DatePicker.RangePicker picker="date" />
                            </Form.Item>
                          </Stack>

                        </Card>
                      ))}

                      <Stack alignItems={'flex-end'}>
                        <Button disabled={disableForm} type='default' onClick={() => add()} >
                          + Add Step
                        </Button>
                      </Stack>
                    </div>
                  )}
                </Form.List>
              </Form>
            </Stack>
            <Stack direction={'row'} gap={1} p={1} >
              <Stack flex={1}>

              </Stack>
              <Button loading={loading} type='default' color={colors.green[400]} disabled={disableForm} onClick={() => { scheduleForm.submit() }}>Save Draft</Button>
              {/* <Button variant='contained' onClick={() => {
              setNext(true)
            }}>Continue</Button> */}
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