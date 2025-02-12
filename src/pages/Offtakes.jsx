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
import { Table, Button, Badge, Tag, Drawer, Modal, Input, Form, Collapse as ANTDCollapse, Checkbox, Switch, Popconfirm, Segmented, DatePicker, Spin, Layout as ANTDLayout, List, Card, message, Avatar as ANTDAvatar, Typography as ATypo, Select, Upload, Rate } from "antd";
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
import { EditOutlined, EllipsisOutlined, IdcardOutlined, MailOutlined, PhoneOutlined, SettingOutlined, UserOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { Permissions } from "../services/system/permissions";
import { AgentService } from "../services/agentService";
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
            return <ATypo.Text copyable variant="body2">{v}</ATypo.Text>
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

const AgentForm = ({ activeAgent, form }) => {

    const [imageUrl, setImageUrl] = useState("https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/adminImgs%2F1612030262597?alt=media&token=9e9b2d37-606f-47ea-968c-085c0e1666d2");
    const initialValues = {
        email: "orh45089@zwoho.com",
        fullnames: "Jess Mahlobo",
        role: "admin",
        uid: "pEfoEZp6VXQwwUZGn9xwg77V76H2",
        region: "Johannesburg, Soweto",
        empNo: "AWD-00003",
        province: "Gauteng",
        phone: "0783432222",
    };
    const handleSubmit = (values) => {
        console.log('Form values:', values);
        // Add your update logic here (e.g., Firebase update)
        message.success('Profile updated successfully');
    };

    const handleImageUpload = (info) => {
        if (info.file.status === 'done') {
            // When image upload is successful
            message.success(`${info.file.name} file uploaded successfully`);
            // You would typically get the uploaded image URL here
            // setImageUrl(uploadedImageUrl);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };
    const setFormValues = (values) => {

    }
    const generateProfiles = () => {
        const pm_profiles = [
            // PM Profiles
            {
                email: "michael.scott@agrowex.com",
                fullnames: "Michael Scott",
                role: "pm",
                uid: "PM001-MichaelScott",
                region: "Johannesburg, Sandton",
                timestamp: 1623456789012,
                empNo: "AWD-PM-0001",
                province: "Gauteng",
                img: "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/profileImgs%2Fmichael-scott.jpg",
                phone: "0721234567",
                key: "PM001-MichaelScott"
            },
            {
                email: "lisa.chen@agrowex.com",
                fullnames: "Lisa Chen",
                role: "pm",
                uid: "PM002-LisaChen",
                region: "Cape Town, Waterfront",
                timestamp: 1624567890123,
                empNo: "AWD-PM-0002",
                province: "Western Cape",
                img: "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/profileImgs%2Flisa-chen.jpg",
                phone: "0732345678",
                key: "PM002-LisaChen"
            },
            {
                email: "raj.patel@agrowex.com",
                fullnames: "Raj Patel",
                role: "pm",
                uid: "PM003-RajPatel",
                region: "Durban, Umhlanga",
                timestamp: 1625678901234,
                empNo: "AWD-PM-0003",
                province: "KwaZulu-Natal",
                img: "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/profileImgs%2Fraj-patel.jpg",
                phone: "0743456789",
                key: "PM003-RajPatel"
            },
        ];
        const om_profiles = [

            // OM Profiles
            {
                email: "sarah.johnson@agrowex.com",
                fullnames: "Sarah Johnson",
                role: "om",
                uid: "OM001-SarahJohnson",
                region: "Pretoria, Menlyn",
                timestamp: 1626789012345,
                empNo: "AWD-OM-0001",
                province: "Gauteng",
                img: "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/profileImgs%2Fsarah-johnson.jpg",
                phone: "0754567890",
                key: "OM001-SarahJohnson"
            },
            {
                email: "david.wu@agrowex.com",
                fullnames: "David Wu",
                role: "om",
                uid: "OM002-DavidWu",
                region: "Port Elizabeth, Summerstrand",
                timestamp: 1627890123456,
                empNo: "AWD-OM-0002",
                province: "Eastern Cape",
                img: "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/profileImgs%2Fdavid-wu.jpg",
                phone: "0765678901",
                key: "OM002-DavidWu"
            },
            {
                email: "emma.rodriguez@agrowex.com",
                fullnames: "Emma Rodriguez",
                role: "om",
                uid: "OM003-EmmaRodriguez",
                region: "Bloemfontein, Westdene",
                timestamp: 1628901234567,
                empNo: "AWD-OM-0003",
                province: "Free State",
                img: "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/profileImgs%2Femma-rodriguez.jpg",
                phone: "0776789012",
                key: "OM003-EmmaRodriguez"
            },

        ]
        const admin_profile = [

            // Admin Profiles
            {
                email: "james.miller@agrowex.com",
                fullnames: "James Miller",
                role: "admin",
                uid: "ADMIN001-JamesMiller",
                region: "Johannesburg, Rosebank",
                timestamp: 1629012345678,
                empNo: "AWD-ADMIN-0001",
                province: "Gauteng",
                img: "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/profileImgs%2Fjames-miller.jpg",
                phone: "0787890123",
                key: "ADMIN001-JamesMiller"
            },
            {
                email: "alice.kim@agrowex.com",
                fullnames: "Alice Kim",
                role: "admin",
                uid: "ADMIN002-AliceKim",
                region: "Cape Town, Sea Point",
                timestamp: 1630123456789,
                empNo: "AWD-ADMIN-0002",
                province: "Western Cape",
                img: "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/profileImgs%2Falice-kim.jpg",
                phone: "0798901234",
                key: "ADMIN002-AliceKim"
            },
            {
                email: "omar.hassan@agrowex.com",
                fullnames: "Omar Hassan",
                role: "admin",
                uid: "ADMIN003-OmarHassan",
                region: "Durban, Umhlanga Rocks",
                timestamp: 1631234567890,
                empNo: "AWD-ADMIN-0003",
                province: "KwaZulu-Natal",
                img: "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/profileImgs%2Fomar-hassan.jpg",
                phone: "0809012345",
                key: "ADMIN003-OmarHassan"
            }
        ]
        const pmuids = [
            '7jDlfKGAPOWTjyntsG5JKpgEQ9i1',
            'OxtToVMnPzYVFLOxzxcX0V0SsHu1',
            'KBxJxWPtfCUyfKsKID5CyjG1V2j2'
        ]
        const omuids = [
            '4Dl5UE9uOmgsXhLDf9QuzhmCjHg2',
            '7UOUXqyWLrgchNshUXQndlBqwsu2',
            'MrINh5uHjFPqTaggg9FYmfya63j2'
        ]
        const adminuids = [
            'g19biTtG41YS38ZyKkoVBKVcniy2',
            'JBUPW6sqRjSNJivLX5HEE1lWeO02',
            'vqYyqc72LvSwjM8YN4sy7nGFZo42'
        ]
        pmuids.map((uid, i) => {
            AgentService.updateAgentProfile(uid, pm_profiles[i])
        })
        omuids.map((uid, i) => {
            AgentService.updateAgentProfile(uid, om_profiles[i])
        })
        adminuids.map((uid, i) => {
            AgentService.updateAgentProfile(uid, admin_profile[i])
        })
    }
    useEffect(() => {
        setImageUrl(activeAgent.img)
        form.setFieldsValue({
            fullnames: activeAgent?.fullnames,
            email: activeAgent?.email,
            role: activeAgent?.role,
            region: activeAgent?.region,
            empNo: activeAgent?.empNo,
            province: activeAgent?.province,
            phone: activeAgent?.phone
        });
    }, [activeAgent])
    return (
        <Card
            title="User Profile"
            extra={<Button onClick={() => {
                generateProfiles()
            }}>Reset Defaults</Button>}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={handleSubmit}
            >    <Form.Item
                name="profileImage"
                label="Profile Image"
            >
                    <Upload
                        name="avatar"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        onChange={handleImageUpload}
                    >
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="avatar"
                                style={{ width: '100%', borderRadius: '8px' }}
                            />
                        ) : (
                            <div>
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>
                <Form.Item
                    name="fullnames"
                    label="Full Names"
                    rules={[{ required: true, message: 'Please input your full names' }]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Full Names"
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Please input your email' },
                        { type: 'email', message: 'Please enter a valid email' }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="Email"
                    />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please input your phone number' }]}
                >
                    <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Phone Number"
                    />
                </Form.Item>

                <Form.Item
                    name="empNo"
                    label="Employee Number"
                    rules={[{ required: true, message: 'Please input your employee number' }]}
                >
                    <Input
                        prefix={<IdcardOutlined />}
                        placeholder="Employee Number"
                    />
                </Form.Item>

                <Form.Item
                    name="role"
                    label="Role"
                    rules={[{ required: true, message: 'Please select your role' }]}
                >
                    <Select placeholder="Select Role">
                        <Select.Option value="admin">Admin</Select.Option>
                        <Select.Option value="pm">Procurement Manager</Select.Option>
                        <Select.Option value="om">Opps Manager</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="province"
                    label="Province"
                    rules={[{ required: true, message: 'Please select your province' }]}
                >
                    <Select placeholder="Select Province">
                        <Select.Option value="Gauteng">Gauteng</Select.Option>
                        <Select.Option value="Western Cape">Western Cape</Select.Option>
                        <Select.Option value="KwaZulu-Natal">KwaZulu-Natal</Select.Option>
                        {/* Add more provinces */}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="region"
                    label="Region"
                    rules={[{ required: true, message: 'Please input your region' }]}
                >
                    <Input placeholder="Region" />
                </Form.Item>


                <Stack pt={5}>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Update Profile
                        </Button>
                    </Form.Item>
                </Stack>

            </Form>
        </Card>
    )
}

const Offtake = () => {
    const [openOfftake, setOpenOfftake] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [doneConfirm, setDoneConfirm] = useState(false);
    const [offtakes, setOfftakes] = useState([])
    const [offtakesReset, setOfftakesReset] = useState([])
    const [offtakeBackup, setOfftakeBackup] = useState({})
    const [offtakeId, setOfftake_id] = useState('');
    const [pageLoading, setPageLoading] = useState(true)
    const [filterOptions, setFilterOptions] = useState(false)
    const [activeAgent, setActiveAgent] = useState('')
    const [activeAgentProfile, setActiveAgentProfile] = useState({})
    const [agentProfiles, setAgentProfiles] = useState([])
    const [agentDataLoading, setDataLoading] = useState(false)
    const [permissions, setPermissions] = useState({})
    const [drawerCollapsed, setDrawerCollapsed] = useState(false)
    const [settingsContent, setSettingsContent] = useState("permissions")
    const [agentForm] = Form.useForm()
    const navigate = useNavigate();
    const params = useParams()
    const dispatch = useDispatch();
    const [userRole, setUserRole] = useState('')
    const offtake = useSelector((state) => state?.offtake?.active);
    const user = useSelector((state) => state?.user);
    const [confirmForm] = Form.useForm()
    const [doneForm] = Form.useForm()
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
            return (
                <Stack sx={{ alignItems: 'flex-start' }}>
                    {r.status ? (<StatusTag status={r.status} />) : (<StatusTag status="inprogress" />)}
                </Stack>
            );
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
                case 'contracting':
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
            return offtake;
        });

        // If the filter value is 'all', return the entire list
        if (filterValue === 'all') {
            setPageLoading(true)
            getStableOfftakes()
            setPageLoading(false)
            return
        }

        // Otherwise, filter the offtakes based on the status
        const filtered = updatedOfftakes.filter(offtake => OfftakeService.getStatus.Name(offtake.status) === filterValue);
        setOfftakes(filtered)
    };
    const closeDrawer = (id) => {
        refresh()
    }
    const handleToggleChange = (role, section, subsection, field) => (checked) => {
        try {
            // Create a new permissions object with the updated value
            const newPermissions = { ...permissions };

            // Deep clone and update the specific nested field
            const updateNestedObject = (obj) => {
                const newObj = { ...obj };
                newObj[section] = { ...newObj[section] };
                newObj[section][subsection] = {
                    ...newObj[section][subsection],
                    status: {
                        ...newObj[section][subsection].status,
                        [field]: checked
                    }
                };
                return newObj;
            };

            newPermissions[role] = updateNestedObject(permissions[role]);

            // Update local state
            setPermissions(newPermissions);

            // Update Firestore document
            SystemService.updatePermissions(newPermissions).then(() => {
                // Show success message
                console.log('Permissions updated');


            })

        } catch (error) {
            // Revert local state if update fails
            setPermissions(permissions);
            message.error('Failed to update permissions');
            console.error('Error updating permissions:', error);
        }
    };
    const renderStatusToggles = (role) => {
        const status = permissions[role]?.read?.offtake?.status || {};
        return Object.keys(status).map(field => (
            <Form.Item
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                valuePropName="checked"
            >
                <Switch
                    checked={status[field]}
                    onChange={handleToggleChange(role, 'read', 'offtake', field)}
                />
            </Form.Item>
        ));
    };

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
        setPageLoading(true)
        setOfftakes([])
        if (user.profile.role == "om") {
            //get profiles
            OfftakeService.getPMProfiles().then(res => {
                setAgentProfiles(res)
                setActiveAgent(res[0].uid)
                setPageLoading(false)
            })
        } else if (user.profile.role == "pm") {
            // procurement manage
            // must only see offtakes assigned their uid
            // must get all inprogress offtakes
            // todo: move permissions to firebase
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
        } else if (user.profile.role == "admin") {
            // get permissions from db
            SystemService.getPermissions().then(_permissions => {
                setPermissions(_permissions)
                AgentService.getAgentProfiles().then(res => {
                    console.log(res);

                    setAgentProfiles(res)
                    setPageLoading(false)
                })
            })
        }

    }
    useEffect(() => {

        setDataLoading(true)
        OfftakeService.getAgentAssignedOfftakes(activeAgent).then(agentOfftakes => {
            setDataLoading(false)
            const f_offtakes = []

            agentOfftakes.map((_offtake => {
                // need to move this to firebase
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

            {/* Confirm assessment */}
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
                                OfftakeService.updateOfftake(offtakeBackup.offtake_id, { ...offtakeBackup, confirmed: v, assigned_to: user.uid, pm: user.uid, status: [...offtakeBackup.status, _status] }).then(res => {
                                    confirmForm.resetFields()
                                    getStableOfftakes()
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
            {/* End confirm assessment */}

            {/* Complete offtake */}
            {/* 
            Offtake AGREF-OF-1737812853354 is marked as done with a rating and comment in the status object
            */}
            <Modal
                open={doneConfirm}
                onOk={() => {
                    doneForm.submit()
                }}
                onCancel={() => {
                    setDoneConfirm(false)
                }}>
                <Stack gap={3} pt={3} alignItems={'center'} justifyItems={'center'} justifyContent={'center'}>
                    <Typography variant="h4">Completion Confirmation</Typography>
                    <Stack sx={{ opacity: 0.3 }} direction={'row'} alignSelf={'center'} gap={1}>
                        <Typography variant="subtitle2">{offtakeBackup.offtake_id}</Typography>
                        <StatusTag status={'active'} />
                    </Stack>
                    <ArrowDownwardRounded />
                    <Stack direction={'row'} alignSelf={'center'} gap={1}>
                        <Typography variant="subtitle2">{offtakeBackup.offtake_id}</Typography>
                        <StatusTag status={'done'} />
                    </Stack>
                    <Typography variant="body1">
                        Please confirm offtake completion
                    </Typography>
                    <Stack width={'100%'} flex={1} alignItems={'start'}>
                        <Form
                            style={{ width: '100%' }}
                            layout="vertical"
                            form={doneForm}
                            onFinish={(v) => {
                                // "/offtakes/:offtake_id/negotiation"
                                const _status = {
                                    status_name: "done",
                                    updated_at: SystemService.generateTimestamp(),
                                    comment: v.completion_comment,
                                    rating: v.completion_rating
                                }
                                AuthService.getUser().then(user => {
                                    OfftakeService.updateOfftake(offtakeBackup?.offtake_id, { ...offtakeBackup, confirmed: v, assigned_to: user.uid, pm: user.uid, status: [...offtakeBackup?.status, _status] }).then(res => {
                                        doneForm.resetFields()
                                        getStableOfftakes()
                                        setDoneConfirm(false)
                                    })
                                })

                            }}>
                            <Stack flex={1} pt={3} alignItems={'center'}>
                                <Form.Item rules={[{ required: true }]} initialValue={2.5} name="completion_rating">
                                    <Rate allowHalf allowClear />
                                </Form.Item>
                                <Form.Item style={{ width: "100%" }} rules={[{ required: true }]} name="completion_comment" label="Comment">
                                    <Input.TextArea style={{ width: '100%' }} cols={5} />
                                </Form.Item>

                            </Stack>
                        </Form>
                    </Stack>

                </Stack>
            </Modal>
            {/* End complete offtake */}

            {/* Offtake Details */}
            <Drawer title="Offtake Details" size="large" onClose={() => {
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
                        if (offtake?.contract_model) { dispatch(setPublishState(true)) } else {
                            message.error("Please select Contract Model")
                            setOpenOfftake(false)
                            localStorage.removeItem(offtakeBackup.offtake_id)
                            setTimeout(() => {
                                dispatch(setActiveOfftake({}));
                            }, 1000);
                        }
                    }} > Publish Offtake</Button>) : null}
                    {/* {OfftakeService.getStatus.Name(offtakeBackup?.status)  === 'contracting' ? (<Button type="primary" onClick={() => {
                      
                    }} >Activate Offtake</Button>) : null} */}
                    {OfftakeService.getStatus.Name(offtakeBackup?.status) === 'inprogress' && (<Button onClick={() => {
                        setOpenOfftake(false)
                        setOpenConfirm(true)
                    }
                    } type="primary">Confirm Assessment</Button>
                    )}
                    {OfftakeService.getStatus.Name(offtakeBackup?.status) === 'active' && (<Button onClick={() => {
                        setDoneConfirm(true)
                    }
                    } type="primary">Done</Button>
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
                        onChange={(c) => {
                            console.log(c)
                        }}
                        size="small"
                        style={{ height: "100%" }}
                        columns={columns}
                        dataSource={offtakes}
                        scroll={{ y: 700 }}
                    />
                </Stack>)
            }

            {user.profile.role === "admin" && (
                <ANTDLayout>
                    <Header>
                        <Segmented
                            options={[{ label: 'Settings', value: 'settings' }]}
                            onChange={(value) => {
                                console.log(value); // string
                            }}
                        />
                    </Header>
                    <Content>
                        <ANTDLayout>
                            <Sider width={400} >
                                <Stack p={2}>
                                    <Stack p={2}>
                                        <Typography variant="subtitle1">Settings</Typography>
                                    </Stack>
                                    <List
                                        className="demo-loadmore-list"
                                        itemLayout="horizontal"
                                        dataSource={[{ title: 'Permissions', value: 'permissions', icon: <SettingOutlined /> }, { title: 'Accounts', value: 'accounts', icon: <UserSwitchOutlined /> }]}
                                        renderItem={(item) => (
                                            <List.Item
                                                style={{ background: settingsContent === item.value ? colors.grey[300] : 'white' }}
                                                actions={[<Button onClick={() => {
                                                    setSettingsContent(item.value)
                                                }}>View</Button>]}
                                            >
                                                <List.Item.Meta
                                                    avatar={<Avatar >{item.icon}</Avatar>}
                                                    title={<a href="https://ant.design">{item.title}</a>}
                                                    description="Grant agents permissions"
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Stack>

                            </Sider>
                            <ANTDLayout>
                                <Content>
                                    {settingsContent === "permissions" ? (
                                        <Stack bgcolor={'white'}>
                                            <Card title="Permissions Configuration">
                                                <ANTDCollapse defaultActiveKey={['1', '2']}>
                                                    <ANTDCollapse.Panel header="Operation Manager Permissions" key="1">
                                                        <Form layout="horizontal">
                                                            {renderStatusToggles('om')}
                                                        </Form>
                                                    </ANTDCollapse.Panel>
                                                    <ANTDCollapse.Panel header="Procurement Manager Permissions" key="2">
                                                        <Form layout="horizontal">
                                                            {renderStatusToggles('pm')}
                                                        </Form>
                                                    </ANTDCollapse.Panel>
                                                </ANTDCollapse>
                                            </Card>
                                        </Stack>
                                    ) : null}
                                    {settingsContent === "accounts" ? (
                                        <Stack bgcolor={'white'}>
                                            <Card title="Accounts">
                                                <ANTDLayout>
                                                    <Sider width={700}>
                                                        <Stack p={0}>

                                                            <List
                                                                className="demo-loadmore-list"
                                                                itemLayout="horizontal"
                                                                dataSource={agentProfiles}
                                                                renderItem={(item) => (
                                                                    <List.Item
                                                                        style={{ background: settingsContent === item.value ? colors.grey[300] : 'white' }}
                                                                        actions={[<Button onClick={() => {
                                                                            setActiveAgentProfile(item)
                                                                        }}>View</Button>]}
                                                                    >
                                                                        <List.Item.Meta
                                                                            avatar={<Avatar src={item.img}></Avatar>}
                                                                            title={item.fullnames}
                                                                            description={`${item.province}, ${item.region}`}
                                                                        />
                                                                        <Typography variant="body1">{item.email}</Typography>
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        </Stack>
                                                    </Sider>
                                                    <Content>
                                                        <ANTDLayout>
                                                            <Content>
                                                                <AgentForm form={agentForm} activeAgent={activeAgentProfile} />
                                                            </Content>
                                                        </ANTDLayout>
                                                    </Content>
                                                </ANTDLayout>
                                            </Card>
                                        </Stack>


                                    ) : null}
                                </Content>
                            </ANTDLayout>
                        </ANTDLayout>
                    </Content>
                </ANTDLayout>
            )}


        </Layout >
    );
};

export default Offtake;
