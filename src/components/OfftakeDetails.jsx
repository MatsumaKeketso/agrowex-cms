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
import { firestoreDB } from '../services/authService';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { getDownloadURL, ref as sRef, uploadBytesResumable } from 'firebase/storage';
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


    // TODO Update this status update function
    const UpdateStatus = () => {
        setLoading(true)
        const status = {
            status_name: 'published',
            updated_at: SystemService.generateTimestamp()
        }
        const updates_status = [...offtake.status, status]
        OfftakeService.updateOfftake(offtake.offtake_id, {
            ...offtake, status: updates_status
        }).then(() => {

            messageApi.success('Offtake Updated!');
            dispatch(setPublishState(false))
            setLoading(false)
            dispatch(setActiveOfftake({
                ...offtake, status: updates_status
            }))
        }).catch(err => {
            console.log(err);
            messageApi.error('Update Error')
            setLoading(false)
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
                setProgress((progress * 1).toFixed(2))
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
                    const updated_offtake = { ...offtake, master_contract: document }
                    OfftakeService.updateOfftake(offtake.offtake_id, updated_offtake).then(() => {
                        dispatch(setActiveOfftake(updated_offtake))
                        setLoading(false)
                        onClose()
                        setProgress(0)
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
        <Modal footer={<></>} okButtonProps={{ disabled: loading }} title="Upload Contract" open={open} onCancel={() => onClose()}>
            <Stack alignItems={'center'} gap={4}>
                <Typography variant='h4'>Attach Master Contract</Typography>
                <Stack position={'relative'} alignItems={'center'} width={'100%'}>
                    <Progress type='circle' percent={progress} />
                    {/* {loading && (<iframe style={{ border: 'solid 0px', width: '100%', height: 120 }} src="https://lottie.host/embed/3eddec88-977e-44f0-aff3-94791417ac8a/A2tvqRuadl.json"></iframe>)} */}
                </Stack>

                <Stack textAlign={'center'} gap={2}>
                    <Upload {...props}>
                        <Button loading={loading} type='primary' icon={<UploadOutlined />}>
                            <Typography>{loading ? 'Uploading...' : 'Upload document'}</Typography></Button>
                    </Upload>
                </Stack>

                <Typography>This offtake Master Contract will be part of the offtake details.</Typography>
            </Stack>
        </Modal>
    )

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
    useEffect(() => {
        if (ot) {
            if (ot.status) {
                const latest = ot?.status?.length - 1 || null
                const cS = OfftakeService.getStatus.Name(ot.status)
                const uA = OfftakeService.getStatus.UpdatedAt(ot.status)
                setCurrentStatus(cS)
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
        getAndWatchDocuments()
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
            <MasterContractDialog open={masterContractDialog} onClose={() => closeMasterContractDialogue()} />
            <PublishOfftake />
            {contextHolder}
            <Stack gap={4}>
                {/* Offtake header */}
                <Stack direction={'row'}>
                    <Stack flex={1} direction={'row'} gap={2} alignItems={'center'}>
                        <Stack>
                            <Typography variant='h5'>Offtake Details</Typography>
                            <Typography variant='caption'>{ot?.offtake_id}</Typography>
                        </Stack>
                        {ot.status ? (<StatusTag status={ot?.status} />) : (<StatusTag status="inprogress" />)}
                    </Stack>
                    {/* {offtake?.assigned && (<Persona user={offtake?.assigned} onUnsasign={unassign} />)} */}
                    {/* {!offtake?.assigned && (<Assign />)} */}
                </Stack>
                {/* Progress */}
                <Stack sx={{ overflowX: 'auto' }} py={2}>
                    <OfftakeProgress status={ot?.status} />
                </Stack>
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
                {production && (<Stack gap={2}>
                    <Divider >Production</Divider>
                    <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
                        <Button color={colors.green[400]} type={page === 'schedule' ? 'default' : 'text'} onClick={() => {
                            navigate(`/offtakes/${ot.offtake_id}/schedule`);
                        }}>Production Plan</Button>
                        <Button color={colors.green[400]} type={page === 'costing' ? 'default' : 'text'} onClick={() => {
                            navigate(`/offtakes/${ot.offtake_id}/costing`);
                        }}>Production Cost</Button>

                        <Button color={colors.green[400]} type={page === 'chat' ? 'default' : 'text'} onClick={() => {
                            if (currentStatus === 'planning') {
                                navigate(`/offtakes/${ot.offtake_id}/chat`);
                            }
                            else if (currentStatus === 'submitted') {
                                navigate(`/offtakes/${ot.offtake_id}/published-chat`)
                            }
                        }}>Chat {currentStatus === "published" && "with PM"}</Button>
                    </Stack>
                    <Divider />
                </Stack>)}

                {currentStatus === 'active' && showSubmissions && (
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
                {currentStatus === 'active' && (
                    <Stack >
                        <Stack p={2}>
                            <Typography variant='subtitle1' fontWeight={'bold'}>Production Tracker</Typography>
                        </Stack>
                        <Stack p={2}>
                            <Steps
                                percent={50}
                                direction="vertical"
                                current={1}
                                items={productionProgress}
                            />
                        </Stack>
                    </Stack>
                )}
                {currentStatus === 'published' && (
                    <Stack>
                        {!ot?.master_contract && (<Stack flex={1} >

                            <Button type='primary' onClick={() => {
                                setMasterContractDialog(true)
                            }}>Upload Master Contract</Button>

                        </Stack>)}
                        {ot?.master_contract && (
                            <Stack flex={1} direction={'row'} spacing={1} >
                                <Documents url={ot.master_contract.file_url} name={ot.master_contract.name} />
                                <Stack px={1} spacing={2} >
                                    <Stack>
                                        <Typography variant='subtitle1'>{ot.master_contract.name}</Typography>
                                        <Typography color='GrayText' variant='body1'>Uploaded at - {SystemService.formatTimestamp(ot.master_contract.created_at)}</Typography>
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
                )}
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
                <Grid container spacing={1}>
                    <Grid item flex={1} p={1} >
                        <Statistics title="Order date" value={SystemService.convertTimestampToDateString(ot?.created_at)} />
                    </Grid>
                    <Grid item flex={1} p={1} >
                        <Statistics title="Delivery Date" value={delivery_date} />
                    </Grid>
                    <Grid item flex={1} p={1} >
                        <Statistics title="Contract Type" value={contract_type} />
                    </Grid>
                    <Grid item flex={1} p={1} >
                        <Statistics title={'Country of Origin'} value={country} />
                    </Grid>
                </Grid>

                {/* Contact Details */}
                <Stack>
                    <Accordion variant='elevation' elevation={0}>
                        <AccordionSummary sx={{ px: 0 }}>
                            <Chip icon={<FaceOutlined />} label={`Contact Details - ${ot['_address']?.alias_name}`} />
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack p={0} direction={'row'} gap={3}>
                                <Statistics title={'Phone Number'} value={phone_number} />
                                <Statistics title={'Email'} value={email} />
                                <Statistics title={'Location'} value={ot['_address']?.region} />
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
                        <Button type='default' htmlType='submit'>Update</Button>
                    </Stack>
                </Form>

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
                                <PermissionControl label={"Supply Duration"} name="supply_duration" value={supply_duration} form={offtakeForm} />
                            </Grid>
                            <Grid flex={1} item xs={12} md={12} lg={6} p={1}>
                                <PermissionControl label={"Offer price Per Unit"} name="price" value={`R ${ot?.offer_price_per_unit ? ot?.offer_price_per_unit.toFixed(2) : (0).toFixed(2)}`} form={offtakeForm} />
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