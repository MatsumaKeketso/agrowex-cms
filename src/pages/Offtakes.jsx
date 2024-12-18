import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    Avatar,
    Backdrop,
    Box,
    ButtonBase,
    Collapse,
    colors,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import { Table, Button, Badge, Tag, Drawer, Modal, Input, Form, Checkbox, Switch, Popconfirm, Segmented, DatePicker, Spin, Layout as ANTDLayout, List, Card } from "antd";
import { useDispatch, useSelector } from "react-redux";
import OfftakeDetails, { getDaysBetween } from "../components/OfftakeDetails";
import { setActiveOfftake, setPublishState } from "../services/offtake/offtakeSlice";
import { PManagers } from "../database/db-data";
import { OfftakeService, stableOfttakes } from "../services/offtakeService";
import StatusTag from "../components/StatusTag";
import { ArrowDownwardRounded, ArrowDropDown, ArrowDropDownRounded, ArrowUpwardRounded, ChatBubble, CloseRounded, Filter1Rounded, FilterListRounded, RefreshRounded } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { AuthService } from "../services/authService";
import { SystemService } from "../services/systemService";
import dayjs from "dayjs";
import { EditOutlined, EllipsisOutlined, SettingOutlined } from "@ant-design/icons";
import { Permissions } from "../services/system/permissions";
const { Header, Footer, Sider, Content } = ANTDLayout;
const UserProfile = ({ user_id }) => {
    const [user, setUser] = useState({})
    useEffect(() => {
        OfftakeService.getUserProfile(user_id).then((user_profile) => {
            setUser(user_profile)
        })
    }, [])

    return (<>
        {user?.name ? (<Typography variant="body2">{user?.name} {user?.surname}</Typography>) : (<Typography variant="body2">Loading...</Typography>)}
    </>)
}
const _columns = [
    {
        title: 'Offtake Id',
        dataIndex: 'offtake_id',
        key: 'offtake_id',
        responsive: ['lg'],
        render: (v, r) => {
            return <Typography noWrap={true} variant="body2">{v}</Typography>
        }
    },
    {
        title: 'Customer',
        dataIndex: ['_address', 'alias_name'],
        key: 'alias_name',
        render: (v, r) => {
            return (<UserProfile user_id={r.uid} />)
        }
    },
    // {
    //     title: 'Amount',
    //     dataIndex: 'amount',
    //     key: 'amount',
    // },
    {
        title: 'Supply Duration',
        dataIndex: 'supply_duration',
        key: 'supply_duration',
        render: (v, t) => {
            return <>
                {getDaysBetween(v)}
            </>
        }
    },
    {
        title: 'Order Date',
        dataIndex: 'start_date',
        key: 'start_date',
        render: (v, r) => {
            if (r.offtake_start_and_end_date) {
                const startDate = SystemService.formatTimestamp(r.offtake_start_and_end_date[0])
                const endDate = dayjs(r.offtake_start_and_end_date[1])
                return <>{startDate}</>
            } else {
                return <>{SystemService.convertTimestampToDateString(r?.created_at)}</>
            }
        }
    },
    // { // removing reference, can be searched for (maybe)
    //     title: 'Reference',
    //     dataIndex: 'reference',
    //     key: 'refernce',
    // },
    {
        title: 'Contract Type',
        dataIndex: 'contract',
        key: 'contract',
        render: (v, r) => {

            return <Stack> {v ? v : "Pending..."} </ Stack>
        }
    },


];


