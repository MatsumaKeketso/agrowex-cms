import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Backdrop, Box, colors, Divider, IconButton, Stack, TextField, Toolbar, Typography } from '@mui/material'
import OfftakeDetails from '../components/OfftakeDetails'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { OfftakeService } from '../services/offtakeService'
import { useDispatch, useSelector } from 'react-redux'
import { setActiveOfftake } from '../services/offtake/offtakeSlice'
// import 'antd/dist/antd.css';
import { Card, DatePicker, Form, Input, message, Modal, Space, Button, Timeline, Spin, Empty, InputNumber, Select, Statistic } from 'antd'
import { ArrowDownwardRounded, CloseOutlined, CloseRounded } from '@mui/icons-material'
import toObject from 'dayjs/plugin/toObject'
import dayjs from 'dayjs'
import StatusTag from '../components/StatusTag'
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData'
import { ArrowLeftOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import { AuthService } from '../services/authService'
import { SystemService } from '../services/systemService'
dayjs.extend(weekday);
dayjs.extend(localeData)
const yield_options = [
  { label: 'Ha', value: 'ha' },
  { label: 'Tunnel', value: 'tunnel' },
  { label: 'Hives', value: 'hives' },
  { label: 'Tank', value: 'tank' },
  { label: 'Gallons', value: 'gallons' },
  { label: 'Other', value: 'other' }
];
const production_stages = [
  { label: 'Season Preparation', value: 'season_preparation' },
  { label: 'In Production', value: 'in_production' },
  { label: 'Harvesting', value: 'harvesting' },
  { label: 'Delivery', value: 'delivery' }
];
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
  const [pageLoading, setPageLoading] = useState(true)
  const [offtake, setOfftake] = useState({})
  const { offtake_id } = useParams()
  const [scheduleForm] = Form.useForm()
  const [publish, setPublish] = useState(false)
  const [next, setNext] = useState(false)
  const [productionCost, setProductionCost] = useState(0)
  const [messageApi, contextHolder] = message.useMessage();
  const [productionPlan, setProductionPlan] = useState(null)
  const [unitCostTotal, setUnitCostTotal] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const statusValues = Form.useWatch("status", scheduleForm)
  const total_of_ha = Form.useWatch("total_of_ha", scheduleForm)
  const redux_offtake = useSelector((state) => state.offtake?.active);
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
          phase: stat.phase,
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
      const offtake_with_dates = {
        ...offtake,
        offtake_start_and_end_date: new_schedule.offtake_start_and_end_date,
        submission_closing_date: new_schedule.submission_closing_date,
        total_of_ha: schedule.total_of_ha,
        production_cost: productionCost,
        total_of_ha_unit: schedule.total_of_ha_unit,
        production_capacity: schedule.production_capacity,
        production_capacity_unit: schedule.production_capacity_unit,
        yield_output: schedule.yield_output,
        yield_output_unit: schedule.yield_output_unit,

      }
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
  const getTotalUnitCost = (cateogry, step, cost_item) => {

    if (statusValues[cateogry]) {
      if (statusValues[cateogry]?._steps[step]) {
        if (statusValues[cateogry]?._steps[step]._costing) {
          var step_costing = 0
          const a = step_costing + (statusValues[cateogry]?._steps[step]._costing[cost_item]?.amount || 0)
          const i = step_costing + (statusValues[cateogry]?._steps[step]._costing[cost_item]?.interval || 0)
          const uph = step_costing + (statusValues[cateogry]?._steps[step]._costing[cost_item]?.used_per_hactor || 0)
          step_costing = step_costing + (a * i * uph * total_of_ha)
          // .forEach(step_cost => {
          //   if (step_cost) {
          //     step_costing +=
          //       (step_cost?.amount || 0) *
          //       (step_cost?.interval || 0) *
          //       (step_cost?.used_per_hactor || 0);
          //   }
          // });

          return step_costing
        } else {
          return 0
        }

      } else { return 0 }
    } else { return 0 }
  }
  const calculateTotalUnitCost = (form, categoryIndex, stepIndex, itemIndex) => {
    // Get the current form values
    const formValues = form.getFieldsValue(true);

    // Extract relevant values
    const unitCost = form.getFieldValue([
      'status',
      categoryIndex,
      '_steps',
      stepIndex,
      '_costing',
      itemIndex,
      'amount'
    ]) || 0;

    const quantityUsedPerHa = form.getFieldValue([
      'status',
      categoryIndex,
      '_steps',
      stepIndex,
      '_costing',
      itemIndex,
      'used_per_hactor'
    ]) || 0;

    const applicationInterval = form.getFieldValue([
      'status',
      categoryIndex,
      '_steps',
      stepIndex,
      '_costing',
      itemIndex,
      'interval'
    ]) || 0;

    // Get total hectares from the form
    const totalHectares = form.getFieldValue('total_of_ha') || 0;

    // Calculate total unit cost
    const totalUnitCost = unitCost * quantityUsedPerHa * applicationInterval * totalHectares;

    // Set the calculated value in the form
    form.setFieldsValue({
      status: {
        [categoryIndex]: {
          _steps: {
            [stepIndex]: {
              _costing: {
                [itemIndex]: {
                  total_unit_cost: totalUnitCost
                }
              }
            }
          }
        }
      }
    });

    return totalUnitCost.toFixed(2);
  };
  const getCostingPerStep = (cateogry, step) => {
    if (statusValues[cateogry]) {
      if (statusValues[cateogry]?._steps[step]) {
        if (statusValues[cateogry]?._steps[step]._costing) {
          var step_total_costing = 0
          statusValues[cateogry]?._steps[step]._costing.forEach(step_cost => {
            if (step_cost) {
              step_total_costing = step_total_costing + (step_cost?.total_unit_cost * 1 || 0)
            }
          });

          return step_total_costing
        } else {
          return 0
        }

      } else { return 0 }
    } else { return 0 }
  }
  const getProductionStatuses = () => {
    OfftakeService.getProductionPlan(offtake_id).then(status => {
      if (status) {
        setProductionPlan(status)
        scheduleForm.setFieldValue("status", status.map((stat: any) => {
          const { name, phase ,description, _steps, key } = stat
          return {
            key: key,
            name: name,
            description: description,
            phase: phase,
            _steps: _steps ? _steps?.map(step => {
              const { name, duration } = step
              const start = dayjs(duration[0])
              const end = dayjs(duration[1])
              return {
                name: name,
                duration: [start, end],
                _costing: step?._costing ? step?._costing?.map((cost) => {
                  return {
                    name: cost.name,
                    amount: cost.amount,
                    interval: cost.interval,
                    used_per_hactor: cost.used_per_hactor,
                    total_unit_cost: cost.total_unit_cost
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
      statusValues.map((_status, si) => {
        if (_status) {
          if (_status?._steps) {
            _status?._steps.map((step, si) => {
              if (step?._costing) {
                step?._costing.map((cost, ci) => {
                  console.log(cost);

                  if (cost) {
                    const _amount = cost?.total_unit_cost
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
    // Watch for changes in total_of_ha
    const watchTotalHa = scheduleForm.getFieldValue('total_of_ha');

    // Iterate through all status (categories)
    scheduleForm.getFieldValue('status')?.forEach((category, categoryIndex) => {
      // Iterate through all steps in the category
      category._steps?.forEach((step, stepIndex) => {
        // Iterate through all cost items in the step
        step._costing?.forEach((costItem, itemIndex) => {
          // Recalculate total unit cost for each item
          const unitCost = costItem.amount || 0;
          const quantityUsedPerHa = costItem.used_per_hactor || 0;
          const applicationInterval = costItem.interval || 0;

          const totalUnitCost = unitCost * quantityUsedPerHa * applicationInterval * watchTotalHa;

          // Update the total_unit_cost for this specific item
          scheduleForm.setFieldsValue({
            status: {
              [categoryIndex]: {
                _steps: {
                  [stepIndex]: {
                    _costing: {
                      [itemIndex]: {
                        total_unit_cost: Number(totalUnitCost.toFixed(2)),
                        overal_cost: Number(totalUnitCost.toFixed(2))
                      }
                    }
                  }
                }
              }
            }
          });
        });
      });
    });
  }, [scheduleForm.getFieldValue('total_of_ha')]);
  useEffect(() => {
    setPageLoading(true)
    // Get offtake
    if (redux_offtake.offtake_id) {
      console.log("no need to get storage data");

    } else {
      console.log("get storage data first");

    }
    OfftakeService.getOfftake(offtake_id).then(async (o: any) => {
      if (o) {
        if (o.submission_closing_date) {
          const closingDate = await dayjs(o.submission_closing_date);
          scheduleForm.setFieldValue("submission_closing_date", closingDate);
        }
        if (o.offtake_start_and_end_date) {
          const startDate = await dayjs(o.offtake_start_and_end_date[0])
          const endDate = await dayjs(o.offtake_start_and_end_date[1])
          scheduleForm.setFieldValue("offtake_start_and_end_date", [startDate, endDate]);
        }
        scheduleForm.setFieldValue("total_of_ha", o.total_of_ha || 1);
        scheduleForm.setFieldValue("total_of_ha_unit", o.total_of_ha_unit || 1);
        scheduleForm.setFieldValue("production_capacity", o.production_capacity || null);
        scheduleForm.setFieldValue("production_capacity_unit", o.production_capacity_unit || 1);
        scheduleForm.setFieldValue("yield_output", o.yield_output || 1);
        scheduleForm.setFieldValue("yield_output_unit", o.yield_output_unit || null);
        setTimeout(() => {
          dispatch(setActiveOfftake(o))
          setPageLoading(false)
        }, 500);
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

      <Backdrop sx={{ zIndex: 20 }} open={pageLoading} >
        <Stack>
          <Spin />
        </Stack>
      </Backdrop>

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
          <AppBar sx={{ zIndex: 10 }} variant='outlined' position='sticky'>
            <Toolbar>
              <Button onClick={() => { navigate("/offtakes") }} icon={<ArrowLeftOutlined />} ></Button>
              <Stack flex={1} direction={'row'} gap={1}>
                <Typography flex={1} variant='h6' p={2}>Production Plan</Typography>
                <Typography variant='subtitle1' p={2}>Production Cost : R {productionCost}</Typography>
              </Stack>
              <Button disabled={!disableForm} icon={<DownloadOutlined />} onClick={() => {
                OfftakeService.generateProductionPDF(productionPlan, redux_offtake).then((res) => {
                  console.log(res);
                }).catch(err => {
                  console.log(err);

                })
              }} >Download PDF</Button>
            </Toolbar>
          </AppBar>
          <Stack flex={1}>
            <Stack flex={1} p={3} sx={{ overflow: 'auto' }} position={'relative'}>

              <Form disabled={disableForm} form={scheduleForm} layout='vertical' onFinish={(schedule) => {
                submitSchedule(schedule)
              }}>
                <Stack direction={'row'} justifyContent={'space-between'} >
                  <Form.Item rules={[{ required: true }]} label="Offtake Submission ads closing date" name="submission_closing_date">
                    <DatePicker picker="date" />
                  </Form.Item>
                  <Form.Item rules={[{ required: true }]} label="Offtake start and end date" name="offtake_start_and_end_date">
                    <DatePicker.RangePicker picker="date" />
                  </Form.Item>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'} >
                  <Form.Item label="Yield/Output" name="yield_output" initialValue={0} rules={[{ required: true }]}>
                    <InputNumber addonAfter={
                      <Form.Item
                        name="yield_output_unit"
                        noStyle
                        initialValue={'ha'}
                      >
                        <Select defaultActiveFirstOption={true} defaultValue={'ha'} style={{ minWidth: 90 }} options={yield_options} />
                      </Form.Item>
                    } />
                  </Form.Item>
                  <Form.Item label="Total Production Capacity" name="total_of_ha" initialValue={0} rules={[{ required: true }]}>
                    <InputNumber onChange={(e) => {
                      // Trigger recalculation of all total unit costs
                      const newTotalHa = e?.target?.value;

                      // Similar logic to the useEffect above can be placed here
                      // Iterate and recalculate all total unit costs
                    }} addonAfter={
                      <Form.Item
                        name="total_of_ha_unit"
                        noStyle
                        initialValue={'ha'}

                      >
                        <Select defaultActiveFirstOption={true} defaultValue={'ha'} options={[{ label: 'Ha', value: 'ha' }]} />
                      </Form.Item>
                    }></InputNumber>
                  </Form.Item>
                  <Form.Item label="Required Production Capacity" name="production_capacity" initialValue={0} rules={[{ required: true }]}>
                    <InputNumber addonAfter={
                      <Form.Item
                        name="production_capacity_unit"
                        noStyle
                        initialValue={'ha'}
                      >

                        <Select defaultActiveFirstOption={true} defaultValue={'ha'} options={[{ label: 'Ha', value: 'ha' }]} />
                      </Form.Item>
                    } />
                  </Form.Item>
                </Stack>
                <Form.List name="status" >
                  {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', rowGap: 0, flexDirection: 'column' }}>
                      {fields.map((field) => (
                        <Stack key={field.name}>
                          <Stack py={2}>
                            <Divider>
                              <Stack direction={'row'} gap={1}>Production Category {field.name + 1} {field.name !== 0 ? (
                                <IconButton disabled={disableForm} size='small' onClick={() => {
                                  const key = statusValues[field.name]?.key ? statusValues[field.name].key : field.name
                                  if (key) {
                                    OfftakeService.removeProductionStatus(offtake_id, key).then(() => {
                                      remove(field.name);
                                    }).catch(err => {
                                      console.log(err);
                                      remove(field.name)
                                    })
                                  } else {
                                    remove(field.name)
                                  }
                                }}>
                                  <CloseRounded />
                                </IconButton>) : null}
                              </Stack>
                            </Divider>
                          </Stack>
                          <Accordion
                            elevation={0}
                            variant='elevation'
                            key={field.key}
                            defaultExpanded={true}

                          >
                            <AccordionSummary>
                              <Stack flex={1}>
                                <Form.Item hidden
                                  name={[field.name, 'key']}>
                                  <Input onClick={(e) => { e.preventDefault() }} onFocus={(e) => { e.preventDefault() }} disabled />
                                </Form.Item>
                                <Stack direction={'row'} spacing={2} >
                                  <Form.Item rules={[{ required: true, message: 'Please enter Step name' }]}
                                    label="Name" name={[field.name, 'name']}>
                                    <Input />
                                  </Form.Item>
                                  <Form.Item initialValue={"season_preparation"} rules={[{ required: true, message: 'Please enter Step name' }]}
                                    label="Phase" name={[field.name, 'phase']}>
                                    <Select style={{minWidth: 240}} defaultActiveFirstOption={true} options={production_stages} />
                                  </Form.Item>
                                </Stack>

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
                                      {
                                        steps.map((step) => {
                                  
                                          return (
                                            <Timeline.Item key={step.name} dot={<Spin />}>
                                              <Card title={`Production Step ${step.name + 1} - R${getCostingPerStep(field.name, step.name)}`
                                              }
                                                extra={
                                                  <>
                                                    {step.name !== 0 ? (<IconButton onClick={() => { remove(step.name) }}><CloseRounded /></IconButton>) : null}
                                                  </>
                                                }
                                              >
                                                <Stack direction={'row'} gap={1}>
                                                  <Stack flex={1}>
                                                    <Form.Item
                                                      rules={[{ required: true, message: 'Please enter the name of this step' }]}
                                                      name={[step.name, 'name']}
                                                      label={`Name`}
                                                      style={{ width: '100%' }}
                                                    >
                                                      <Input style={{ width: '100%' }} />
                                                    </Form.Item>
                                                  </Stack>
                                                  <Stack flex={1} direction={'row'} gap={1}>
                                                    <Stack flex={1}>
                                                      <Form.Item rules={[{ required: true, message: 'Please enter the duration of this step' }]}
                                                        name={[step.name, 'duration']}
                                                        label={`Duration`}
                                                      >
                                                        <DatePicker.RangePicker picker="date" />
                                                      </Form.Item></Stack>

                                                  </Stack>
                                                </Stack>
                                                <Stack py={1}>
                                                  <Divider>Production Cost</Divider>
                                                </Stack>
                                                <Form.List name={[step.name, '_costing']}>
                                                  {(items, { add, remove }) => (
                                                    <Stack>
                                                      {items.map((item, i) => {
                                                        return (
                                                          <Stack gap={1} p={1} borderRadius={1} bgcolor={i % 2 ? colors.grey[100] : colors.common.white}>

                                                            <Form.Item label="Cost item" name={[item.name, 'name']} rules={[{ required: true }]} >
                                                              <Input />
                                                            </Form.Item>
                                                            <Stack key={item.key} direction={'row'} spacing={1} >

                                                              <Form.Item label="Cost per unit" initialValue={(0).toFixed(2)} name={[item.name, 'amount']} rules={[{ required: true }]} >
                                                                <InputNumber addonBefore="R" onChange={() => {
                                                                  calculateTotalUnitCost(
                                                                    scheduleForm,
                                                                    field.name,  // categoryIndex
                                                                    step.name,   // stepIndex
                                                                    item.name    // itemIndex
                                                                  );
                                                                }} />
                                                              </Form.Item>
                                                              <Form.Item label="Application&nbsp;intervals" initialValue={(0).toFixed(2)} name={[item.name, 'interval']} rules={[{ required: true }]} >
                                                                <InputNumber onChange={() => {
                                                                  calculateTotalUnitCost(
                                                                    scheduleForm,
                                                                    field.name,  // categoryIndex
                                                                    step.name,   // stepIndex
                                                                    item.name    // itemIndex
                                                                  );
                                                                }} />
                                                              </Form.Item>
                                                              <Form.Item label="QTY used per Ha/Tune" initialValue={0} name={[item.name, 'used_per_hactor']} rules={[{ required: true }]} >
                                                                <InputNumber value={0} addonAfter={
                                                                  <Form.Item
                                                                    name={[item.name, 'used_per_hactor_unit']}
                                                                    noStyle
                                                                    initialValue={'kg'}
                                                                  >
                                                                    <Select defaultActiveFirstOption={true} options={[{ label: 'kg', value: 'kg' }]} />
                                                                  </Form.Item>
                                                                } onChange={() => {
                                                                  calculateTotalUnitCost(
                                                                    scheduleForm,
                                                                    field.name,  // categoryIndex
                                                                    step.name,   // stepIndex
                                                                    item.name    // itemIndex
                                                                  );
                                                                }} />
                                                              </Form.Item>
                                                              <Form.Item hidden label="Total unit cost" initialValue={0} name={[item.name, 'overal_cost']} rules={[{ required: true }]} >
                                                                <InputNumber style={{ flex: 1, width: '100%' }} value={0} />
                                                              </Form.Item>
                                                              {/* <Statistic title="Total unit cost" value={getTotalUnitCost(field.name, step.name, item.name)}></Statistic> */}
                                                              <Form.Item label="Total unit cost" initialValue={0} name={[item.name, 'total_unit_cost']} rules={[{ required: true }]} >
                                                                <InputNumber disabled style={{ flex: 1, width: '100%' }} value={0} />
                                                              </Form.Item>
                                                              <Stack pt={3.5}>
                                                                {i !== 0 ? (<Button onClick={() => { remove(item.name) }} icon={<DeleteOutlined />} shape='circle'></Button>) : null}
                                                              </Stack>
                                                            </Stack>
                                                            <Divider />
                                                          </Stack>

                                                        )
                                                      })}
                                                      <Stack py={1} alignItems={'start'}>
                                                        <Button onClick={() => { add() }}>Add Cost Item</Button>
                                                      </Stack>
                                                    </Stack>
                                                  )}
                                                </Form.List>
                                              </Card>
                                            </Timeline.Item>
                                          )
                                        })
                                      }

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