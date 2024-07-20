import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material'
import OfftakeDetails from '../components/OfftakeDetails'
import { useLocation, useParams } from 'react-router-dom'
import { OfftakeService } from '../db/offtake-service'
import { useDispatch } from 'react-redux'
import { setActiveOfftake } from '../services/offtake/offtakeSlice'
// import 'antd/dist/antd.css';
import { Card, DatePicker, Form, Input, message, Space } from 'antd'
import { CloseOutlined, CloseRounded } from '@mui/icons-material'
import toObject from 'dayjs/plugin/toObject'
import dayjs from 'dayjs'
dayjs.extend(toObject);
const ProductionScheduling = () => {
  const [offtake, setOfftake] = useState({})
  const { offtake_id } = useParams()
  const [steps, setSteps] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [scheduleForm] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage();
  const handleDateChange = (date, dateString, key) => {
    console.log(date, dateString, key);
  };
  const addStep = () => {
    if (newStep) {
      setSteps([...steps, { name: newStep, startWeek: 1, endWeek: 2 }]);
      setNewStep('');
    }
  };
  const updateStep = (index, key, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][key] = value;
    setSteps(updatedSteps);
  };
  const generateOutputObject = () => {
    return {
      steps,
      // closingDate: dayjs(closingDate).format('MMMM YYYY'),
      // startDate: dayjs(startDate).format('MMMM YYYY'),
    };
  };

  useEffect(() => {
    
    
    OfftakeService.getOfftake(offtake_id).then(o => {
      // dispatch(setActiveOfftake(offtake))
      setOfftake(o)
      if (o.schedule) {
        var s = o.schedule
        var schedule = {}
        Object.keys(o.schedule).map(section => {
          switch (section) {
            case "submissionClosingDate":
              schedule[section] = dayjs(s[section])
              scheduleForm.setFieldsValue({
                submissionClosingDate: dayjs(s[section]),
              });
              break;
            case "steps":
              var sD = []
              var steps = []
              scheduleForm.setFieldsValue({
                steps: s.steps.map(step => ({
                  name: step.name,
                  stepDuration: [dayjs(step.stepDuration[0]), dayjs(step.stepDuration[1])]
                }))

              });
              return
              s[section].map((_, step) => {
                const name = s[section][step].name
                const stepDuration = s[section][step].stepDuration
                stepDuration.map((_, d) => {
                  const date = dayjs(s[section][step][d])
                  sD.push(date)
                })

                steps.push({ name: name, stepDuration: sD })
              })
              schedule[section] = steps
              break;
            case "offtakeStartAndEndDate":
              scheduleForm.setFieldsValue({
                offtakeStartAndEndDate: [dayjs(s[section][0]), dayjs(s[section][1])],
              });
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
          <Stack flex={1} p={3} sx={{ overflow: 'auto' }} position={'relative'}>
            <Form form={scheduleForm} layout='vertical' onFinish={(v) => {
              var schedule = v
              Object.keys(schedule).map(section => {
                switch (section) {
                  case "submissionClosingDate":
                    schedule[section] = dayjs(schedule[section]).format()
                    break;
                  case "steps":
                    schedule[section].map((_, step) => {
                      console.log(schedule[section][step]);
                      try {
                        schedule[section][step].stepDuration = [dayjs(schedule[section][step].stepDuration[0]).format(), dayjs(schedule[section][step].stepDuration[1]).format()]
                      } catch (error) {
                        console.log(error);
                      }
                    })
                    break;
                  case "offtakeStartAndEndDate":
                    schedule[section].map((_, i) => {
                      schedule[section][i] = dayjs(v[section][i]).format()
                    })
                    break;
                }
              })
              OfftakeService.updateOfftake(offtake_id, { ...offtake, schedule: schedule }).then(() => {
                messageApi.success("Offtake Updated successfully")
              }).catch(err => {
                messageApi.error("Error. Data not saved.")
                console.log(err);

              })

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
                          <IconButton size='small' onClick={() => {
                            remove(field.name);
                          }}>
                            <CloseRounded />
                          </IconButton>

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

                    <Button variant='outlined' onClick={() => add()} >
                      + Add Item
                    </Button>
                  </div>
                )}
              </Form.List>
            </Form>
          </Stack>
          <Stack direction={'row'} gap={1}>
            <Stack flex={1}>
              <Button sx={{ alignSelf: 'start' }} variant='text'>Production Cost</Button>
            </Stack>
            <Button variant='outlined' onClick={() => { scheduleForm.submit() }}>Save Draft</Button>
            <Button variant='contained'>Continue</Button>
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