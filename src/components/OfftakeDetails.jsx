import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Backdrop, CardHeader, Chip, Collapse, Divider, Grid, Paper, Stack, Toolbar, Typography, colors } from '@mui/material';
import { Button, Empty, Form, Input, message, Modal, Progress, Segmented, Select, Spin, Statistic, Steps, Switch, Table, Upload } from 'antd';
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
import { ArrowLeftOutlined } from '@ant-design/icons';
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
                console.log(err);
                messageApi.error('Update Error')
                setLoading(false)
            })
        })

    }
    useEffect(() => {
        console.log(offtake);

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
    const [messageApi, contextHolder] = message.useMessage();
    const offtake = useSelector(state => state.offtake.active)
    const dispatch = useDispatch()
    const uploadFile = (path, fileObject) => {
        setLoading(true)
        const metadata = {
            contentType: fileObject.type
        };
        console.log(`cms-documents/${path}/${fileObject.name}`);

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
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                    default:
                        break;
                }
            },
            (error) => {
                console.log('====================================');
                console.log(error);
                console.log('====================================');
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
                    OfftakeService.addDocument(offtake.offtake_id, document).then(document_id => {
                        const updated_offtake = { ...offtake, master_contract: document_id }
                        OfftakeService.updateOfftake(offtake.offtake_id, updated_offtake).then(() => {
                            messageApi.error("Upload complete")
                            dispatch(setActiveOfftake(updated_offtake))
                            setLoading(false)
                            onClose()
                            setProgress(0)
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
            uploadFile(`master_contract/${offtake.offtake_id}`, originFileObj)
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
                            <Typography>{loading ? 'Uploading...' : 'Upload document'}</Typography></Button>
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
        return "Error: Input must be an array with exactly two date strings";
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
    const { offtake_id } = useParams()
    const [offtakeForm] = Form.useForm();
    const [contractModelForm] = Form.useForm();
    const { data, setOfftake, closeDrawer, setOfftakeId, showSubmissions = true } = props;
    const offtake = useSelector((state) => state.offtake?.active);
    const [currentStatus, setCurrentStatus] = useState('')
    const [contractModel, setContractModel] = useState([])
    const [viewDocuments, setViewDocuments] = useState(false)
    const [production, setProduction] = useState(false)
    const [userProfile, setUserProfile] = useState({})
    const [masterContract, setMasterContract] = useState(null)
    const [showBack, setShowBack] = useState(false)
    const description = 'This is a description.';
    const {
        order_date,
        delivery_date,
        contract,
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
        production_cost,
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
    const closeMasterContractDialogue = () => {
        setMasterContractDialog(false)
    }
    const getAndWatchDocuments = () => {
        const collectionPath = `offtakes/${offtake?.offtake_id}/documents`;
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
                console.log(ds);

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
                console.log(contract);
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
            getMasterContract()
            if (ot.status) {
                const latest = ot?.status?.length - 1 || null
                const cS = OfftakeService.getStatus.Name(ot.status)
                const uA = OfftakeService.getStatus.UpdatedAt(ot.status)
                setCurrentStatus(cS)
                contractModelForm.setFieldValue("contract_model", ot?.contract_model)
            }
            if (
                OfftakeService.getStatus.Name(ot.status) === 'submitted' ||
                OfftakeService.getStatus.Name(ot.status) === 'planning' ||
                OfftakeService.getStatus.Name(ot.status) === 'published' ||
                OfftakeService.getStatus.Name(ot.status) === 'finalstage' ||
                OfftakeService.getStatus.Name(ot.status) === 'active'
            ) {
                setProduction(true)
            }
            if (OfftakeService.getStatus.Name(ot.status) === 'inprogress' ||
                OfftakeService.getStatus.Name(ot.status) === 'published' ||
                OfftakeService.getStatus.Name(ot.status) === 'planning' ||
                OfftakeService.getStatus.Name(ot.status) === 'submitted' ||
                OfftakeService.getStatus.Name(ot.status) === 'finalstage' ||
                OfftakeService.getStatus.Name(ot.status) === 'active'
            ) {
                setDisableForm(true)
            }
        }
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
        console.log(location);
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
        setContractModel([
            { value: 'f-h-m', label: 'Fresh Hub Model' },
            { value: 'i-m', label: 'Intermediary Model' },
            { value: 'm-m', label: 'Multipartite Model' },
            { value: 'm-m', label: 'Centralised Model' },
            { value: 'n-e-m', label: 'Necleus Estate Model' }
        ])
        OfftakeService.getFarmSubmissions().then(f => {
            if (f) {
                setFarms(f)
            }
        })
        OfftakeService.getUserProfile(offtake.uid).then((user) => {
            console.log(user);
            if (user) {
                setUserProfile(user)
            }
        })
        OfftakeService.getProductionPlan(offtake.offtake_id).then(status => {
            console.log(status);
            if (status) {
                setProductionProgress(status)
            }
        })
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
            <Stack gap={4}>
                {/* Offtake header */}
                <Stack direction={'row'}>
                    <Stack flex={1} direction={'row'} gap={2} alignItems={'center'}>
                        {showBack && (<Button onClick={() => { navigate("/offtakes") }} icon={<ArrowLeftOutlined />} ></Button>)}
                        <Stack>
                            <Typography variant='h5'>Offtake Details</Typography>
                            <Typography variant='caption'>{ot?.offtake_id}</Typography>
                        </Stack>
                        {ot.status ? (<StatusTag status={ot?.status} />) : (<StatusTag status="inprogress" />)}
                    </Stack>
                    <Typography>{SystemService.converStringToSentenceCase(ot?.offtake_type ? ot?.offtake_type : 'Unknown')} Offtake</Typography>
                    {/* {offtake?.assigned && (<Persona user={offtake?.assigned} onUnsasign={unassign} />)} */}
                    {/* {!offtake?.assigned && (<Assign />)} */}
                </Stack>
                {/* Progress */}
                <Stack sx={{ overflowX: 'auto' }} py={2}>
                    <OfftakeProgress status={ot?.status} />
                </Stack>
            </Stack>
            {production && (<Stack gap={2}>
                <Divider ></Divider>
                <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
                    <Button color={colors.green[400]} type={page === 'schedule' ? 'primary' : 'default'} onClick={() => {
                        navigate(`/offtakes/${ot.offtake_id}/schedule`);
                    }}>Production Plan</Button>
                    {/* Removed to because processes are merged */}
                    {/* <Button color={colors.green[400]} type={page === 'costing' ? 'default' : 'text'} onClick={() => {
                            navigate(`/offtakes/${ot.offtake_id}/costing`);
                        }}>Production Cost</Button> */}

                    <Button color={colors.green[400]} type={page === 'chat' ? 'primary' : 'default'} onClick={() => {
                        if (currentStatus === 'planning' ||
                            currentStatus === 'finalstage' ||
                            currentStatus === 'active' ||
                            currentStatus === 'submitted') {
                            navigate(`/offtakes/${ot.offtake_id}/chat`);
                        }
                        // else if (currentStatus === 'submitted') {
                        //     navigate(`/offtakes/${ot.offtake_id}/published-chat`)
                        // }
                    }}>Chat </Button>
                </Stack>
                <Divider />
            </Stack>)}
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
                <Grid item md={4} flex={1} p={1} >
                    <Statistics title={'Production Cost'} value={`R ${ot?.production_cost ? ot?.production_cost : 0}`} />
                </Grid>
            </Grid>

            {/* Contact Details */}
            <Stack>
                <Accordion defaultExpanded={true} variant='elevation' elevation={0}>
                    <AccordionSummary sx={{ px: 0 }}>
                        <Chip icon={<FaceOutlined />} label={`Contact Details - ${userProfile?.name} ${userProfile?.surname}`} />
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack p={0} direction={'row'} gap={3}>
                            <Statistics title={'Phone Number'} value={userProfile?.phone?.phone_number} />
                            <Statistics title={'Email'} value={userProfile?.email} />
                            <Statistics title={'Location'} value={userProfile?.place_name} />
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            </Stack>
            <Stack spacing={2}>
                {/* Offtake is in planning */}

                {currentStatus === 'finalstage' && showSubmissions && (<Stack>
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


                {currentStatus === 'active' && showSubmissions && (
                    <Stack>
                        <Stack p={2} direction={'row'}>
                            <Stack flex={1}>
                                <Typography>Respondents</Typography>
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
                {currentStatus === 'active' && (
                    <Stack>
                        <Stack p={2}>
                            <Typography variant='subtitle1' fontWeight={'bold'}>Offtake Progress</Typography>
                        </Stack>
                        <Stack px={2}>
                            <Typography>Production Progress</Typography>
                            <Progress percent={80} status="active" />
                        </Stack>
                        <Stack px={2}>
                            <Typography>Delivery Progress</Typography>
                            <Progress percent={10} status="active" />
                        </Stack>
                        <Stack p={2}>
                            {productionProgress.map((stat) => {


                                return (
                                    <Stack spacing={1}>
                                        <Stack spacing={1} direction={'row'}>
                                            <Stack pt={1} spacing={1}>
                                                <Spin />
                                            </Stack>
                                            <Stack>
                                                <Typography variant='h6'>{stat.name}</Typography>
                                                <Typography variant='body2'>{stat.description}</Typography>
                                            </Stack>
                                        </Stack>
                                        <Stack spacing={2} direction={'row'}>
                                            <Divider orientation="vertical" flexItem />
                                            {stat._steps.map((step) => {
                                                return (
                                                    <Stack flex={1} spacing={1}>
                                                        <Stack flex={1} spacing={1} direction={'row'}>
                                                            <Typography flex={1} variant='subtitle1'>{step.name}</Typography> <Typography color={colors.grey[800]} variant='caption'>{moment(step.duration[0]).format("LL")} to {moment(step.duration[1]).format("LL")}</Typography>
                                                        </Stack>
                                                        <Typography>{step.description}</Typography>
                                                    </Stack>
                                                )
                                            })}
                                        </Stack>
                                    </Stack>
                                )
                            })}
                        </Stack>
                    </Stack>
                )}
                {currentStatus === 'published' ||
                    currentStatus === 'active' ||
                    currentStatus === 'finalstage'
                    ? (
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
                        </Stack >
                    ) : null}
                {currentStatus === 'published' && (<Stack>
                    <Stack p={2} direction={'row'}>
                        <Stack flex={1}>

                            <Typography>Farmers who are Interested</Typography>
                        </Stack>
                        <Button type='default' onClick={() => {
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


                <Form form={contractModelForm} layout='vertical' onFinish={(v) => {
                    OfftakeService.updateContractModel(offtake.offtake_id, v.contract_model).then(() => {
                        messageApi.success("Contract Model Updated")
                    }).catch((err) => {
                        messageApi.error("Something went wrong")
                        console.log(err);

                    })
                }}>
                    {
                        OfftakeService.getStatus.Name(offtake.status) === 'inprogress' ||
                            OfftakeService.getStatus.Name(offtake.status) === 'negotiation' ||
                            OfftakeService.getStatus.Name(offtake.status) === 'planning' ? null : (
                            <Stack direction={'row'} gap={1} alignItems={'center'}>
                                <Form.Item name="contract_model" label="Contract Model" rules={[{ required: true }]}>
                                    <Select
                                        style={{ width: 400 }}
                                        placeholder="Please select a model..."
                                        options={contractModel}
                                        onChange={(v) => {
                                            console.log(v);
                                        }}
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
                                <PermissionControl label={"Product Name"} name="produce_name" form={offtakeForm} value={ot?.commodity_name} />
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
                                return (<Documents key={document.name} url={document.file_url} name={document.name} type="pdf" />)
                            })}
                        </Stack>
                    </Collapse>
                </Stack>
                {documents.length === 0 &&
                    (
                        <Empty
                            description="No Documents"
                            children={
                                <Stack direction={'row'} alignContent={'center'} spacing={1} justifyContent={'center'}>
                                    <Button type='primary'>Request a required Document</Button>
                                    <Button>Request an additional Document</Button>
                                </Stack>
                            }
                        />)
                }

            </Stack>
        </Stack >
    )
}

export default OfftakeDetails