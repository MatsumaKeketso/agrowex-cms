import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    Avatar,
    Box,
    ButtonBase,
    Divider,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import { Table, Button, Badge, Tag, Drawer, Modal, Input, Form, Checkbox, Switch, Popconfirm } from "antd";
import { useDispatch, useSelector } from "react-redux";
import OfftakeDetails from "../components/OfftakeDetails";
import { setActiveOfftake } from "../services/offtake/offtakeSlice";
import { PManagers } from "../database/db-data";
import { OfftakeService } from "../db/offtake-service";
import StatusTag from "../components/StatusTag";
import { ArrowDownwardRounded, ChatBubble, RefreshRounded } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { AuthService } from "../services/authService";
const _columns = [
    {
        title: 'Customer Id',
        dataIndex: 'offtake_id',
        key: 'offtake_id',
        render: (v, r) => {
            return <Typography noWrap={true} variant="body2">{v}</Typography>
        }
    },
    {
        title: 'Customer',
        dataIndex: 'name',
        key: 'name',
    },
    // {
    //     title: 'Amount',
    //     dataIndex: 'amount',
    //     key: 'amount',
    // },
    {
        title: 'Delivery Date',
        dataIndex: 'delivery_date',
        key: 'delivery_date',
    },
    {
        title: 'Order Date',
        dataIndex: 'order_date',
        key: 'order_date',
    },
    // { // removing reference, can be searched for (maybe)
    //     title: 'Reference',
    //     dataIndex: 'reference',
    //     key: 'refernce',
    // },
    {
        title: 'Contract Type',
        dataIndex: 'supply_duration',
        key: 'supply_duration',
    },


];
const formItemLayout = {
    labelCol: {
        xs: {
            span: 5,
        },
        sm: {
            span: 7,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 24,
        },
    },
};
const Offtake = () => {
    const [openOfftake, setOpenOfftake] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [offtakes, setOfftakes] = useState([])
    const [offtakeBackup, setOfftakeBackup] = useState({})
    const navigate = useNavigate();
    const params = useParams()
    const dispatch = useDispatch();
    const [offtake_id, setOfftake_id] = useState('');
    const offtake = useSelector((state) => state?.active);

    const [confirmForm] = Form.useForm()
    const offtakeUpdated = useSelector((state) => state?.updated);
    const columns = [..._columns,
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (v, r) => {
            return (<Stack sx={{ alignItems: 'flex-start' }}>
                {r.status ? (<StatusTag status={r.status} />) : (<StatusTag status="inprogress" />)}
            </Stack>);
        }
    }, {
        title: 'Actions',
        dataIndex: 'actions',
        fixed: 'right',
        width: 130,
        key: 'actions',
        render: (v, r) => {
            return (<Stack>
                <Button onClick={() => {
                    dispatch(setActiveOfftake(r))
                    dispatch(setActiveOfftake(r))
                    setOfftakeBackup(r)
                    setOpenOfftake(true)
                }}>View More</Button>
            </Stack>)
        }
    },]
    const closeDrawer = (id) => {
        setOpenOfftake(false)
        refresh()
    }
    const setOfftakeId = (id) => {
        setOfftake_id(id)
    }
    const refresh = () => {
        setOfftakes([])
        OfftakeService.getOfftakes().then(data => {
            setOfftakes(data)
        })
    }
    useEffect(() => {
        console.log(offtake);
        OfftakeService.getOfftakes().then(data => {
            setOfftakes(data)
            setOpenOfftake(false)
        }).catch(err => {
            console.log('====================================');
            console.log(err);
            console.log('====================================');
        })
    }, [offtake])
    return (
        <Layout>



            {/* Confirm Assessment */}
            <Modal title="Confirm Assessment" open={openConfirm} onOk={() => {
                confirmForm.submit()
            }} onCancel={() => {
                setOpenConfirm(false)
            }}>
                <Stack gap={3} alignItems={'center'} justifyItems={'center'} justifyContent={'center'}>
                    <Typography variant="h4">Assessment confirmation</Typography>
                    <Stack direction={'row'} alignSelf={'center'} gap={1}>
                        <Typography variant="subtitle2">AGRO-{offtake_id}</Typography>
                        <StatusTag status={'inprogress'} />
                    </Stack>
                    <ArrowDownwardRounded />
                    <Stack direction={'row'} alignSelf={'center'} gap={1}>
                        <Typography variant="subtitle2">AGRO-{offtake_id}</Typography>
                        <StatusTag status={'negotiation'} />
                    </Stack>
                    <Typography variant="subtitle2">
                        Please complete the checklist to confirm the required assessment requirements for the offtake opportunity
                    </Typography>
                    <Stack flex={1} alignItems={'start'}>
                        <Form layout="horizontal" form={confirmForm} onFinish={(v) => {
                            // "/offtakes/:offtake_id/negotiation"
                            AuthService.getUser().then(user => {
                                OfftakeService.getOfftake(offtake_id).then(offtake => {
                                    OfftakeService.updateOfftake(offtake_id, { ...offtake, confirmed: v, status: 'negotiation', pm: user.uid }).then(() => {
                                        navigate(`/offtakes/${offtake_id}/negotiation`);
                                    })
                                })
                            })
                        }}>

                            <Form.Item rules={[{ required: true, }, ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value) {
                                        return Promise.reject('Please confirm offtake details before proceeding.');
                                    }
                                    return Promise.resolve();
                                },
                            }),]} name="confirm_details" label="Offtake details">
                                <Switch />
                            </Form.Item>
                            <Form.Item rules={[{ required: true, }, ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value) {
                                        return Promise.reject('Confirm required documents');
                                    }
                                    return Promise.resolve();
                                },
                            }),]} name="confirm_required_documents" label="Required documents">
                                <Switch />
                            </Form.Item>
                            <Form.Item rules={[{ required: true, }, ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value) {
                                        return Promise.reject('Confirm that\n the Offtake has met the assessment requirements."');
                                    }
                                    return Promise.resolve();
                                },
                            }),]} name="successfuly_met_requirements" tooltip="I confirm that the Offtake has met the assessment requirements." label="Requirements met">
                                <Switch />
                            </Form.Item>

                        </Form>
                    </Stack>

                </Stack>
            </Modal>
            {/* End Confirm assessment */}



            {/* Offtake Details */}
            <Drawer size="large" onClose={() => {
                setOpenOfftake(false)
                setTimeout(() => {
                    dispatch(setActiveOfftake({}));
                }, 1000);
            }} open={openOfftake} extra={
                <Stack direction={'row'} gap={1}>
                    <Popconfirm title="Not Viable" description="Mark this offtake as non viable, meaning we cannot accommodate this request, proceed?" onConfirm={() => {

                    }}>
                        <Button type='text' danger>Not Viable</Button>
                    </Popconfirm>{/* <Button onClick={() => { }}>
                        Pipeline
                    </Button> */}
                    {offtakeBackup?.status === 'negotiation' ? (<Button type="primary" onClick={() => {
                        navigate(`/offtakes/${offtakeBackup.offtake_id}/negotiation`);
                    }} > Open Chat</Button>) : null}
                    {offtakeBackup?.status === 'planning' ? (<Button type="primary" onClick={() => {
                        navigate(`/offtakes/${offtakeBackup.offtake_id}/schedule`);
                    }} > Open Production Schedule</Button>) : null}
                    {!offtakeBackup?.status && (<Button onClick={() => {
                        setOpenOfftake(false)
                        setOpenConfirm(true)

                    }
                    } type="primary">Confirm Assessment</Button>
                    )}

                </Stack>}>
                <OfftakeDetails closeDrawer={closeDrawer} setOfftakeId={setOfftakeId} />
            </Drawer >
            {/* End Offtake details */}



            <Stack position={"relative"} flex={1} p={2} spacing={2}>
                <Stack
                    position={"sticky"}
                    direction={"row"}
                    spacing={2}
                    alignItems={"center"}
                >
                    <Typography variant="h5">Offtakes</Typography>
                    <Box flex={1}></Box>

                </Stack>
                <Table
                    size="small"
                    style={{ height: "100%" }}
                    columns={columns}
                    dataSource={offtakes}
                    scroll={{ y: 700 }}
                />
            </Stack>



        </Layout >
    );
};

export default Offtake;
