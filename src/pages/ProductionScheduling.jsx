import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Backdrop, Box, colors, Divider, IconButton, Stack, TextField, Toolbar, Typography } from '@mui/material'
import OfftakeDetails from '../components/OfftakeDetails'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { OfftakeService } from '../services/offtakeService'
import { useDispatch, useSelector } from 'react-redux'
import { setActiveOfftake } from '../services/offtake/offtakeSlice'
// import 'antd/dist/antd.css';
import { Card, DatePicker, Form, Input, message, Modal, Space, Button, Timeline, Spin, Empty, InputNumber, Select, Statistic, Checkbox } from 'antd'
import { ArrowDownwardRounded, CloseOutlined, CloseRounded } from '@mui/icons-material'
import toObject from 'dayjs/plugin/toObject'
import dayjs from 'dayjs'
import StatusTag from '../components/StatusTag'
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData'
import { ArrowLeftOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import { AuthService, firestoreDB } from '../services/authService'
import { SystemService } from '../services/systemService'
import { Helpers } from '../services/helpers'
import { doc, runTransaction, writeBatch } from 'firebase/firestore'
dayjs.extend(weekday);
dayjs.extend(localeData)
const yield_options = [
  { label: 'Litre', value: 'ha' },
  { label: 'Kg', value: 'kg' },
  { label: 'Ton', value: 'hives' },
  { label: 'Gallons', value: 'gallons' },
];
const prod_res_cap_options = [
  { label: 'Ha', value: 'ha' },
  { label: 'Tunnel', value: 'tunnel' },
  { label: 'Hives', value: 'hives' },
  { label: 'Tank', value: 'tank' },
  { label: 'Gallons', value: 'gallons' }
];
const quantity_used_per_ha = [
  { label: 'Kg', value: 'kg' },
  { label: 'Litre', value: 'litre' },
  { label: 'Ton', value: 'ton' },
  { label: 'Gallons', value: 'gallons' },
  { label: 'Pack', value: 'pack' },
  { label: 'Bag', value: 'bag' },
  { label: 'Box', value: 'box' },
  { label: 'Tray', value: 'tray' },
  { label: 'Crate', value: 'crate' },
  { label: 'Ha', value: 'ha' }
];
const currency = [
  { label: 'R', value: 'ZAR' },
  { label: '$', value: 'USD' },
  { label: '€', value: 'EUR' },
  { label: '₦', value: 'NGN' },
  { label: '£', value: 'GBP' },
  { label: '¥', value: 'JPY' },
  { label: '₹', value: 'INR' },
  { label: '₽', value: 'RUB' }


]
const production_stages = [
  { label: 'Season Preparation', value: 'season_preparation' },
  { label: 'Post Havest Evaluation', value: 'post_eval' },
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
  const categoryValues = Form.useWatch("categories", scheduleForm)
  const yield_output_per_unit = Form.useWatch("yield_output_per_unit", scheduleForm)
  const prod_res_cap = Form.useWatch("prod_res_cap", scheduleForm)
  // const required_yield_output = Form.useWatch("required_yield_output", scheduleForm)
  const redux_offtake = useSelector((state) => state.offtake?.active);
  const formatter = (value) => {
    if (isNaN(value)) return 0;
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parser = (value) => {
    if (typeof value !== 'string') return 0;
    return value.replace(/\R\s?|(,*)/g, '');
  };

  const submitSchedule = (schedule) => {
    const batch = writeBatch(firestoreDB)
    // will be edited
    // setLoading(true)
    var missing_steps = false
    var new_schedule: any = {
      submission_closing_date: 0,
      offtake_start_and_end_date: [0, 0],
      categories: []
    }
    // format steps duration
    // add updated at timestamp

    // TODO
    // // Each categories needs to be in its own document
    // the uid should always be accessible
    // deleting categories should be synced with db
    // // update fetch to reflect location
    if (schedule?.categories !== undefined) {
      schedule.categories.forEach((stat, a) => {
        let formatted_category: any = {
          name: stat.name,
          description: stat.description,
          phase: stat.phase,
          _steps: []
        }
        if (stat.key) { formatted_category.key = stat.key }
        if (stat?._steps !== undefined) {
          missing_steps = false
          stat._steps.forEach((step, b) => {
            const start = step.duration[0]
            const end = step.duration[1]
            const formatted_step = {
              ...step,
              duration: [formatDate(start), formatDate(end)],
              updated_at: SystemService.generateTimestamp(),
              _costing: step._costing ? step._costing : []
            }
            formatted_category._steps.push(formatted_step)
          });
          new_schedule.categories.push(formatted_category)
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
      // check ids for categories
      const _production_plan = {
        offtake_start_and_end_date: new_schedule.offtake_start_and_end_date,
        submission_closing_date: new_schedule.submission_closing_date,
        prod_res_cap: schedule.prod_res_cap,
        production_cost: productionCost,
        prod_res_cap_unit: schedule.prod_res_cap_unit,
        required_yield_output: schedule.required_yield_output,
        required_yield_output_unit: schedule.required_yield_output_unit,
        yield_output_per_unit: schedule.yield_output_per_unit,
        yield_output_unit: schedule.yield_output_unit,
      }

      const offtake_with_dates = {
        ...offtake,
        _production_plan
      }
      if (!missing_steps) {
        console.log(new_schedule.categories);

        // todo: add helper function to modify the data sent to the server
        // target : new_schedule => modifty using Helpers.updateAllProductionData(offtake_id, new_schedule)
        Helpers.flatNestedData(new_schedule.categories).then(async (_flat_docs) => {
          const flat_docs = _flat_docs.toAdd
          // set new documents (toAdd)
          flat_docs.forEach(_doc => {
            // create
            // return
            OfftakeService.addProductionStatus(offtake_id, _doc.data).then((ref) => { console.log('New category pushed'); })
            //  update
          })
          const toUpdate = _flat_docs.toUpdate;
          // set updated documents (processedIds)
          // check for removed categories
          // remove categories that are not in the new schedule
          toUpdate.forEach(_doc => {
            // return
            OfftakeService.updateProductionPlan(offtake_id, _doc.data.key, _doc.data).then((ref) => { console.log('Category updated with key: ', _doc.data.key); })
            // OfftakeService.removeProductionStatus(offtake_id, doc.key).then(() => {
            //   console.log('Status removed successfully');
            // })
          });

        })

        // <<<< : old code : >>>>
        // new_schedule.categories.forEach((stat, i) => {
        //   const status_doc_id = schedule.categories[i].key
        //   console.log(status_doc_id);
        //   if (status_doc_id) {
        //     OfftakeService.updateProductionPlan(offtake_id, status_doc_id, stat).then(() => {
        //       console.log('Status updated successfully');
        //     })
        //   } else {
        //     OfftakeService.addProductionStatus(offtake_id, stat).then((ref) => {
        //       console.log('New categories pushed successfully');
        //       // // todo fetch the data after pushing to update the hidden form field values
        //       getProductionStatuses()
        //     })
        //   }
        // });

        // update prod plan

        OfftakeService.updateOfftake(offtake_id, offtake_with_dates).then(def => {
          messageApi.success("Offtake Updated successfully")
          setLoading(false)
          if (publish) { setNext(true) }
        }).catch(err => {
          console.log(err);
          // feedback
          messageApi.error("Error. Production not saved.")
          setLoading(false)
        })
      } else {
        messageApi.error("Missing Steps")

      }
    } else {
      messageApi.error("Missing Categories")
    }
  }
  const getTotalUnitCost = (cateogry, step, cost_item) => {

    if (categoryValues[cateogry]) {
      if (categoryValues[cateogry]?._steps[step]) {
        if (categoryValues[cateogry]?._steps[step]._costing) {
          var step_costing = 0
          const a = step_costing + (categoryValues[cateogry]?._steps[step]._costing[cost_item]?.amount || 0)
          const i = step_costing + (categoryValues[cateogry]?._steps[step]._costing[cost_item]?.interval || 0)
          const uph = step_costing + (categoryValues[cateogry]?._steps[step]._costing[cost_item]?.used_per_hactor || 0)
          step_costing = step_costing + (a * i * uph * prod_res_cap)
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
      'categories',
      categoryIndex,
      '_steps',
      stepIndex,
      '_costing',
      itemIndex,
      'amount'
    ]) || 0;

    const quantityUsedPerHa = form.getFieldValue([
      'categories',
      categoryIndex,
      '_steps',
      stepIndex,
      '_costing',
      itemIndex,
      'used_per_hactor'
    ]) || 0;

    const applicationInterval = form.getFieldValue([
      'categories',
      categoryIndex,
      '_steps',
      stepIndex,
      '_costing',
      itemIndex,
      'interval'
    ]) || 0;

    // Get total hectares from the form
    const totalHectares = form.getFieldValue('prod_res_cap') || 0;

    // Calculate total unit cost
    const totalUnitCost = unitCost * quantityUsedPerHa * applicationInterval * totalHectares;

    // Set the calculated value in the form
    form.setFieldsValue({
      categories: {
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
  const getCategoryPhase = (cateogry) => {
    if (categoryValues[cateogry]) {
      // return category phase
      return categoryValues[cateogry]?.phase
    } else { return '' }
  }
  const includeCosting = (cateogry, step, costing) => {
    if (categoryValues[cateogry]) {
      if (categoryValues[cateogry]?._steps[step]) {
        if (categoryValues[cateogry]?._steps[step]._costing) {
          const _include = categoryValues[cateogry]?._steps[step]._costing[costing]?.include_in_cost
          return _include
        } else {
          return false
        }

      } else { return false }
    } else { return false }
  }
  const getCostingPerStep = (cateogry, step) => {
    if (categoryValues[cateogry]) {
      if (categoryValues[cateogry]?._steps[step]) {
        if (categoryValues[cateogry]?._steps[step]._costing) {
          var step_total_costing = 0
          categoryValues[cateogry]?._steps[step]._costing.forEach(step_cost => {
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
    OfftakeService.getProductionPlan(offtake_id).then(categories => {
      if (categories) {
        // setProductionPlan(categories)
        Helpers.nestProductionData(categories).then((_data) => {
          const data = _data.groupedCategories
          console.log(data);

          // setProductionPlan(data)
          scheduleForm.setFieldValue("categories", data.map((stat: any) => {
            const { name, phase, description, _steps, key } = stat
            return { // categories
              key: key,
              name: name,
              description: description,
              phase: phase,
              _steps: _steps ? _steps?.map(step => {
                const { name, duration } = step
                const start = dayjs(duration[0])
                const end = dayjs(duration[1])
                return { // steps
                  step_name: name,
                  duration: [start, end],
                  _costing: step?._costing ? step?._costing?.map((cost) => {
                    return { // costs
                      key: cost.key,
                      cost_name: cost.cost_name,
                      amount: cost.amount,
                      interval: cost.interval,
                      used_per_hactor: cost?.used_per_hactor,
                      used_per_hactor_unit: cost?.used_per_hactor_unit,
                      total_unit_cost: cost?.total_unit_cost,
                      include_in_cost: cost?.include_in_cost ? cost.include_in_cost : false
                    }
                  }) : []
                }
              }) : []
            }
          }))
        })
        return

      }
    })
  }

  // prod_res_cap
  useEffect(() => {
    scheduleForm.setFieldValue("required_yield_output", (yield_output_per_unit * prod_res_cap))
  }, [yield_output_per_unit, prod_res_cap])
  useEffect(() => {
    var amount = 0
    if (categoryValues) {
      categoryValues.map((_status, si) => {
        if (_status) {
          if (_status?._steps) {
            _status?._steps.map((step, si) => {
              if (step?._costing) {
                step?._costing.map((cost, ci) => {
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
  }, [categoryValues, prod_res_cap])
  useEffect(() => {
    // Watch for changes in prod_res_cap
    const watchTotalHa = scheduleForm.getFieldValue('prod_res_cap');

    // Iterate through all category (categories)
    scheduleForm.getFieldValue('categories')?.forEach((category, categoryIndex) => {
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
            categories: {
              [categoryIndex]: {
                _steps: {
                  [stepIndex]: {
                    _costing: {
                      [itemIndex]: {
                        total_unit_cost: Number(totalUnitCost.toFixed(2)),
                        // overal_cost: Number(totalUnitCost.toFixed(2))
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
  }, [scheduleForm.getFieldValue('prod_res_cap')]);
  useEffect(() => {
    setPageLoading(true)
    SystemService.getCurrencyList().then((currency) => {
      // set currency
      console.log(currency);

    })
    // Get offtake
    if (redux_offtake.offtake_id) {
      console.log("no need to get storage data");

    } else {
      console.log("get storage data first");

    }
    OfftakeService.getOfftake(offtake_id).then(async (o: any) => {
      if (o) {
        // set new production plan data
        // now located in the offtake object property "_production_plan"
        const prod_plan = o._production_plan
        if (prod_plan) {
          if (prod_plan?.submission_closing_date) {
            const closingDate = await dayjs(prod_plan.submission_closing_date);
            scheduleForm.setFieldValue("submission_closing_date", closingDate);
          }
          if (prod_plan?.offtake_start_and_end_date) {
            const startDate = await dayjs(prod_plan.offtake_start_and_end_date[0])
            const endDate = await dayjs(prod_plan.offtake_start_and_end_date[1])
            scheduleForm.setFieldValue("offtake_start_and_end_date", [startDate, endDate]);
          }
          scheduleForm.setFieldValue("prod_res_cap", prod_plan?.prod_res_cap);
          scheduleForm.setFieldValue("prod_res_cap_unit", prod_plan?.prod_res_cap_unit);
          scheduleForm.setFieldValue("required_yield_output", prod_plan?.required_yield_output);
          scheduleForm.setFieldValue("required_yield_output_unit", prod_plan?.required_yield_output_unit);
          scheduleForm.setFieldValue("yield_output_per_unit", prod_plan?.yield_output_per_unit);
          scheduleForm.setFieldValue("yield_output_unit", prod_plan?.yield_output_unit);
        }


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
                <Typography variant='subtitle1' p={2}>Production Cost :  {SystemService.formatCurrency(productionCost)}</Typography>
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
                  <Form.Item label="Yield/Output Per Unit " name="yield_output_per_unit" initialValue={0} rules={[{ required: true }]}>
                    <InputNumber

                      addonAfter={
                        <Form.Item
                          name="yield_output_unit"
                          noStyle
                          initialValue={'ha'}
                        >
                          <Select defaultActiveFirstOption={true} defaultValue={'ha'} style={{ minWidth: 90 }} options={yield_options} />
                        </Form.Item>
                      } />
                  </Form.Item>
                  <Form.Item label="Production Resources Capacity " name="prod_res_cap" initialValue={0} rules={[{ required: true }]}>
                    <InputNumber addonAfter={
                      <Form.Item
                        name="prod_res_cap_unit"
                        noStyle
                        initialValue={'ha'}
                      >
                        <Select defaultActiveFirstOption={true} defaultValue={'ha'} style={{ minWidth: 90 }} options={prod_res_cap_options} />
                      </Form.Item>
                    }></InputNumber>
                  </Form.Item>
                  <Form.Item label="Required Total Yield/Output" name="required_yield_output" initialValue={0} rules={[{ required: true }]}>
                    <InputNumber disabled addonAfter={
                      <Form.Item

                        name="required_yield_output_unit"
                        noStyle
                        initialValue={'ha'}
                      >

                        <Select defaultActiveFirstOption={true} defaultValue={'ha'} style={{ minWidth: 90 }} options={yield_options} />
                      </Form.Item>
                    } />
                  </Form.Item>
                </Stack>
                <Form.List name="categories" >
                  {(categories, { add, remove }) => (
                    <div style={{ display: 'flex', rowGap: 0, flexDirection: 'column' }}>
                      {categories.map((category) => (
                        <Stack key={category.name}>
                          <Stack py={2}>
                            <Divider>
                              <Stack alignItems={'center'} direction={'row'} gap={1}>Production Category {category.name + 1} {category.name !== 0 ? (
                                <IconButton disabled={disableForm} size='small' onClick={() => {
                                  // const key = categoryValues[category.name]?.key ? categoryValues[category.name].key : category.name
                                  // todo : monitor could break
                                  const key = categoryValues[category.name]?._steps[0]?._costing[0]?.key
                                  if (key) {
                                    OfftakeService.removeCategories(offtake_id, key).then(() => {
                                      remove(category.name)
                                    })
                                  } else {
                                    remove(category.name)
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
                            key={category.key}
                            defaultExpanded={true}

                          >
                            <AccordionSummary>
                              <Stack flex={1}>
                                <Form.Item hidden
                                  name={[category.name, 'key']}>
                                  <Input disabled />
                                </Form.Item>
                                <Stack direction={'row'} spacing={2} >
                                  <Form.Item rules={[{ required: true, message: 'Please enter Step name' }]}
                                    label="Name" name={[category.name, 'name']}>
                                    <Input />
                                  </Form.Item>
                                  <Form.Item initialValue={"season_preparation"} rules={[{ required: true, message: 'Please enter Step name' }]}
                                    label="Phase" name={[category.name, 'phase']}>
                                    <Select style={{ minWidth: 240 }} defaultActiveFirstOption={true} options={production_stages} />
                                  </Form.Item>
                                </Stack>

                                <Form.Item rules={[{ required: true, message: 'Please enter the description of this step' }]}
                                  name={[category.name, 'description']}
                                  label={`Description`}>
                                  <Input.TextArea />
                                </Form.Item>
                              </Stack>

                            </AccordionSummary>
                            <AccordionDetails>
                              <Stack flex={1} gap={1}>

                                <Form.List name={[category.name, '_steps']}>
                                  {(steps, { add, remove }) => (
                                    <Timeline>
                                      {
                                        steps.map((step) => {

                                          return (
                                            <Timeline.Item key={step.name} dot={<Spin />}>
                                              <Card title={`Production Step ${step.name + 1} - ${SystemService.formatCurrency(getCostingPerStep(category.name, step.name))}`
                                              }
                                                extra={
                                                  <>
                                                    {step.name !== 0 ? (<IconButton disabled={disableForm} onClick={() => {
                                                      // todo : delete all entries with {category.name} and {step.name}
                                                      const key = categoryValues[category.name]?._steps[step.name]?._costing[0]?.key
                                                      if (key === "null") {
                                                        remove(step.name)
                                                      } else {
                                                        OfftakeService.removeStep(offtake_id, category.name, step.name).then(() => {
                                                          remove(step.name)
                                                          messageApi.success("Step removed")
                                                          getProductionStatuses()
                                                        }).catch(err => {
                                                          messageApi.error(err.message)
                                                          console.log(err);
                                                        })
                                                      }

                                                    }}><CloseRounded /></IconButton>) : null}
                                                  </>

                                                }
                                              >
                                                <Stack direction={'row'} gap={1}>
                                                  <Stack flex={1}>
                                                    <Form.Item
                                                      rules={[{ required: true, message: 'Please enter the name of this step' }]}
                                                      name={[step.name, 'step_name']}
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
                                                          <Stack gap={1} p={1} justifyContent={'space-evenly'} borderRadius={1} bgcolor={i % 2 ? colors.grey[100] : colors.common.white}>
                                                            <Form.Item label="Cost item" name={[item.name, 'cost_name']} rules={[{ required: true }]} >
                                                              <Input />
                                                            </Form.Item>
                                                            <Form.Item hidden initialValue={'null'} name={[item.name, 'key']} >
                                                              <Input disabled />
                                                            </Form.Item>
                                                            <Stack key={item.key} justifyItems={'center'} alignItems={'center'} alignContent={'space-evenly'} justifyContent={'space-evenly'} direction={'row'} spacing={1} >
                                                              <Form.Item label="Cost per unit" initialValue={(0).toFixed(2)} name={[item.name, 'amount']} rules={[{ required: true }]} >
                                                                <InputNumber
                                                                  formatter={formatter}
                                                                  parser={parser}
                                                                  addonBefore={
                                                                    <Form.Item name={[item.name, 'amount_currency_unit']} noStyle initialValue={'ZAR'}>
                                                                      <Select defaultActiveFirstOption={true} defaultValue={'ha'} style={{ minWidth: 40 }} options={currency} />
                                                                    </Form.Item>}
                                                                  onChange={() => {
                                                                    calculateTotalUnitCost(
                                                                      scheduleForm,
                                                                      category.name,  // categoryIndex
                                                                      step.name,   // stepIndex
                                                                      item.name    // itemIndex
                                                                    );
                                                                  }}
                                                                  addonAfter={
                                                                    <Form.Item name={[item.name, 'amount_unit']} noStyle initialValue={'ha'}>
                                                                      <Select defaultActiveFirstOption={true} defaultValue={'ha'} style={{ minWidth: 90 }} options={quantity_used_per_ha} />
                                                                    </Form.Item>}
                                                                />
                                                              </Form.Item>
                                                              <Form.Item label="Application&nbsp;intervals" initialValue={(0).toFixed(2)} name={[item.name, 'interval']} rules={[{ required: true }]} >
                                                                <InputNumber onChange={() => {
                                                                  calculateTotalUnitCost(
                                                                    scheduleForm,
                                                                    category.name,  // categoryIndex
                                                                    step.name,   // stepIndex
                                                                    item.name    // itemIndex
                                                                  );
                                                                }} />
                                                              </Form.Item>
                                                              <Form.Item label="QTY used per Ha/Tunnel" initialValue={0} name={[item.name, 'used_per_hactor']} rules={[{ required: true }]} >
                                                                <InputNumber style={{ minWidth: 130 }} value={0} addonAfter={
                                                                  <Form.Item
                                                                    name={[item.name, 'used_per_hactor_unit']}
                                                                    noStyle
                                                                    initialValue={'kg'}
                                                                  >
                                                                    <Select defaultActiveFirstOption={true} options={quantity_used_per_ha} />
                                                                  </Form.Item>
                                                                }

                                                                  onChange={() => {
                                                                    calculateTotalUnitCost(
                                                                      scheduleForm,
                                                                      category.name,  // categoryIndex
                                                                      step.name,   // stepIndex
                                                                      item.name    // itemIndex
                                                                    );
                                                                  }} />
                                                              </Form.Item>
                                                              {
                                                                getCategoryPhase(category.name) === 'harvesting' && !includeCosting(category.name, step.name, item.name) ||
                                                                  getCategoryPhase(category.name) === 'delivery' && !includeCosting(category.name, step.name, item.name)
                                                                  ? (
                                                                    null
                                                                  )
                                                                  : (
                                                                    <Stack spacing={1} direction={'row'}>
                                                                      {/* <Form.Item hidden initialValue={0} name={[item.name, 'overal_cost']} rules={[{ required: true }]} >
                                                                        <InputNumber style={{ flex: 1, width: '100%' }} value={0} />
                                                                      </Form.Item> */}
                                                                      {/* <Statistic title="Total unit cost" value={getTotalUnitCost(category.name, step.name, item.name)}></Statistic> */}
                                                                      <Form.Item label="Total unit cost" initialValue={0} name={[item.name, 'total_unit_cost']} rules={[{ required: true }]} >
                                                                        <InputNumber
                                                                          formatter={formatter}
                                                                          parser={parser} disabled style={{ flex: 1, width: '100%' }} value={0} />
                                                                      </Form.Item>
                                                                    </Stack>
                                                                  )
                                                              }
                                                              <Stack>
                                                                <Form.Item name={[item.name, 'include_in_cost']} initialValue={false} valuePropName="checked">
                                                                  <Checkbox >Include in cost</Checkbox>
                                                                </Form.Item>
                                                              </Stack>


                                                              <Stack pt={3.5}>
                                                                {i !== 0 ? (<Button onClick={() => {
                                                                  const key = categoryValues[category.name]?._steps[step.name]?._costing[item.name]?.key
                                                                  if (key === "null") {
                                                                    remove(item.name)
                                                                  } else {
                                                                    OfftakeService.removeCostingStep(offtake_id, category.name, step.name, item.name).then(() => {
                                                                      remove(item.name)
                                                                      messageApi.success("Costing removed")
                                                                      getProductionStatuses()
                                                                    }).catch(err => {
                                                                      console.log(err);
                                                                    })
                                                                    // OfftakeService.removeProductionStatus(offtake_id, key).then(() => {
                                                                    //   // remove(category.name);
                                                                    //   remove(item.name)
                                                                    // }).catch(err => {
                                                                    //   console.log(err);
                                                                    //   // 
                                                                    // })
                                                                  }

                                                                }} icon={<DeleteOutlined />} shape='circle'></Button>) : null}
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
                disabled={disableForm}
                onClick={() => { scheduleForm.submit() }}>Save Draft</Button>
              {/* Update status to submitted */}
              {
                OfftakeService.getStatus.Name(offtake?.status) === "planning"
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
    </Layout>
  )
}

export default ProductionScheduling