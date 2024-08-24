import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Backdrop, CardHeader, Chip, Divider, Grid, Paper, Stack, Toolbar, Typography, colors } from '@mui/material';
import { Button, Collapse, Form, Input, message, Modal, Segmented, Select, Spin, Statistic, Steps, Switch, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Statistics, { formatText } from './Statistics';
import currency from "currency.js"
import Persona from './Persona';
// import debounce from 'lodash/debounce';
import { PManagers } from '../database/db-data';
import { offtakeUpdateSuccess, setActiveOfftake, setPublishState } from '../services/offtake/offtakeSlice';
import { ArrowDownwardRounded, CardMembership, CheckRounded, CloseRounded, FaceOutlined, Person2Outlined } from '@mui/icons-material';
import Documents from './Documents';
import StatusTag from './StatusTag';
import { OfftakeService } from '../db/offtake-service';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import OfftakeProgress from './OfftakeProgress';
import { FarmSubmissionColumns } from '../pages/FarmSubmissions';

const Assign = () => {
    const [profiles, setProfiles] = useState([]);
    const offtake = useSelector((state) => state.offtake)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    useEffect(() => {
        setProfiles([])
        Object.keys(PManagers).map((uid) => {
            const profile = { ...PManagers[uid], uid: uid }
            setProfiles(prev => [...prev, { profile: profile, label: `${profile.name} | ${profile.department}`, value: profile.name }])
        })
    }, [])

    return (
        <Select loading={loading} disabled={loading} showSearch labelInValue placeholder={loading ? "Assigning..." : "Search..."} options={profiles} onChange={(v, o) => {
            setLoading(true)
            const { profile } = o
            const assigned = { ...offtake.active, assigned: profile }
            setTimeout(() => {
                setLoading(false)
                dispatch(setActiveOfftake(assigned))
            }, 3000);
        }} style={{ width: '40%' }} />)
}
const AssignOM = () => {

}
const PublishOfftake = () => {
    const offtake = useSelector((state) => state.offtake.active)
    const publish = useSelector((state) => state.offtake.publish)
    const [openDrawer, setOpenDrawer] = useState(false);
    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = message.useMessage();
    const dispatch = useDispatch();
    const UpdateStatus = () => {
        setLoading(true)
        OfftakeService.getOfftake(offtake.offtake_id).then(ot => {
            OfftakeService.updateOfftake(offtake.offtake_id, {
                ...ot, status: "published"
            }).then(() => {
                messageApi.success('Offtake Updated!');
                dispatch(setPublishState(false))
                setLoading(false)
            }).catch(err => {
                console.log(err);
                messageApi.error('Update Error')
                setLoading(false)
            })
        })
    }
    useEffect(() => {
        setOpenDrawer(publish)
    }, [publish])
    return (
        <Stack>
            {/* Confirm Assessment */}
            <Modal title="Status Update" open={openDrawer} onOk={() => {
                UpdateStatus()
            }} okButtonProps={{ loading: loading }} onCancel={() => {
                dispatch(setPublishState(false))
            }}>
                <Stack gap={3} alignItems={'center'} justifyItems={'center'} justifyContent={'center'}>
                    <Typography variant="h4">Approve Offtake</Typography>
                    <Stack direction={'row'} alignSelf={'center'} gap={1}>
                        <Typography variant="subtitle2">AGRO-{offtake.offtake_id}</Typography>
                        <StatusTag status={'submitted'} />
                    </Stack>
                    <ArrowDownwardRounded />
                    <Stack direction={'row'} alignSelf={'center'} gap={1}>
                        <Typography variant="subtitle2">AGRO-{offtake.offtake_id}</Typography>
                        <StatusTag status={'published'} />
                    </Stack>
                    <Typography variant="subtitle2">
                        This offtake will be put into active, continue?
                    </Typography>
                </Stack>
            </Modal>
        </Stack>
    )
}
const PermissionControl = ({ label, name, form, value }) => {
    const formatText = (input) => {
        // Replace spaces with underscores
        let snakeCaseString = input.replace(/[^\w\s]/g, '_') // Replace non-word characters (except underscores) with underscores
            .replace(/\s+/g, '_')       // Replace spaces with underscores
            .toLowerCase();             // Convert to lowercase 
        return snakeCaseString;
    }
    const nameValue = form.getFieldValue(formatText(label));

    return (
        <Form.Item valuePropName="checked" style={{ flex: 1 }} name={name}>
            <Stack flex={1} gap={1}>
                <Typography mx={1}>{label}</Typography>
                <Paper sx={{ borderRadius: 7 }} variant='outlined'>
                    <Stack p={1} direction={'row'} gap={1} alignItems={'center'}>
                        <Typography flex={1}>{value} </Typography>
                        <Switch onChange={(v) => {
                            form.setFieldValue(name, v)
                        }} />
                    </Stack>
                </Paper>
            </Stack>
        </Form.Item>
    )
}
const OfftakeDetails = (props) => {
    const [disableForm, setDisableForm] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [farms, setFarms] = useState([])
    const [offtakeBackup, setOfftakeBackup] = useState({})
    const [activeSuppliers, setActiveSuppliers] = useState([])
    const [page, setPage] = useState("")
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const location = useLocation();
    const [productionProgress, setProductionProgress] = useState([])
    const { offtake_id } = useParams()
    const [offtakeForm] = Form.useForm();
    const [contractModelForm] = Form.useForm();
    const { data, setOfftake, closeDrawer, setOfftakeId, showSubmissions = true } = props;
    const offtake = useSelector((state) => state.offtake?.active);
    const [contractModel, setContractModel] = useState([])
    const description = 'This is a description.';
    const {
        order_date,
        delivery_date,
        contract_type,
        country,
        phone_number,
        email,
        commodity_name,
        status,
        production_method,
        quantity,
        delivery_frequency,
        supply_duration,
        quality_grade,
        permissions,
        // offtake_id,
        price,
        comment
    } = useSelector((state) => state.offtake?.active);
    const ot = useSelector((state) => state.offtake?.active);

    const unassign = () => {
        const unassigned = { ...offtake.active, assigned: null }
        dispatch(setActiveOfftake(unassigned))
    }

    useEffect(() => {
        const locations = location.pathname.split('/')
        console.log(locations);
        setPage(locations[3])
        if (!offtake_id) {
            navigate('/offtakes')
        }
        setOfftakeId(offtake_id)
        if (permissions) {
            Object.keys(permissions).map(key => {
                console.log(key);

            })
        } else {
            console.log('permissions not available');

        }

    }, [offtake])
    useEffect(() => {
        var list = []
        Array(7).fill().map((_, v) => {
            list.push({ value: `option${v}`, label: `Option ${v}` })
        })
        setContractModel(list)
        OfftakeService.getFarmSubmissions().then(f => {
            if (f) {
                setFarms(f)
            }
        })
        if (offtake.schedule) {
            try {
                if (offtake.schedule.steps) {
                    const a = []
                    offtake.schedule.steps.forEach(step => {
                        a.push({ title: step.name })
                    });
                    setProductionProgress(a)
                    console.log(a);

                }
            } catch (error) {
                console.log(error);

            }
        }
        if (offtake.suppliers) {
            var a = []
            offtake.suppliers.forEach(supplier => {
                a.push(supplier)
            });
            setActiveSuppliers(a)
        }
    }, [])
    return (
        <Stack spacing={3}>
            <PublishOfftake />
            {contextHolder}
            <Stack gap={4}>
                <Stack direction={'row'}>
                    <Stack flex={1} direction={'row'} gap={2} alignItems={'center'}>
                        <Stack>
                            <Typography variant='h5'>Offtake Details</Typography>
                            <Typography variant='caption'>{offtake_id}</Typography>
                        </Stack>
                        {ot.status ? (<StatusTag status={ot.status} />) : (<StatusTag status="inprogress" />)}
                    </Stack>
                    {/* {offtake?.assigned && (<Persona user={offtake?.assigned} onUnsasign={unassign} />)} */}
                    {/* {!offtake?.assigned && (<Assign />)} */}
                </Stack>
                <Stack sx={{ overflowX: 'auto' }} py={2}>
                    <OfftakeProgress currentStage={ot.status ? ot.status : "inprogress"} />
                </Stack>
            </Stack>
            <Stack spacing={2}>
                {/* Offtake is in planning */}
                <Stack gap={2}>
                    <Divider >Production</Divider>
                    <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
                        <Button type={page === 'schedule' ? 'primary' : 'default'} onClick={() => {
                            navigate(`/offtakes/${ot.offtake_id}/schedule`);
                        }}>Production Plan</Button>
                        <Button type={page === 'costing' ? 'primary' : 'default'} onClick={() => {
                            navigate(`/offtakes/${ot.offtake_id}/costing`);
                        }}>Production Cost</Button>
                        {status === 'published' && (
                            <Button>Upload Master Contract</Button>
                        )}
                        <Button type={page === 'chat' ? 'primary' : 'default'} onClick={() => {
                            if (status === 'planning') {
                                navigate(`/offtakes/${ot.offtake_id}/chat`);
                            }
                            else if (status === 'submitted') {
                                navigate(`/offtakes/${ot.offtake_id}/published-chat`)
                            }

                        }}>Chat {status === "published" && "with PM"}</Button>

                    </Stack>
                    <Divider />
                    {ot.status === 'published' && showSubmissions && (<Stack>
                        <Stack p={2} direction={'row'}>
                            <Stack flex={1}>
                                <Typography>Farmers who are Interested</Typography>
                            </Stack>
                            <Button type='primary' onClick={() => {
                                "/offtakes/:offtake_id/submissions"
                                navigate(`/offtakes/${offtake_id ? offtake_id : ot.offtake_id}/submissions`)
                            }}>View More</Button>
                        </Stack>
                        <Table dataSource={farms} columns={[
                            {
                                title: 'Farm Name',
                                dataIndex: 'name',
                                key: 'name',
                            },
                            {
                                title: 'Suggested Offer',
                                dataIndex: ['offers', 'suggestedOffer'], // Accessing nested property
                                key: 'suggestedOffer',
                            },
                            {
                                title: 'Requested Offer',
                                dataIndex: ['offers', 'requestedOffer'], // Accessing nested property
                                key: 'requestedOffer',
                            },

                        ]} />
                    </Stack>)}
                    {ot.status === 'finalstage' && showSubmissions && (<Stack>
                        <Stack p={2} direction={'row'}>
                            <Stack flex={1}>
                                <Typography>Farmers who are Interested</Typography>
                            </Stack>
                            <Button type='primary' onClick={() => {
                                "/offtakes/:offtake_id/submissions"
                                navigate(`/offtakes/${offtake_id ? offtake_id : ot.offtake_id}/submissions`)
                            }}>View More</Button>
                        </Stack>
                        <Table dataSource={farms} columns={[
                            {
                                title: 'Farm Name',
                                dataIndex: 'name',
                                key: 'name',
                            },
                            {
                                title: 'Suggested Offer',
                                dataIndex: ['offers', 'suggestedOffer'], // Accessing nested property
                                key: 'suggestedOffer',
                            },
                            {
                                title: 'Requested Offer',
                                dataIndex: ['offers', 'requestedOffer'], // Accessing nested property
                                key: 'requestedOffer',
                            },

                        ]} />
                    </Stack>)}
                    {ot.status === 'active' && showSubmissions && (
                        <Stack>
                            <Stack p={2} direction={'row'}>
                                <Stack flex={1}>
                                    <Typography>Suppliers</Typography>
                                </Stack>
                                <Button type='primary' onClick={() => {
                                    "/offtakes/:offtake_id/submissions"
                                    navigate(`/offtakes/${offtake_id ? offtake_id : ot.offtake_id}/submissions`)
                                }}>View More</Button>
                            </Stack>
                            <Stack direction={'row'}>
                                <Stack flex={1}>
                                    <Table dataSource={activeSuppliers} columns={[
                                        {
                                            title: 'Farm Name',
                                            dataIndex: 'name',
                                            key: 'name',
                                        },
                                        {
                                            title: 'Suggested Offer',
                                            dataIndex: ['offers', 'suggestedOffer'], // Accessing nested property
                                            key: 'suggestedOffer',
                                        },
                                        {
                                            title: 'Requested Offer',
                                            dataIndex: ['offers', 'requestedOffer'], // Accessing nested property
                                            key: 'requestedOffer',
                                        },

                                    ]} />
                                </Stack>
                            </Stack>

                        </Stack>
                    )}
                    {ot.status === 'active' && (
                        <Stack >
                            <Stack p={2}>
                                <Typography variant='subtitle1' fontWeight={'bold'}>Production Tracker</Typography>
                            </Stack>
                            <Stack p={2}>
                                <Steps
                                    direction="vertical"
                                    current={1}
                                    items={productionProgress}
                                />
                            </Stack>
                        </Stack>
                    )}
                </Stack>
                <Stack direction={'row'} gap={2}>
                    {/* <Statistics inputMode={true} title="Invoice Number" value={112893} /> */}
                    <Statistics title="Start Date & Time" value={order_date} />
                    <Statistics title="Sue Date & Time" value={delivery_date} />
                    <Statistics title="Contract Type" value={contract_type} />
                </Stack>
                <Stack>
                    <Accordion variant='elevation' elevation={0}>
                        <AccordionSummary sx={{ px: 0 }}>
                            <Chip icon={<FaceOutlined />} label="Contact Details" />
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack p={0} direction={'row'} gap={3}>
                                <Statistics title={'Phone Number'} value={phone_number} />
                                <Statistics title={'Email'} value={email} />
                                <Statistics title={'Location'} value={country} />
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                </Stack>

                <Form form={contractModelForm} layout='vertical' onFinish={(v) => {
                    OfftakeService.updateContractModel(offtake_id, v.contractModel).then(() => {
                        console.log('updated');

                    })
                }}>
                    <Stack direction={'row'} gap={1} alignItems={'center'}>
                        <Form.Item name="contractModel" label="Contract Model" rules={[{ required: true }]}>
                            <Select
                                style={{ width: 400 }}
                                placeholder="Please select a model..."
                                options={contractModel}
                                onChange={(v) => {
                                    console.log(v);

                                }}
                            />
                        </Form.Item>
                        <Button type='primary' htmlType='submit'>Update</Button>
                    </Stack>
                </Form>
                <Statistics title={'Country of Origin'} value={country} />
                <Form
                    initialValues={{
                        contract_type: false
                    }}
                    name='permissions'
                    form={offtakeForm}
                    // disabled={disableForm}
                    layout='vertical'
                    onFinish={(v) => {

                        // v = new form properties, default set to merge
                        const permissions = {
                            category: false,
                            produceName: false,
                            productionMethod: false,
                            totalOrderQuantity: false,
                            deliveryFrequency: false,
                            inputInvestment: false,
                            supplyDuration: false,
                            offerPricePerUnit: false,
                            quality: false
                        }
                        const a = { ...offtake, permissions: v }

                        OfftakeService.updateOfftake(
                            offtake_id ?
                                offtake_id :
                                offtake.offtake_id, a
                        ).then(() => {
                            // OfftakeService.getOfftake(offtake_id).then(data => {
                            if (closeDrawer) {
                                closeDrawer(offtake_id)
                            }
                            // })
                            dispatch(offtakeUpdateSuccess(true))
                            setTimeout(() => {
                                dispatch(offtakeUpdateSuccess(false))
                            }, 1000);
                            messageApi.success("Offtake Updated");
                        }).catch(err => {
                            messageApi.error("Something went wrong");
                            console.log(err);
                            console.log({ offtake_id, a });

                        })
                    }} >
                    <Stack bgcolor={colors.grey[100]} p={3} borderRadius={4} gap={3}>
                        <Grid flex={1} container gap={0}>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1} >
                                <PermissionControl label={"Cateogry/Type"} name={"commodity_name"} value={commodity_name} form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Product Name"} name="produce_name" form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Production Method"} name="production_method" value={production_method} form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Total Order Quanitity"} name="quantity" value={quantity} form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Delivery Frequency"} name="delivery_frequency" form={offtakeForm} value={delivery_frequency} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Do You Provide Input Investment?"} name="input_investment" form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Supply Duration"} name="supply_duration" value={supply_duration} form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Offer price Per Unit"} name="price" value={price} form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Quality/Grade"} name="quality_grade" value={quality_grade} form={offtakeForm} />
                            </Grid>
                        </Grid>
                        <Stack gap={2}>
                            <Button
                                htmlType='submit'
                                style={{ alignSelf: 'flex-end' }}
                                type='primary'>Submit</Button>
                        </Stack>
                    </Stack>
                </Form>
                <Divider></Divider>

                <Stack sx={{ overflowX: 'auto' }} direction={'row'} alignItems={'center'} gap={1}>
                    <Documents />
                    <Documents />
                    <Documents />
                    <Documents upload={true} />
                </Stack>
            </Stack>
        </Stack>
    )
}

export default OfftakeDetails