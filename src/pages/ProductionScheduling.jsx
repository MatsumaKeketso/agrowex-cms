import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material'
import OfftakeDetails from '../components/OfftakeDetails'
import { useLocation, useParams } from 'react-router-dom'
import { OfftakeService } from '../db/offtake-service'
import { useDispatch } from 'react-redux'
import { setActiveOfftake } from '../services/offtake/offtakeSlice'
// import 'antd/dist/antd.css';
import { Card, DatePicker, Form, Input, message, Modal, Space } from 'antd'
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
    schedule.submissionClosingDate = dayjs(schedule.submissionClosingDate).toString()
    schedule.steps.map((_, step) => {
      console.log(step);

      // assign prev step id or generate a new one
      const stepsExist = offtake.schedule?.steps ? true : false
      const stepsIdExist = offtake.schedule?.steps[step]?.id
      const stepId = stepsExist ? stepsIdExist ? generateStepId() : offtake.schedule?.steps[step]?.id : null;
      if (stepsExist) {
        schedule.steps[step].id = stepId
      }

      try {
        console.log(schedule.steps[step].stepDuration[0]);
        // // format step duration start and end dates
        const stepDurationStartDate = dayjs(schedule.steps[step].stepDuration[0]).toString()
        const stepDurationEndDate = dayjs(schedule.steps[step].stepDuration[1]).toString()
        schedule.steps[step].stepDuration = [stepDurationStartDate, stepDurationEndDate]
        console.log('====================================');
        console.log(schedule);
        console.log('====================================');

      } catch (error) {
        console.log(error);

      }
    })
    // format submission start and end dates
    const startDate = dayjs(schedule.offtakeStartAndEndDate[0]).toString()
    const endDate = dayjs(schedule.offtakeStartAndEndDate[1]).toString()
    const startAndEndDates = [startDate, endDate]
    schedule.offtakeStartAndEndDate = startAndEndDates
    // schedule.offtakeStartAndEndDate.map((_, i) => {

    // })
    const offtakeWithSchedule = { ...offtake, schedule: schedule };
    console.log(schedule.offtakeStartAndEndDate[0]);
    // return
    OfftakeService.updateOfftake(offtake_id, offtakeWithSchedule).then(() => {
      dispatch(setActiveOfftake(offtakeWithSchedule))
      messageApi.success("Offtake Updated successfully")
      setLoading(false)
    }).catch(err => {
      console.log(err);

      messageApi.error("Error. Data not saved.")
      setLoading(false)
    })

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

        if (o.status === 'submitted') {
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
                              {fields.length > 1 ? (<IconButton disabled={disableForm} size='small' onClick={() => {
                                remove(field.name);
                                const stepId = offtake.schedule.steps[field.name].id
                                OfftakeService.removeCostingStep(offtake_id, stepId).then(() => {
                                  console.log('costing step removed');
                                })
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

                      <Button disabled={disableForm} variant='outlined' onClick={() => add()} >
                        + Add Item
                      </Button>
                    </div>
                  )}
                </Form.List>
              </Form>
            </Stack>
            <Stack direction={'row'} gap={1} p={1} >
              <Stack flex={1}>
                
              </Stack>
              <Button variant='outlined' disabled={disableForm} onClick={() => { scheduleForm.submit() }}>Save Draft</Button>
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