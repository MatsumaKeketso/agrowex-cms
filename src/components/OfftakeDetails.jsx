import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Backdrop, CardContent, CardHeader, Chip, Collapse, Divider, Grid, Paper, Stack, Toolbar, Typography, colors, List as MList, ListItem, ListItemText } from '@mui/material';
import { Button, Card, Descriptions, Empty, Form, Input, message, Modal, Progress, Segmented, Select, Spin, Statistic, Steps, Switch, Table, Upload, Typography as ATypo } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Statistics, { formatText } from './Statistics';
import currency from "currency.js"
import Persona from './Persona';
// import debounce from 'lodash/debounce';
import { PManagers } from '../database/db-data';
import { offtakeUpdateSuccess, setActiveOfftake, setPublishState } from '../services/offtake/offtakeSlice';
import { ArrowDownwardRounded, CardMembership, ChatBubble, CheckRounded, CloseRounded, FaceOutlined, Person2Outlined, UploadOutlined } from '@mui/icons-material';
import Documents from './Documents';
import StatusTag from './StatusTag';
import { OfftakeService } from '../services/offtakeService';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import OfftakeProgress from './OfftakeProgress';
import { FarmSubmissionColumns } from '../pages/FarmSubmissions';
import { storage, SystemService } from '../services/systemService';
import { AuthService, firestoreDB } from '../services/authService';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { getDownloadURL, ref as sRef, uploadBytesResumable } from 'firebase/storage';
import moment from 'moment';
import { ArrowLeftOutlined, CheckCircleFilled, UserOutlined } from '@ant-design/icons';
import { Helpers } from '../services/helpers';
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
        AuthService.getUser().then(user => {
            const status = {
                status_name: 'published',
                updated_at: SystemService.generateTimestamp()
            }
            const updated_status = [...offtake.status, status]
            OfftakeService.updateOfftake(offtake.offtake_id, {
                ...offtake, status: updated_status, approved_by: user.uid
            }).then(() => {
                messageApi.success('Offtake Updated!');
                dispatch(setPublishState(false))
                setLoading(false)
                dispatch(setActiveOfftake({
                    ...offtake, status: updated_status
                }))
            }).catch(err => {
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
                        <StatusTag status={offtake.status} />
                    </Stack>
                    <ArrowDownwardRounded />
                    <Stack direction={'row'} alignSelf={'center'} gap={1}>
                        <Typography variant="subtitle2">AGRO-{offtake.offtake_id}</Typography>
                        <StatusTag status={'published'} />
                    </Stack>
                    <Typography variant="subtitle2">
                        This offtake will be publised for farmers to apply, continue?
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
const MasterContractDialog = ({ open, onClose }) => {
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState('')
    const [docAdded, setDocAdded] = useState(false)
    const [messageApi, contextHolder] = message.useMessage();
    const [attachment, setAttachment] = useState(null)
    const [pop, setPop] = useState(0)
    const offtake = useSelector(state => state.offtake.active)
    const dispatch = useDispatch()
    const uploadFile = (path, fileObject) => {
        setLoading(true)
        const metadata = {
            contentType: fileObject.type
        };
        const storageRef = sRef(storage, `cms-documents/${path}${fileObject.name}`);
        const uploadTask = uploadBytesResumable(storageRef, fileObject, metadata);


        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
            (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress((progress).toFixed(2))

                switch (snapshot.state) {
                    case 'paused':
                        // console.log('Upload is paused');
                        break;
                    case 'running':
                        // console.log('Upload is running');
                        break;
                    default:
                        break;
                }
            },
            (error) => {
                // A full list of error codes is available at
                switch (error.code) {

                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        break;
                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                    default:
                        break;

                }
            },
            () => {

                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    const document = {
                        name: fileObject.name,
                        created_at: SystemService.generateTimestamp(),
                        file_url: downloadURL
                    }
                    // if (!attachment) { return }
                    setAttachment(true)
                    OfftakeService.addDocument(offtake.offtake_id, document).then(document_id => {
                        const _master_contract = [{ file_url: downloadURL, name: fileObject.name, created_at: SystemService.generateTimestamp(), id: document_id }]
                        const updated_offtake = { ...offtake, master_contract: _master_contract }
                        setDocAdded(true)
                        OfftakeService.updateOfftake(offtake.offtake_id, updated_offtake).then(() => {

                            messageApi.success("Upload complete")
                            dispatch(setActiveOfftake(updated_offtake))
                            setLoading(false)
                            onClose()
                            setProgress(0)
                            setAttachment(null)
                        }).catch((err) => {
                            messageApi.error(err.message)
                        })
                    }).catch(err => {
                        messageApi.error(err.message)
                    })
                });
            }
        );



    }
    const props = {
        name: 'file',
        action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            const { originFileObj } = info.file;
            if (pop == 0) {
                uploadFile(`master_contract/${offtake.offtake_id}`, originFileObj)
                setPop(1)
            }
        },
    };

    return (
        <Modal footer={<></>} okButtonProps={{ disabled: loading }} title="Upload Contract" open={open} maskClosable={false} onCancel={() => onClose()}>
            {contextHolder}
            <Stack alignItems={'center'} gap={4}>
                <Typography variant='h4'>Attach Master Contract</Typography>
                <Stack position={'relative'} alignItems={'center'} width={'100%'}>
                    <Progress type='circle' percent={progress} />
                    {/* {loading && (<iframe style={{ border: 'solid 0px', width: '100%', height: 120 }} src="https://lottie.host/embed/3eddec88-977e-44f0-aff3-94791417ac8a/A2tvqRuadl.json"></iframe>)} */}
                </Stack>

                <Stack textAlign={'center'} gap={2}>
                    <Upload accept=".pdf" {...props}>
                        <Button loading={loading} type='primary' icon={<UploadOutlined />}>
                            <Typography variant='button'>{loading ? 'Uploading...' : 'Upload document'}</Typography></Button>
                    </Upload>
                </Stack>

                <Typography>This offtake Master Contract will be part of the offtake details.</Typography>
            </Stack>
        </Modal>
    )

}
export function getDaysBetween(dateArray) {
    // Ensure moment.js is available
    if (typeof moment === 'undefined') {
        return "Error: moment.js is not loaded";
    }

    // Check if the input is an array with exactly two elements
    if (!Array.isArray(dateArray) || dateArray.length !== 2) {
        return "Invalid dates";
    }

    const [date1, date2] = dateArray;

    // Parse the dates using moment.js
    const momentDate1 = moment(date1);
    const momentDate2 = moment(date2);

    // Check if both dates are valid
    if (!momentDate1.isValid() || !momentDate2.isValid()) {
        return "Error: Invalid date format";
    }

    // Calculate the difference in days
    const daysDifference = Math.abs(momentDate1.diff(momentDate2, 'days'));

    // Return the result as a string
    return `${daysDifference} days`;
}
const OfftakeDetails = (props) => {
    const [disableForm, setDisableForm] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [masterContractDialog, setMasterContractDialog] = useState(false)
    const [farms, setFarms] = useState([])
    const [documents, setDocuments] = useState([])
    const [offtakeBackup, setOfftakeBackup] = useState({})
    const [activeSuppliers, setActiveSuppliers] = useState([])
    const [page, setPage] = useState("")
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const location = useLocation();
    const [productionProgress, setProductionProgress] = useState([])
    const [productionPercentage, setProductionPercentage] = useState(0)
    const [barSteps, setBarSteps] = useState(0)
    const { offtake_id, offtake_page } = useParams()
    const [offtakeForm] = Form.useForm();
    const [contractModelForm] = Form.useForm();
    const { data, setOfftake, closeDrawer, setOfftakeId, showSubmissions = true } = props;
    const offtake = useSelector((state) => state.offtake?.active);
    const [currentStatus, setCurrentStatus] = useState('')
    const [productionCost, setProductionCost] = useState(0)
    const [contractModel, setContractModel] = useState([])
    const [viewDocuments, setViewDocuments] = useState(false)
    const [production, setProduction] = useState(false)
    const [userProfile, setUserProfile] = useState({})
    const [masterContract, setMasterContract] = useState(null)
    const [showBack, setShowBack] = useState(false)
    const [profitability, setProfitability] = useState({})
    const [prodPlan, setProdPlan] = useState(null)
    const {
        contract,
        country,
        status,
        production_method,
        quantity,
        unit,
        delivery_frequency,
        supply_duration,
        quality_grade,
        permissions,
    } = useSelector((state) => state.offtake?.active);
    const ot = useSelector((state) => state.offtake?.active);

    const closeMasterContractDialogue = () => {
        setMasterContractDialog(false)
    }
    const getAndWatchDocuments = () => {
        const collectionPath = `offtakes/${offtake?.offtake_id}/_documents`;
        // Create a query to get all documents in the collection
        const q = query(collection(firestoreDB, collectionPath));

        // Listen for changes in the collection
        onSnapshot(q, (snapshot) => {
            // Loop through the documents in the snapshot
            if (!snapshot.empty) {
                setDocuments([])
                var ds = []
                snapshot.forEach((doc) => {
                    // Get the document data
                    const data = doc.data();
                    const document = { ...data, doc_id: doc.id }
                    ds.push(document)
                });

                setDocuments(ds)
            } else {
                setDocuments([])
            }
        });
    }
    const getMasterContract = () => {
        if (!("master_contract" in ot)) {
            return
        }

        const property = ot["master_contract"];

        if (typeof property === "string") {
            // means its a doc key
            OfftakeService.getMasterContract(ot.offtake_id, ot.master_contract).then((contract) => {
                // console.log(contract);
                if (contract) {
                    setMasterContract(contract)
                }
            })
        } else if (typeof property === "object" && property !== null) {
            // mean its a doc, "old structure"
            setMasterContract(property)
        } else {
            return "Neither string nor object";
        }
    }
    useEffect(() => {
        if (ot) {
            const cs = OfftakeService.getStatus.Name(ot.status)
            setCurrentStatus(cs)
            getMasterContract()
            if (ot.status) {
                contractModelForm.setFieldValue("contract_model", ot?.contract_model)
            }
            if (
                OfftakeService.getStatus.Name(ot.status) === 'submitted' ||
                OfftakeService.getStatus.Name(ot.status) === 'planning' ||
                OfftakeService.getStatus.Name(ot.status) === 'published' ||
                OfftakeService.getStatus.Name(ot.status) === 'contracting' ||
                OfftakeService.getStatus.Name(ot.status) === 'active'
            ) {
                setProduction(true)
            }
            if (OfftakeService.getStatus.Name(ot.status) === 'inprogress' ||
                OfftakeService.getStatus.Name(ot.status) === 'published' ||
                OfftakeService.getStatus.Name(ot.status) === 'planning' ||
                OfftakeService.getStatus.Name(ot.status) === 'submitted' ||
                OfftakeService.getStatus.Name(ot.status) === 'contracting' ||
                OfftakeService.getStatus.Name(ot.status) === 'active'
            ) {
                setDisableForm(true)
            }
        }
        const locations = location.pathname.split('/')
        setPage(locations[3])
        if (!offtake_id) {
            navigate(`/offtakes/${offtake_page}`)
        }
        setOfftakeId(offtake_id)
        if (permissions) {
            Object.keys(permissions).map(key => {
                offtakeForm.setFieldValue(key, permissions[key])
            })
        } else {
            // console.log('permissions not available');
        }

    }, [offtake])
    useEffect(() => {
        OfftakeService.getProductionPlan(ot.offtake_id).then((plan) => {
            if (plan) {
                setProductionCost(0)
                plan.forEach(_cost => {
                    setProductionCost(productionCost + _cost.amount)
                })
                Helpers.nestProductionData(plan).then((_d) => {
                    const _data = _d.groupedCategories
                    const progress = (_d?.items_with_comments / plan.length) * 100
                    setBarSteps(plan.length)
                    setProdPlan(_data)
                    setProductionPercentage(progress)
                    SystemService.profitabilityCalucation(ot, _data).then((data) => {
                        setProfitability(data)
                    })
                })
            }
        })
        if (location) {
            const pathLength = location.pathname.split("/")
            const currentPage = pathLength[pathLength.length - 1]
            if (currentPage === "chat") {
                setShowBack(true)
            } else {
                setShowBack(false)
            }
        }
        getAndWatchDocuments()
        const model_options = [
            { value: 'f-h-m', label: 'Fresh Hub Model' },
            { value: 'i-m', label: 'Intermediary Model' },
            { value: 'm-m', label: 'Multipartite Model' },
            { value: 'm-m', label: 'Centralised Model' },
            { value: 'n-e-m', label: 'Necleus Estate Model' }
        ]
        setContractModel(model_options)
        OfftakeService.getFarmSubmissions().then(f => {
            if (f) {
                setFarms(f)
            }
        })
        if (offtake.uid) {
            OfftakeService.getUserProfile(offtake.uid).then((user) => {
                // console.log(user);
                if (user) {
                    setUserProfile(user)
                }
            })
        }
        if (offtake.offtake_id) {
            OfftakeService.getProductionPlan(offtake.offtake_id).then(categories => {
                // console.log(status);
                if (status) {
                    Helpers.nestProductionData(categories).then((d) => {
                        const data = d.groupedCategories
                        setProductionProgress(data)
                    })
                    // setProductionProgress(status)
                }
            })
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
            <MasterContractDialog open={masterContractDialog} onClose={() => closeMasterContractDialogue()} />
            <PublishOfftake />
            {contextHolder}

            {/* Header and Status */}
            <Stack gap={4}>
                {/* Offtake header */}
                <Stack direction={'row'}>
                    <Stack flex={1} direction={'row'} flexWrap={'wrap'} gap={2} alignItems={'center'}>
                        {showBack && (<Button onClick={() => { navigate(`/offtakes/${offtake_page}`) }} icon={<ArrowLeftOutlined />} ></Button>)}
                        <Stack flex={1}>
                            <Typography variant='h5'>{ot?.title}</Typography>
                            <ATypo.Text copyable >{ot?.offtake_id}</ATypo.Text>
                        </Stack>
                        {ot.status ? (<StatusTag status={ot?.status} />) : (<StatusTag status="inprogress" />)}
                    </Stack>
                    <Chip label={`${SystemService.converStringToSentenceCase(ot?.offtake_type ? ot?.offtake_type : 'Unknown')} Offtake`} color="primary" variant='outlined' />

                    {/* {offtake?.assigned && (<Persona user={offtake?.assigned} onUnsasign={unassign} />)} */}
                    {/* {!offtake?.assigned && (<Assign />)} */}
                </Stack>
                {/* Progress */}
                <Stack sx={{ overflowX: 'auto' }} py={2}>
                    <OfftakeProgress status={ot?.status} />
                </Stack>
            </Stack>

            {/* Buttons */}
            {production && (
                <Stack gap={2}>
                    <Divider ></Divider>
                    <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
                        <Button color={colors.green[400]} type={page === 'schedule' ? 'primary' : 'default'} onClick={() => {
                            navigate(`/offtakes/${offtake_page}/${ot.offtake_id}/schedule`);
                        }}>Production Plan</Button>
                        {/* Removed to because processes are merged */}
                        {/* <Button color={colors.green[400]} type={page === 'costing' ? 'default' : 'text'} onClick={() => {
                            navigate(`/offtakes/${ot.offtake_id}/costing`);
                        }}>Production Cost</Button> */}

                        <Button color={colors.green[400]} type={page === 'chat' ? 'primary' : 'default'} onClick={() => {
                            if (currentStatus === 'planning' ||
                                currentStatus === 'contracting' ||
                                currentStatus === 'active' ||
                                currentStatus === 'submitted') {
                                navigate(`/offtakes/${offtake_page}/${ot.offtake_id}/chat`);
                            }
                            // else if (currentStatus === 'submitted') {
                            //     navigate(`/offtakes/${ot.offtake_id}/published-chat`)
                            // }
                        }}>Chat </Button>
                        {currentStatus === 'active' && showSubmissions && (
                            <Button type={page === 'submissions' ? 'primary' : 'default'} onClick={() => {
                                // "/offtakes/:offtake_id/submissions"
                                navigate(`/offtakes/${offtake_page}/${offtake_id ? offtake_id : ot.offtake_id}/submissions`)
                            }}>View Respondents</Button>
                        )}
                    </Stack>

                    <Card
                    >
                        <Stack gap={2} direction={'row'}>
                            <img
                                style={{ width: 100, height: 100, objectFit: 'fill' }}
                                alt={ot?._commodity_meta?.name}
                                src={ot?._commodity_meta?.img || "https://api.dicebear.com/7.x/miniavs/svg?seed=8"}
                            />
                            <Card.Meta
                                title={ot?._commodity_meta?.name}
                                description={ot?._commodity_meta?.description}
                            />
                        </Stack>
                    </Card>
                    <Divider />
                </Stack>)}

            {/* Offtake Details */}
            <Grid container spacing={1}>
                <Grid item md={4} flex={1} p={1} >
                    <Statistics title="Order date" value={SystemService.convertTimestampToDateString(ot?.created_at)} />
                </Grid>
                {/* <Grid item md={4} flex={1} p={1} >
                    <Statistics title="Delivery Date" value={SystemService.formatTimestamp(supply_duration)} />
                </Grid> */}
                <Grid item md={4} flex={1} p={1} >
                    <Statistics title="Packaging" value={ot?.packaging} />
                </Grid>
                <Grid item md={4} flex={1} p={1} >
                    <Statistics title="Payment Method" value={ot?.payment_instrument} />
                </Grid>
                <Grid item md={4} flex={1} p={1} >
                    <Statistics title="Contract Type" value={contract} />
                </Grid>
                <Grid item md={4} flex={1} p={1} >
                    <Statistics title={'Country of Origin'} value={country} />
                </Grid>
                <Grid item md={4} flex={1} p={1} >
                    <Statistics title={'Payment Terms'} value={ot?.payment_terms} />
                </Grid>
                <Grid item md={4} flex={1} p={1} >
                    <Statistics title={'Position'} value={ot?.position} />
                </Grid>
                <Grid item md={4} flex={1} p={1} >
                    <Statistics title={'Pricing Option'} value={ot?.pricing_option} />
                </Grid>

            </Grid>

            {/* Profitability  */}
            {currentStatus === 'published' ||
                currentStatus === 'contracting' ||
                currentStatus === "active"
                && (
                    <Grid container spacing={1} >

                        <Grid item flex={1}>
                            <Card size='small'>
                                <Stack gap={1} px={2}>
                                    <ATypo.Title level={4}>Profitability Breakdown</ATypo.Title>

                                </Stack>
                                <MList >
                                    <ListItem>
                                        <ListItemText primary="Total Income" secondary={`${SystemService.formatCurrency((parseFloat(ot?.offer_price_per_unit) * parseFloat(ot.quantity)))}`} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Production Cost" secondary={`${SystemService.formatCurrency(parseFloat(productionCost))}`} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Agrowex Software Licensing" secondary={`${SystemService.formatCurrency((((parseFloat(ot?.offer_price_per_unit) * parseFloat(ot.quantity)) + parseFloat(productionCost)) * .10))} \n Calc: @ 10%`} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Total Profit" secondary={`${SystemService.formatCurrency(((parseFloat(ot?.offer_price_per_unit) * parseFloat(ot.quantity)) + parseFloat(productionCost) + (((parseFloat(ot?.offer_price_per_unit) * parseFloat(ot.quantity)) + parseFloat(productionCost)) * .10)))} \n Calc: overall cost`} />
                                    </ListItem>
                                </MList>
                            </Card>

                        </Grid>
                    </Grid>
                )}
            <Divider>Price Details</Divider>
            <Descriptions layout='horizontal' size='small' column={2} bordered>
                <Descriptions.Item label="Final Price">{SystemService?.formatCurrency(ot?._price_details?.final_price) || 0}</Descriptions.Item>
                <Descriptions.Item label="Offer Price Per Unit">{SystemService?.formatCurrency(ot?._price_details?.offer_price_per_unit) || 0}</Descriptions.Item>
                <Descriptions.Item label="Origin Price">{SystemService?.formatCurrency(ot?._price_details?.origin_price) || 0}</Descriptions.Item>
                <Descriptions.Item label="Service Fee">{SystemService?.formatCurrency(ot?._price_details?.service_fee) || 0}</Descriptions.Item>
            </Descriptions>

            {/* Contact Details */}
            <Stack>
                {/* Profile Not Available */}
                {!userProfile?.name && (<Card
                    sx={{
                        position: "relative",
                        width: "100%",
                        maxWidth: 400,
                        margin: "auto",
                        padding: 3,
                        borderRadius: 4,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        background: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <CardContent>
                        <Stack spacing={2} alignItems="center">
                            {/* Icon */}
                            <Stack
                                style={{
                                    width: 80,
                                    height: 80,
                                    background: "rgba(200, 200, 200, 0.2)",
                                    borderRadius: "50%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: 32,
                                    color: "#9E9E9E",
                                    boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                <UserOutlined />
                            </Stack>

                            {/* Title */}
                            <Typography
                                variant="h6"
                                align="center"
                                color="text.primary"
                                sx={{
                                    fontWeight: "600",
                                    color: "#333",
                                }}
                            >
                                Profile Not Available
                            </Typography>

                            {/* Subtitle */}
                            <Typography
                                variant="body2"
                                align="center"
                                color="text.secondary"
                                sx={{
                                    lineHeight: 1.6,
                                    maxWidth: 300,
                                }}
                            >
                                The profile you're trying to view isn't accessible at the moment.
                                This could be due to privacy settings or it may not exist.
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>)}

                {userProfile?.name && (
                    <Stack gap={2} >
                        <Divider>Contact Details</Divider>
                        <Stack gap={2} direction={'row'} alignItems={'center'}>
                            <UserOutlined />
                            <Typography variant='h6'>{userProfile?.name} {userProfile?.surname}</Typography>
                        </Stack>
                        <Stack p={0} direction={'row'} gap={3}>
                            {SystemService.getDataType(userProfile?.phone) === 'map' && (<Statistics title={'Phone Number'} value={`(${userProfile?.phone?.country_calling_code}) ${userProfile?.phone?.phone_number}`} />)}
                            {SystemService.getDataType(userProfile?.phone) === 'string' && (<Statistics title={'Phone Number'} value={userProfile?.phone} formatter={(value) => (<>{value}</>)} />)}

                            <Statistics title={'Email'} value={userProfile?.email} />
                            {/* <Statistics title={'Company/Name'} value={} /> */}
                        </Stack>
                        <Statistics title={'Location'} value={`${ot?._address?.street_address || "*To be disclosed"},${ot?._address?.region}, ${ot?._address?.city}, ${ot?._address?.province}, ${ot?._address?.country}`} />
                    </Stack>
                )}

            </Stack>


            <Stack spacing={2}>
                {/* Offtake is in planning */}

                {currentStatus === 'contracting' && showSubmissions && (<Stack>
                    <Stack p={2} direction={'row'}>
                        <Stack flex={1}>
                            <Typography>Respondents</Typography>
                        </Stack>
                        <Button type='primary' onClick={() => {
                            "/offtakes/:offtake_id/submissions"
                            navigate(`/offtakes/${offtake_page}/${offtake_id ? offtake_id : ot.offtake_id}/submissions`)
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


                {currentStatus === 'active' && showSubmissions && (
                    <Stack>
                        <Card hoverable>
                            <Stack direction={'row'}>
                                <Stack flex={1}>
                                    <Typography variant='h6'>Respondents</Typography>
                                    <Typography color={colors.grey[600]} variant='body2'>View respondent profile, track production & delivery</Typography>
                                </Stack>
                                <Button type='primary' onClick={() => {
                                    "/offtakes/:offtake_id/submissions"
                                    navigate(`/offtakes${offtake_page}/${offtake_id ? offtake_id : ot.offtake_id}/submissions`)
                                }}>View More</Button>
                            </Stack>
                        </Card>
                        {/* <Stack direction={'row'}>
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
                        </Stack> */}

                    </Stack>
                )}
                {currentStatus === 'active' && (
                    <Stack gap={2}>
                        <Stack p={2}>
                            <Typography variant='subtitle1' fontWeight={'bold'}>Offtake Progress</Typography>
                        </Stack>
                        <Stack px={2}>
                            <Typography>Production Progress</Typography>
                            <Progress steps={barSteps < 100 ? barSteps : 0} percent={Number(productionPercentage).toFixed(0)} status="active" />
                            <Accordion variant='outlined'>
                                <AccordionSummary>Description</AccordionSummary>
                                <AccordionDetails>
                                    <Stack p={2}>
                                        {productionProgress.map((cat) => {
                                            return (
                                                <Stack spacing={1} pb={1} >
                                                    <Stack spacing={1} direction={'row'}>
                                                        <Stack pt={1} spacing={1}>
                                                            <CheckCircleFilled />
                                                        </Stack>
                                                        <Stack>
                                                            <Typography variant='h6'>{cat.name}</Typography>
                                                            <Typography variant='body2'>{cat.description}</Typography>
                                                        </Stack>
                                                    </Stack>
                                                    {/* <Stack pl={1} spacing={2} direction={'row'}>
                                            <Divider orientation="vertical" flexItem />
                                            <Stack flex={1}>
                                                {cat?._steps.map((step) => {
                                                    return (
                                                        <Stack flex={1} spacing={1}>
                                                            <Stack flex={1} spacing={1} direction={'row'}>
                                                                <Typography
                                                                    component={'li'}
                                                                    flex={1}
                                                                    variant='subtitle1'
                                                                >
                                                                    {step.name}
                                                                </Typography>
                                                                <Typography
                                                                    color={colors.grey[800]}
                                                                    variant='caption'
                                                                >
                                                                    From: {moment(step.duration[0]).format("LL")} - {getDaysBetween(step.duration)}
                                                                </Typography>
                                                            </Stack>
                                                            <Typography>{step.description}</Typography>
                                                        </Stack>
                                                    )
                                                })}
                                            </Stack>
                                        </Stack> */}
                                                </Stack>
                                            )
                                        })}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>

                        </Stack>

                        <Stack px={2}>
                            <Typography>Delivery Progress</Typography>
                            <Progress percent={Number(0).toFixed(0)} status="active" />
                        </Stack>
                    </Stack>
                )}
                {currentStatus === 'published' ||
                    currentStatus === 'active' ||
                    currentStatus === 'contracting'
                    ? (
                        <Stack gap={2}>

                            <Divider >Master Contract</Divider>
                            <Stack>
                                {!masterContract && (<Stack flex={1} >
                                    <Button type='primary' onClick={() => {
                                        setMasterContractDialog(true)
                                    }}>Upload Master Contract</Button>

                                </Stack>)}
                                {masterContract && (
                                    <Stack flex={1} direction={'row'} spacing={1} >
                                        <Documents url={masterContract.file_url} name={masterContract.name} />
                                        <Stack px={1} spacing={2} >
                                            <Stack>
                                                <Typography variant='subtitle1'>{masterContract.name}</Typography>
                                                <Typography color='GrayText' variant='body1'>Uploaded at - {SystemService.formatTimestamp(masterContract.created_at)}</Typography>
                                            </Stack>
                                            <Stack alignItems={'flex-start'}>
                                                <Button type='default' onClick={() => {
                                                    setMasterContractDialog(true)
                                                }}>Update</Button>
                                            </Stack>
                                        </Stack>

                                    </Stack>
                                )}
                            </Stack>
                            <Divider />
                        </Stack >
                    ) : null}
                {currentStatus === 'published' && (<Stack>
                    <Stack p={2} direction={'row'}>
                        <Stack flex={1}>

                            <Typography>Respondents</Typography>
                        </Stack>
                        <Button type='default' onClick={() => {
                            "/offtakes/:offtake_id/submissions"
                            navigate(`/offtakes${offtake_page}/${offtake_id ? offtake_id : ot.offtake_id}/submissions`)
                        }}>View More</Button>
                    </Stack>
                </Stack>)}


                <Form disabled={offtake.contract_model} form={contractModelForm} layout='vertical' onFinish={(v) => {
                    OfftakeService.updateContractModel(offtake.offtake_id, v.contract_model).then(() => {
                        messageApi.success("Contract Model Updated")
                        dispatch(setActiveOfftake({ ...offtake, contract_model: v.contract_model }));
                    }).catch((err) => {
                        messageApi.error("Something went wrong")
                        // console.log(err);
                    })
                }}>
                    {
                        OfftakeService.getStatus.Name(offtake.status) === 'inprogress' ||
                            OfftakeService.getStatus.Name(offtake.status) === 'negotiation' ||
                            OfftakeService.getStatus.Name(offtake.status) === 'planning' ? null : (
                            <Stack direction={'row'} gap={1} alignItems={'center'}>
                                <Form.Item name="contract_model" label="Contract Model" rules={[{ required: true }]}>
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Please select a model..."
                                        options={contractModel}
                                    />
                                </Form.Item>
                                <Button type='default' htmlType='submit'>Update</Button>
                            </Stack>
                        )
                    }

                </Form>

                <Form
                    initialValues={{
                        contract_type: false
                    }}
                    name='permissions'
                    form={offtakeForm}
                    disabled={disableForm}
                    layout='vertical'
                    onFinish={(v) => {
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

                            dispatch(offtakeUpdateSuccess(true))
                            setTimeout(() => {
                                dispatch(offtakeUpdateSuccess(false))
                            }, 1000);
                            messageApi.success("Offtake Updated");
                        }).catch(err => {
                            messageApi.error("Something went wrong");
                            // console.log(err);
                            // console.log({ offtake_id, a });

                        })
                    }} >
                    <Stack bgcolor={colors.grey[100]} p={3} borderRadius={4} gap={3}>
                        <Grid flex={1} container gap={0}>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1} >
                                <PermissionControl label={"Cateogry/Type"} name={"request_type"} value={ot?.request_type} form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Product Name"} name="produce_name" form={offtakeForm} value={ot?.commodity_name} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Production Method"} name="production_method" value={production_method} form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Total Order Quanitity"} name="quantity" value={`${quantity}qty`} form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Delivery Frequency"} name="delivery_frequency" form={offtakeForm} value={delivery_frequency} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Do You Provide Input Investment?"} name="input_investment" value={ot?.input_investment} form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Supply Duration"} name="supply_duration" value={getDaysBetween(supply_duration)} form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Offer price Per Unit"} name="price" value={`R ${ot?.offer_price_per_unit ? ot?.offer_price_per_unit : (0).toFixed(2)}`} form={offtakeForm} />
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
                <Stack spacing={2}>
                    <Stack direction={'row'} alignItems={'center'}>
                        <Typography flex={1}>{documents.length} Documents</Typography>
                        <Button type={viewDocuments ? 'primary' : 'default'} onClick={() => {
                            setViewDocuments(!viewDocuments);
                        }}>{viewDocuments ? 'Close Preview' : 'Preview'} </Button>
                    </Stack>

                    <Collapse in={viewDocuments}>
                        <Stack sx={{ overflowX: 'auto' }} direction={'row'} alignItems={'center'} gap={1}>
                            {documents?.map((document) => {
                                return (<Documents key={document.name} url={document.file_url} name={document.name} type="preview" />)
                            })}
                        </Stack>
                    </Collapse>
                </Stack>
                {documents.length === 0 &&
                    (
                        <Empty
                            imageStyle={{
                                height: 60,
                            }}
                            description={
                                <span>
                                    No Documents Uploaded
                                </span>
                            }
                        />)
                }

            </Stack>
        </Stack >
    )
}

export default OfftakeDetails