const AgentListItem = ({ agent, index, onViewClick, activeAgent, agentDataLoading, drawerCollapsed }) => {
    switch (drawerCollapsed) {
        case true:
            return (<Button onClick={() => { onViewClick() }} icon={<Avatar src={agent.img} />} />)
            break;
        case false:
            return (
                <Card
                    style={{
                        width: '100%',
                        background: activeAgent === agent.uid ? colors.green[300] : 'white'
                    }}
                    actions={[
                        <Button type="text" icon={<EllipsisOutlined key="ellipsis" />}></Button>,
                        <Button loading={agentDataLoading} onClick={() => { onViewClick() }} style={{ width: '90%' }}
                        >view offtakes</Button>
                    ]}
                >
                    <Card.Meta
                        avatar={<Avatar src={agent.img} />}
                        title={`${agent.fullnames}`}
                        description={`${agent.email}`}
                    />
                </Card>
            )
            break;

        default:
            break;
    }

}
const Offtake = () => {
    const [openOfftake, setOpenOfftake] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [offtakes, setOfftakes] = useState([])
    const [offtakesReset, setOfftakesReset] = useState([])
    const [offtakeBackup, setOfftakeBackup] = useState({})
    const [offtakeId, setOfftake_id] = useState('');
    const [pageLoading, setPageLoading] = useState(true)
    const [filterOptions, setFilterOptions] = useState(false)
    const [activeAgent, setActiveAgent] = useState('')
    const [agentProfiles, setAgentProfiles] = useState([])
    const [agentDataLoading, setDataLoading] = useState(false)
    const [drawerCollapsed, setDrawerCollapsed] = useState(false)
    const navigate = useNavigate();
    const params = useParams()
    const dispatch = useDispatch();
    const [userRole, setUserRole] = useState('')
    const offtake = useSelector((state) => state?.offtake?.active);
    const user = useSelector((state) => state?.user);
    const [confirmForm] = Form.useForm()
    const offtakeUpdated = useSelector((state) => state?.updated);
    const filterSegmentOptions = [
        { label: 'All', value: 'all' },
        { label: 'In Progress', value: 'inprogress' },
        { label: 'Negotioation', value: 'negotiation' },
        { label: 'Planning', value: 'planning' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Active', value: 'active' },
        { label: 'Not Viable', value: 'notviable' }
    ]
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
            const current_status = OfftakeService.getStatus.Name(r.status)
            switch (current_status) {
                case 'planning':
                    return (<Stack>
                        <Button onClick={() => {
                            dispatch(setActiveOfftake(r))
                            localStorage.setItem(r.offtake_id, r)
                            navigate(`/offtakes/${r.offtake_id}/schedule`)
                        }}>View More</Button>
                    </Stack>)
                    break;
                case 'negotiation':
                    return (<Stack>
                        <Button onClick={() => {
                            dispatch(setActiveOfftake(r))
                            localStorage.setItem(r.offtake_id, r)
                            navigate(`/offtakes/${r.offtake_id}/chat`)
                        }}>View More</Button>
                    </Stack>)
                    break;
                case 'published':
                    return (<Stack>
                        <Button onClick={() => {
                            dispatch(setActiveOfftake(r))
                            localStorage.setItem(r.offtake_id, r)
                            navigate(`/offtakes/${r.offtake_id}/submissions`)
                        }}>View More</Button>
                    </Stack>)
                    break;
                case 'finalstage':
                    return (<Stack>
                        <Button onClick={() => {
                            dispatch(setActiveOfftake(r))
                            localStorage.setItem(r.offtake_id, r)
                            navigate(`/offtakes/${r.offtake_id}/submissions`)
                        }}>View More</Button>
                    </Stack>)
                    break;
                default:
                    return (<Stack>
                        <Button onClick={() => {
                            dispatch(setActiveOfftake(r))
                            localStorage.setItem(r.offtake_id, r)
                            setOfftakeBackup(r)
                            setOpenOfftake(true)
                        }}>View More</Button>
                    </Stack>)
                    break;
            }

        }
    },]
    const filterOfftakesByStatus = (filterValue) => {
        // Assign "inprogress" status to offtakes without a status property
        const updatedOfftakes = offtakesReset.map(offtake => {
            if (!offtake.status) {
                return { ...offtake, status: 'inprogress' };
            }
            return offtake;
        });

        // If the filter value is 'all', return the entire list
        if (filterValue === 'all') {
            setPageLoading(true)
            OfftakeService.getOfftakes().then((data: any) => {
                setOfftakes(data)
                setOfftakesReset(data)
                setPageLoading(false)
            }).catch(err => { console.log(err) })
        }

        // Otherwise, filter the offtakes based on the status
        const filtered = updatedOfftakes.filter(offtake => OfftakeService.getStatus.Name(offtake.status) === filterValue);
        setOfftakes(filtered)
    };
    const closeDrawer = (id) => {
        refresh()
    }
    const setOfftakeId = (id) => {
        setOfftake_id(id)
    }
    const refresh = () => {
        setOfftakes([])
        OfftakeService.getOfftakes().then(data => {
            setOfftakes(data)
            setOfftakesReset(data)
        })
    }
    const getStableOfftakes = async () => {
        console.log('Getting stable offtakes');

        setPageLoading(true)
        setOfftakes([])
        if (user.profile.role == "om") {
            console.log('Role: ', user.profile.role)
            console.log('Getting profiles first');


            //get profiles
            OfftakeService.getPMProfiles().then(res => {
                setAgentProfiles(res)
                setActiveAgent(res[0].uid)
                setPageLoading(false)
            })
        } else if (user.profile.role == "pm") {
            console.log('Role: ', user.profile.role)
            console.log('Getting assigned & new offtakes');
            // procurement manage
            // must only see offtakes assigned their uid
            // must get all inprogress offtakes
            OfftakeService.getOfftakes().then(data => {
                setPageLoading(false)
                const f_offtakes = []
                data.map((_offtake => {
                    const _offtake_status = OfftakeService.getStatus.Name(_offtake?.status)
                    const permitted = Permissions[user.profile.role].read.offtake.status[_offtake_status]
                    const assigned = user.profile.uid === _offtake.pm ? true : false
                    if (permitted) {
                        if (assigned) {
                            f_offtakes.push(_offtake)
                        } else if (OfftakeService.getStatus.Name(_offtake.status) === 'inprogress') {
                            
                            f_offtakes.push(_offtake)
                        }
                    }
                }))
                setOfftakes(f_offtakes)
            })
        }

    }
    useEffect(() => {

        setDataLoading(true)
        OfftakeService.getAgentAssignedOfftakes(activeAgent).then(agentOfftakes => {
            setDataLoading(false)
            const f_offtakes = []

            agentOfftakes.map((_offtake => {
                const _offtake_status = OfftakeService.getStatus.Name(_offtake?.status)
                const permitted = Permissions[user.profile.role].read.offtake.status[_offtake_status]
                if (permitted) {
                    f_offtakes.push(_offtake)
                }
            }))


            setOfftakes(f_offtakes)
        })
    }, [activeAgent])
    useEffect(() => {
        getStableOfftakes()
    }, [user.profile.role])
    useEffect(() => {
        console.log(user.profile.role);
        setUserRole(user.profile.role)

    }, [])
    return (
        <Layout>

            <Backdrop sx={{ zIndex: 99 }} open={pageLoading}>
                <Stack alignItems={'center'} justifyContent={'center'} p={2}>
                    <Spin size="large" />
                </Stack>
            </Backdrop>

            {/* Confirm Assessment */}
            <Modal open={openConfirm} onOk={() => {
                confirmForm.submit()
            }} onCancel={() => {
                setOpenConfirm(false)
            }}>
                <Stack gap={3} pt={3} alignItems={'center'} justifyItems={'center'} justifyContent={'center'}>
                    <Typography variant="h4">Assessment confirmation</Typography>
                    <Stack sx={{ opacity: 0.3 }} direction={'row'} alignSelf={'center'} gap={1}>
                        <Typography variant="subtitle2">{offtakeBackup.offtake_id}</Typography>
                        <StatusTag status={'inprogress'} />
                    </Stack>
                    <ArrowDownwardRounded />
                    <Stack direction={'row'} alignSelf={'center'} gap={1}>
                        <Typography variant="subtitle2">{offtakeBackup.offtake_id}</Typography>
                        <StatusTag status={'negotiation'} />
                    </Stack>
                    <Typography variant="body1">
                        Please complete the checklist to confirm the required assessment requirements for the offtake opportunity
                    </Typography>
                    <Stack width={'100%'} flex={1} alignItems={'start'}>
                        <Form layout="horizontal" form={confirmForm} onFinish={(v) => {
                            // "/offtakes/:offtake_id/negotiation"
                            const _status = {
                                status_name: "negotiation",
                                updated_at: SystemService.generateTimestamp()
                            }
                            AuthService.getUser().then(user => {
                                OfftakeService.updateOfftake(offtakeBackup.offtake_id, { ...offtakeBackup, confirmed: v, assigned_to: user.uid, status: [...offtakeBackup.status, _status] }).then(res => {
                                    confirmForm.resetFields()
                                    setOpenConfirm(false)
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
                localStorage.removeItem(offtakeBackup.offtake_id)
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
                    {OfftakeService.getStatus.Name(offtakeBackup?.status) === 'negotiation' ? (<Button type="primary" onClick={() => {
                        navigate(`/offtakes/${offtakeBackup.offtake_id}/chat`);
                    }} > Open Chat</Button>) : null}
                    {OfftakeService.getStatus.Name(offtakeBackup?.status) === 'planning' ? (<Button type="primary" onClick={() => {
                        navigate(`/offtakes/${offtakeBackup.offtake_id}/schedule`);
                    }} > Open Production Plan</Button>) : null}
                    {OfftakeService.getStatus.Name(offtakeBackup?.status) === 'submitted' ? (<Button type="primary" onClick={() => {
                        dispatch(setPublishState(true))
                    }} > Publish Offtake</Button>) : null}
                    {/* {OfftakeService.getStatus.Name(offtakeBackup?.status)  === 'finalstage' ? (<Button type="primary" onClick={() => {
                      
                    }} >Activate Offtake</Button>) : null} */}
                    {OfftakeService.getStatus.Name(offtakeBackup?.status) === 'inprogress' && (<Button onClick={() => {
                        setOpenOfftake(false)
                        setOpenConfirm(true)
                    }
                    } type="primary">Confirm Assessment</Button>
                    )}

                </Stack>}>
                <OfftakeDetails closeDrawer={closeDrawer} setOfftakeId={setOfftakeId} />
            </Drawer >
            {/* End Offtake details */}


            {user.profile.role === "om" && (
                <ANTDLayout >
                    <Sider collapsible={true} onCollapse={(c) => {
                        setDrawerCollapsed(c)
                    }} collapsed={drawerCollapsed} width="25%" >

                        <ANTDLayout>
                            <Header style={{ fontWeight: 'bold' }}>
                                Agents
                            </Header>
                            <Content>
                                <List
                                    style={{ padding: 20 }}
                                    itemLayout="vertical"
                                    dataSource={agentProfiles}
                                    renderItem={(agent: any, index) => {
                                        return (
                                            <AgentListItem drawerCollapsed={drawerCollapsed} agentDataLoading={agentDataLoading} agent={agent} index={index} activeAgent={activeAgent} onViewClick={() => {
                                                setActiveAgent(agent.uid)
                                            }} />)
                                        return (

                                            <List.Item
                                                actions={[<Button size="small" onClick={() => {
                                                    setActiveAgent(agent.uid)

                                                }} >offtakes</Button>]}
                                            >
                                                <List.Item.Meta
                                                    avatar={<Avatar src={agent.img} />}
                                                    title={`${agent.fullnames}`}
                                                    description={`${agent.email}`} />
                                                {agent.province}, {agent.region}
                                            </List.Item>
                                        )
                                    }}
                                />
                            </Content>
                        </ANTDLayout>

                    </Sider>
                    <ANTDLayout>
                        <Header >Header</Header>
                        <Content >
                            <Table
                                size="small"
                                style={{ height: "100%" }}
                                columns={columns}
                                dataSource={offtakes}
                                scroll={{ y: 700 }}
                            />
                        </Content>
                        <Footer >Footer</Footer>
                    </ANTDLayout>
                </ANTDLayout>
            )}
            {/* Page */}
            {user.profile.role === "pm" && (
                <Stack position={"relative"} flex={1} p={2} spacing={2}>
                    <Stack
                        position={"sticky"}
                        direction={"row"}
                        spacing={2}
                        alignItems={"center"}
                    >
                        <Typography variant="h5">Offtakes</Typography>
                        <Segmented
                            options={filterSegmentOptions}
                            onChange={(value) => {
                                console.log(value); // string
                                filterOfftakesByStatus(value)
                            }}
                        />
                        <IconButton onClick={() => {
                            setFilterOptions(!filterOptions)
                        }}>
                            {filterOptions ? (<CloseRounded />) : (<FilterListRounded />)}
                        </IconButton>
                        <Box flex={1}></Box>
                        <Input.Search style={{ width: 200 }} placeholder="Search Ofttakes..." />
                    </Stack>
                    <Collapse in={filterOptions}>
                        <Stack bgcolor={colors.grey[100]} pt={3} borderRadius={1} px={2}>
                            <Form layout="vertical" onFinish={(v) => {
                                console.log(v);

                            }}>
                                <Stack direction={'row'} gap={1} >
                                    <Form.Item label="Delivery Date" name="deliveryDate" rules={[{ required: true }]}>
                                        <DatePicker.RangePicker picker="date" />
                                    </Form.Item>
                                    <Form.Item label="Due Date" name="dueDate" rules={[{ required: true }]}>
                                        <DatePicker.RangePicker picker="date" />
                                    </Form.Item>
                                    <Stack py={3.8}>
                                        <Button htmlType="submit">Filter</Button>
                                    </Stack>
                                </Stack>
                            </Form>
                        </Stack>
                    </Collapse>
                    <Table
                        size="small"
                        style={{ height: "100%" }}
                        columns={columns}
                        dataSource={offtakes}
                        scroll={{ y: 700 }}
                    />
                </Stack>)
            }




        </Layout >
    );
};

export default Offtake;
