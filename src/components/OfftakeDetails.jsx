import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Backdrop, CardHeader, Chip, Divider, Stack, Toolbar, Typography, colors } from '@mui/material';
import { Button, Collapse, Form, Input, message, Modal, Select, Spin, Statistic, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Statistics, { formatText } from './Statistics';
import currency from "currency.js"
import Persona from './Persona';
// import debounce from 'lodash/debounce';
import { PManagers } from '../database/db-data';
import { offtakeUpdateSuccess, setActiveOfftake, setPublishState } from '../services/offtake/offtakeSlice';
import { ArrowDownwardRounded, CardMembership, FaceOutlined, Person2Outlined } from '@mui/icons-material';
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
const OfftakeDetails = (props) => {
    const [disableForm, setDisableForm] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [farms, setFarms] = useState([])
    const [offtakeBackup, setOfftakeBackup] = useState({})
    const [page, setPage] = useState("")
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const location = useLocation();
    const { offtake_id } = useParams()
    const [offtakeForm] = Form.useForm();
    const { data, setOfftake, closeDrawer, setOfftakeId, showSubmissions = true } = props;
    const offtake = useSelector((state) => state.offtake?.active);

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
        offtakeForm.setFieldValue(formatText("Quantity"), quantity)
        offtakeForm.setFieldValue(formatText("Delivery Frequency"), delivery_frequency)
        offtakeForm.setFieldValue(formatText("Supply Duration"), supply_duration)
        offtakeForm.setFieldValue(formatText("Quality/Grade"), quality_grade)
        offtakeForm.setFieldValue(formatText("Price"), price || 0)
        offtakeForm.setFieldValue("comment", comment || null)

    }, [offtake])
    useEffect(() => {
        OfftakeService.getFarmSubmissions().then(f => {
            setFarms(f)
        })
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
                        <Button type={page === 'chat' ? 'primary' : 'default'} onClick={() => {
                            if (status === 'planning') {
                                navigate(`/offtakes/${ot.offtake_id}/chat`);
                            }
                            else if (status === 'submitted') {
                                navigate(`/offtakes/${ot.offtake_id}/published-chat`)
                            }

                        }}>Chat {status === "published" && "with Sibanyoni"}</Button>
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
                </Stack>
                <Stack direction={'row'} gap={2}>
                    {/* <Statistics inputMode={true} title="Invoice Number" value={112893} /> */}
                    <Statistics title="Start Date & Time" value={order_date} />
                    <Statistics title="Sue Date & Time" value={delivery_date} />
                    <Statistics title="Contract Type" value={contract_type} />
                </Stack>
                <Stack>
                    <Accordion variant='elevation' elevation={0}>
                        <AccordionSummary>
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


                <Stack p={0} direction={'row'} flexWrap={'wrap'} gap={3}>
                    <Statistics title={'Category Type'} value={commodity_name} />
                    <Statistics title={'Product Name'} value={commodity_name} />
                    <Statistics title={'Production Method'} value={production_method} />
                    <Statistics title={'Country of Origin'} value={country} />
                </Stack>


                <Form form={offtakeForm} disabled={disableForm} layout='vertical' onFinish={(v) => {
                    // v = new form properties, default set to merge
                    const a = { ...offtake, ...v }


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
                        <Stack direction={'row'} gap={2}>
                            <Statistics inputMode={true} title="Quantity" />
                            <Statistics inputMode={true} title="Delivery Frequency" value={112893} />
                        </Stack>
                        <Stack direction={'row'} gap={2}>
                            <Statistics inputMode={true} title="Supply Duration" value={112893} />
                            <Statistics inputMode={true} title="Price" value={currency()} />
                            <Statistics inputMode={true} title="Quality/Grade" value={112893} />
                        </Stack>
                        <Stack gap={2}>
                            <Stack>
                                <Form.Item rules={[{ required: true }]} name="comment" label="Comments">
                                    <Input.TextArea placeholder='Send message...' />
                                </Form.Item>
                            </Stack>
                            <Button disabled={!ot.status} htmlType='submit' style={{ alignSelf: 'flex-end' }} type='primary'>Submit</Button>
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