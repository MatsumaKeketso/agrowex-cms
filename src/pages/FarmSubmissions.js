import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { OfftakeService } from '../services/offtakeService'
import { useNavigate, useParams } from 'react-router-dom';
import { ref, set } from 'firebase/database';
import { firestoreDB, realtimeDB, storage } from '../services/authService';
import { Box, CardContent, CardHeader, colors, IconButton, ListItem, ListItemText, Stack, Typography, List as MList, Backdrop, CircularProgress, Chip } from '@mui/material';
import { Avatar, Button, Card, Descriptions, Typography as ATypography, Divider, Empty, Form, Input, List, message, Modal, Popconfirm, Progress, Segmented, Skeleton, Spin, Statistic, Table, Timeline, Tooltip, Upload, DatePicker, InputNumber, Badge, Tag } from 'antd';
import OfftakeDetails, { getDaysBetween } from '../components/OfftakeDetails';
import { useDispatch, useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ArrowDownwardRounded, AttachFileRounded, Fullscreen, RemoveRedEyeRounded, SwipeRightAltOutlined } from '@mui/icons-material';
import StatusTag from '../components/StatusTag';
import { SystemService } from '../services/systemService';
import { setActiveOfftake } from '../services/offtake/offtakeSlice';
import { ArrowLeftOutlined, PauseOutlined, PlayCircleOutlined, SwapRightOutlined, TruckOutlined } from '@ant-design/icons';
import Documents from '../components/Documents';
import { FarmerService } from '../services/farmerService';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { Helpers } from '../services/helpers';
import { getDownloadURL, uploadBytesResumable, ref as sRef, uploadBytes } from 'firebase/storage';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import DocumentService from '../services/documentService';
import dayjs from "dayjs";
import DeliveryDatePicker from '../components/DeliveryDatePicker';
const { RangePicker } = DatePicker;
export const FarmSubmissionColumns = [
  {
    title: 'Farm Name',
    dataIndex: ['farm_profile', 'farm_name'],
    key: 'farm_name',
    render: (v, r) => {
      return (<Stack direction={'row'} gap={1}>{v} {r?.selected ? (<Chip sx={{ alignSelf: 'self-start' }} size='small' variant='outlined' color='success' label="Selected"></Chip>) : null}</Stack>)
    }
  },
  {
    title: 'Stock Available',
    dataIndex: 'is_stock_available',
    key: 'is_stock_available',
  },
  {
    title: 'Offer Quantity',
    dataIndex: ['offer_quantity'], // Accessing nested property
    key: 'offer_quantity',
    render: (v, r) => {
      return <>{v}QTY</>
    }
  },
  {
    title: 'Submitted',
    dataIndex: ['timestamp'], // Accessing nested property
    key: 'timestamp',
    render: (v, r) => {
      return <Stack>{SystemService.formatTimestamp(v)}</Stack>
    }
  },
];

const FarmerView = ({ record, getRespondents }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [viewDoc, setViewDoc] = useState({});
  const [tableSegment, setTableSegment] = useState('Production');
  const [productionComments, setProductionComments] = useState([]);
  const [productionSearchComments, setProductionSearchComments] = useState([]);
  const [limitedProductionComments, setLimitedProductionComments] = useState([]);
  const [deliveryComments, setDeliveryComments] = useState([]);
  const [productionPlan, setProductionPlan] = useState([]);
  const [address, setAddress] = useState({});
  const [profitability, setProfitability] = useState({});
  const [tableModal, setTableModal] = useState(false);
  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [productionProgress, setProductionProgress] = useState(0);
  const [attachmentProgress, setAttachmentProgress] = useState(0);
  const [delInt, setDelInt] = useState(0);
  const offtake = useSelector((state) => state.offtake.active);
  const user = useSelector((state) => state.user.profile);
  const params = useParams();
  const [supplyForm] = Form.useForm()
  const navigate = useNavigate();
  const { farm_profile } = record
  // todo: get the rest of attachments on the offer

  const deliveryColumns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text, r) => {
        return (
          <Stack direction={'row'} gap={1}>
            <Spin size='small' spinning={text === 'pending'} />
            {text !== "pending" && <TruckOutlined />}
            <Tag>{text ? text : 'pending'}</Tag>
          </Stack>
        )
      }
    },
    {
      title: 'Duration',
      dataIndex: 'delivery_interval',
      key: 'delivery_interval',
      render: (text, r) => {
        return (
          <Stack>
            <Typography variant='body2'>{SystemService.formatTimestamp(r.delivery_interval[0])}</Typography>
          </Stack>
        )
      }
    },
    {
      title: 'Amount',
      dataIndex: 'expected_supply_amount',
      key: 'expected_supply_amount',
      render: (text, r) => {
        return (
          <Stack>
            <Typography variant='body2'>{text}{record.unit}</Typography>
          </Stack>
        )
      }
    },
  ];
  const validateNumber = (_, value) => {
    if (value <= 0) {
      return Promise.reject(new Error("Number must be greater than 0"));
    }
    return Promise.resolve();
  };
  const handleExpectedSupply = (values) => {
    var i = []
    values.intervals.forEach(interval => {
      const { delivery_interval, expected_supply_amount } = interval
      const _interval = {
        status: interval.status,
        delivery_interval: [SystemService.standardiseTimestamp(delivery_interval)],
        expected_supply_amount: expected_supply_amount

      }
      i.push(_interval)
    });
    const updated_application = {
      supply_requirements: i
    }
    OfftakeService.updateDelivery(offtake.offtake_id, record.uid, updated_application).then(() => {
      setShowSupplyForm(false)
      getRespondents(offtake)
      message.success("Supply requirements updated successfully")
    })
  }
  const limit = (count, array) => {
    return array.slice(0, count);
  }
  const getProductionPlan = () => {
    OfftakeService.getProductionPlan(offtake.offtake_id).then((plan) => {
      Helpers.nestProductionData(plan).then((nD) => {

        const nestedData = nD?.groupedCategories || []
        setProductionPlan(nestedData)

        const progress = (nD?.items_with_comments / plan.length) * 100
        setProductionProgress(progress)
        if (progress === 100) {
          setTableSegment('Delivery')
          if (!record?.supply_requirements) {
            setShowSupplyForm(true)
          } else {
            setDeliveryComments(record?.supply_requirements)
          }
        }
        SystemService.profitabilityCalucation(offtake, nestedData).then((profit) => {
          setProfitability(profit)
        })
        setProductionComments([])
        setProductionSearchComments([])
        nestedData.forEach(category => {
          const c_name = category?.name
          category._steps.forEach(step => {
            const { name } = step
            step._costing.forEach(cost => {
              if (cost?.comment) {
                const { subject, comment, actual_amount, file_url, updated_at, cost_name, amount } = cost
                const _comment = {
                  comment: comment,
                  subject: subject,
                  children:
                    <Stack flex={1}><Stack flex={1} gap={1}>
                      <Stack direction={'row'} gap={1} alignItems={'center'}>
                        <Typography flex={1} variant='body2' fontWeight={'bold'}>{subject}</Typography>
                        <Typography variant='caption'>{SystemService.formatTimestamp(updated_at)}</Typography>
                      </Stack>
                      <Stack gap={2} direction={'row'}>
                        <Stack flex={1}>
                          <Typography variant='body2' color={'GrayText'}>{comment}</Typography>
                          <Typography variant='caption' color={'GrayText'}>{c_name} • {name} • {cost_name}</Typography>
                        </Stack>
                        <Stack flex={1}>
                          <Descriptions layout='horizontal' column={1} size={'small'}>
                            <Descriptions.Item label="Estimated Amount">R{Number(amount).toFixed(2)}</Descriptions.Item>
                            <Descriptions.Item label="Actual Amount">R{Number(actual_amount).toFixed(2)}</Descriptions.Item>
                          </Descriptions></Stack>
                      </Stack>

                      <Stack pt={1}>
                        <Documents type={"button"} url={file_url} name={subject} />
                      </Stack>
                    </Stack>

                      <Divider></Divider>
                    </Stack>
                  ,
                }
                setProductionComments(prev => [...prev, _comment])
                setProductionSearchComments(prev => [...prev, _comment])
              }

            });
          });
        });
      })
    })
  }
  const searchComments = (search_term) => {
    const search = productionComments.filter((comment) => {
      return comment.comment.toLowerCase().includes(search_term.toLowerCase()) || comment.subject.toLowerCase().includes(search_term.toLowerCase())
    })
    console.log({ search_term, search });

    setProductionSearchComments(search)
  }
  const getAddress = () => {
    FarmerService.getFarmAddress(farm_profile.farm_id).then((a) => {
      setAddress(a);
    })

  }
  const uploadAttachment = (file) => {

    return new Promise((resolve, reject) => {
      setLoading(true)
      try {
        // upload attachment to firestore then put the document object in the farmer profile's document subcollection
        const metadata = {
          contentType: file.type
        };
        const storageRef = sRef(storage, 'cms-documents/farmer_attachments/' + file?.name);
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
          (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setAttachmentProgress(progress.toFixed(0))
          },
          (error) => {
            reject(error)
          },
          () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
            });
          }
        );

      } catch (error) {
        setLoading(false)
        console.log(error);
        reject(error)
      }
    });

  }
  const getDocuments = () => {
    setDocuments([])
    FarmerService.getFarmDocuments(farm_profile.farm_id).then((docs) => {
      setDocuments(docs)
      if (farm_profile?.certificates) {
        setDocuments([...documents, ...farm_profile.certificates])
      }
    })
  }
  const getDeliveryComments = () => {
  }
  const calCulateDeliveryBatch = () => {
    const delivery_frequency = `${offtake?.delivery_frequency}`.toLowerCase()
    const supply_duration = getDaysBetween(offtake?.supply_duration)
    const split = supply_duration.split(" ")
    const frequencyMap = {
      "daily": 1,
      "weekly": 7,
      "biweekly": 14,
      "monthly": 30,
      "quarterly": 90,
      "semiannually": 182,
      "annually": 365
    };

    const _delivery_interval = parseInt(split[0]) / frequencyMap[delivery_frequency]
    const a = parseInt(_delivery_interval.toFixed(0))
    // push default items in form
    const data = []
    for (let index = 0; index < a; index++) {
      const _def_data = {
        status: "pending",
        expected_supply_amount: 0
      }
      data.push(_def_data)
    }
    console.log(data);

    supplyForm.setFieldValue('intervals', data.map((d) => {
      return {
        status: d.status,
        expected_supply_amount: d.expected_supply_amount
      }
    }))

  }
  useEffect(() => {
    getAddress()
    getProductionPlan()
    getDocuments()
    calCulateDeliveryBatch()
    // loadMoreData();

  }, []);
  return (
    <Stack gap={2} sx={{
      position: 'relative', // This is crucial
      bgcolor: 'background.paper',
      border: '1px solid #ddd',
      p: 1,
      borderRadius: 4,
      overflow: 'hidden' // Optional: prevents content from flowing outside
    }}>

      <Stack direction={'row'}>
        <Modal style={{
          top: 20,
        }}
          width={1000}
          footer={
            <Segmented
              value={tableSegment}
              options={['Production', 'Delivery']}
              onChange={(value) => {
                setTableSegment(value)
              }}
            />}
          onCancel={() => {
            setTableModal(false)
          }}
          title={`${tableSegment} Tracker Details`}
          open={tableModal} styles={{ height: '65vh', }}
        >
          <Stack p={2}>
            <Input.Search
              style={{ maxWidth: 300 }}
              onChange={(value) => {
                const search_term = value.target.value
                if (search_term) {
                  searchComments(search_term)
                } else {
                  setProductionSearchComments(productionComments)
                }
              }}
              placeholder="Search Comments" />
          </Stack>
          <Stack maxHeight={'80vh'} overflow={'auto'}>
            {tableSegment === 'Production' ? (
              <Stack py={3} px={1}>
                {productionSearchComments.length === 0 && (<Empty />)}
                {productionSearchComments.length > 0 && (
                  <Timeline
                    mode='left'
                    items={productionSearchComments}
                  />
                )}
              </Stack>
            ) : ( // Delivery
              <Stack>
                <Table style={{ flex: 1, width: '100%' }} columns={deliveryColumns} dataSource={deliveryComments} />
              </Stack>
            )}
          </Stack>

        </Modal>

        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            // The following overrides make the backdrop target the parent container
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pt: 10,
            alignItems: 'flex-start',
            backdropFilter: 'blur(5px)',
          }}
          open={showSupplyForm}
        >
          <Card title="Delivery" size='small' actions={[<Button onClick={() => { supplyForm.submit() }} type='primary'>Save</Button>]} >
            <DeliveryDatePicker />
            <Form layout='vertical' style={{ width: 300 }} form={supplyForm} onFinish={(v) => { handleExpectedSupply(v) }} >
              <Form.List
                name="intervals"
              >
                {(fields, { add, remove }, { errors }) => (
                  <Stack gap={1}>
                    {fields.map((field, index) => (
                      <Stack gap={2}>
                        <Card hoverable title={`Delivery ${field.name + 1}`} size='small'>
                          <Stack flex={1} gap={2}>
                            <Form.Item hidden initialValue={'pending'} rules={[{ required: true }]} name={[field.name, "status"]} label="Status">
                              <Input style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item rules={[{ required: true }]} name={[field.name, "delivery_interval"]} label="Delivery Interval">
                              <DatePicker />
                            </Form.Item>
                            <Form.Item rules={[{ required: true }, { validator: validateNumber }]} name={[field.name, "expected_supply_amount"]} label="Expected Supply Amount">
                              <InputNumber style={{ width: '100%' }} suffix={offtake?.unit} />
                            </Form.Item>
                          </Stack>
                        </Card>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Form.List>
            </Form>
          </Card>
        </Backdrop>
        <Stack flex={1} gap={2} p={1} direction={OfftakeService.getStatus.Name(offtake.status) === 'active' ? "column" : 'row'} overflow={'hidden'} borderRadius={2} bgcolor={colors.grey[100]}>
          {/* Profile */}
          <Stack p={2} gap={2}>
            <Stack gap={2}>
              <Stack direction={'row'} gap={2}>
                <Avatar size={'large'} src={farm_profile.logo_url}></Avatar>
                <Stack gap={1}>
                  <Typography variant='h5'>{farm_profile?.farm_name}</Typography>
                  <Typography variant='subtitle1'>{farm_profile?.farm_type}</Typography>
                  <Stack>
                    <Button onClick={() => {
                      navigate(`/offtakes/${params.offtake_page}/${offtake.offtake_id}/chat`)
                    }} style={{ alignSelf: 'start' }}>Chat</Button>
                  </Stack>
                </Stack>
              </Stack>
              <Typography variant='body2'>{farm_profile?.bio}</Typography>
            </Stack>
            <Divider />
            <Stack direction={'row'} flexWrap={'wrap'} gap={5}>
              <Statistic title="Farm Hecters" value={50} />
              <Statistic title="Email" value={farm_profile.email} />
              <Statistic title="Phone Number" value={`+(${farm_profile.phone.country_calling_code}) ${farm_profile.phone.phone_number}`} />

              {/* Might use later code */}
              {/* <Statistic title="Phone Number" formatter={(value) => {
                const { country_calling_code, phone_number } = value
                return 
              }} value={`${farm_profile.phone}`} /> */}

              <Statistic title="Category" value={farm_profile?.category} />
              <Statistic title="Commodity" value={farm_profile?.commodity} />

            </Stack>
            <Statistic title="Address" value={address?.place_name || "..."} />
            <Divider />
          </Stack>

          {/* Attachments */}
          <Card style={{ minWidth: "50%" }} title="Attachments" extra={
            <Stack >
              <Upload showUploadList={false} onChange={(info) => {
                const file = info.file.originFileObj;
                uploadAttachment(file).then((url) => {
                  const _doc = {
                    uploaded_by: user.uid,
                    name: file?.name,
                    url: url,
                    type: file.type,
                    size: file.size,
                    uploaded_at: SystemService.generateTimestamp()
                  }
                  if (!loading) {
                    FarmerService.addDocument(farm_profile.farm_id, _doc).then(() => {
                      setLoading(false)
                      setAttachmentProgress(0)
                      getDocuments()
                      message.success(`Document uploaded successfully to : ${farm_profile.farm_name}`)
                    })
                  }

                })
              }}>
                <Button loading={loading}>Attach Document</Button>
              </Upload>
              {loading && <Progress percent={attachmentProgress} />}
            </Stack>

          }>
            <Stack flex={1}>
              <Stack direction={'row'} gap={1} flex={1}  >
                <Stack flex={1} >
                  <InfiniteScroll
                    dataLength={farm_profile?.certificates?.length || 0}
                    height={400}

                    endMessage={<Divider plain> We've reached the end of the list' 🤐</Divider>}
                    scrollableTarget="scrollableDiv"
                  >
                    <List
                      dataSource={documents}

                      renderItem={(document) => (
                        <List.Item style={{ display: 'flex', alignItems: 'center' }} key={document.id}>
                          <List.Item.Meta
                            avatar={<IconButton size='small'>
                              <AttachFileRounded />
                            </IconButton>}
                            title={document?.name}
                          />
                          <Stack direction={'row'} gap={1}>
                            <Button disabled={viewDoc.url === document.url} onClick={() => {
                              setViewDoc(document);
                            }} >
                              Preview
                            </Button>
                          </Stack>
                        </List.Item>
                      )}
                    />
                  </InfiniteScroll>
                </Stack>
                {viewDoc?.name && (
                  <Stack flex={1} height={'100%'}>
                    <Documents url={viewDoc.url} name={viewDoc.name} />
                  </Stack>)}

              </Stack>
            </Stack>
          </Card>
        </Stack>

        {OfftakeService.getStatus.Name(offtake.status) === 'active' && (
          <Stack flex={1} gap={2}>
            <Stack py={3} alignItems={'center'}>
              {/* <Progress type="dashboard" percent={75} gapDegree={30} />
            <Typography variant='caption'>Delivered</Typography>
            <Typography variant='subtitle1'>Cherry Tomato</Typography>
            <Typography variant='h6'>10tons</Typography>
            <Stack>
              <Table columns={deliveryColumns} dataSource={[deliveryUpdates[0]]} />
            </Stack> */}
              <Stack spacing={2} direction={'row'} alignItems={'center'}>
                <Stack flex={1} alignItems={'center'}>
                  <Progress type="dashboard" percent={Number(productionProgress).toFixed(0)} />
                  <Stack p={1} >
                    <Typography>Production</Typography>
                  </Stack>

                </Stack>
                <SwapRightOutlined />
                <Stack flex={1} alignItems={'center'}>

                  <Progress type="dashboard" percent={Number(0).toFixed(0)} />  {/* = 0 😊 */}
                  <Stack p={1}>
                    <Typography>Delivery</Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Stack alignItems={'center'}>
                <Segmented
                  value={tableSegment}
                  options={['Production', 'Delivery']}
                  onChange={(value) => {
                    setTableSegment(value)
                  }}
                />
              </Stack>
              {tableSegment === 'Production' ? (
                <Stack width={'100%'} py={3}>
                  {productionComments.length === 0 && (<Empty />)}
                  {productionComments.length > 0 && (
                    <>
                      <Timeline
                        mode='left'
                        items={limit(2, productionComments)}
                      />
                      <Stack p={1}>
                        <Button onClick={() => {
                          setTableModal(true)
                        }}>View All</Button>
                      </Stack>
                    </>
                  )}

                </Stack>
              ) : (
                <Stack width={'100%'} py={3} >
                  <Table style={{ flex: 1, width: '100%' }} columns={deliveryColumns} dataSource={deliveryComments} />
                  <Stack p={1}>
                    <Button onClick={() => {
                      setTableModal(true)
                    }}>View All</Button>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
        )}

        {/* Currently showing this data in the profile */}
        {/* 
          {OfftakeService.getStatus.Name(offtake.status) === 'published' || OfftakeService.getStatus.Name(offtake.status) === 'contracting' ? (
            <Stack p={2} spacing={1}>
              <Stack>
                <Typography variant='subtitle1'>Farm Produce</Typography>
              </Stack>
              <Stack gap={1}>
                <Divider>Comodity</Divider>
                <List dataSource={farm_profile.commodity}
                  renderItem={(item) => {
                    return <Typography variant='body2'>{item}</Typography>
                  }}
                />
                <Divider>Category</Divider>
                <List dataSource={farm_profile.category}
                  renderItem={(item) => {
                    return <Typography variant='body2'>{item}</Typography>
                  }}
                />
              </Stack>
            </Stack>
          ) : null} 
           */}


      </Stack>
      <Card size='small'>
        <Stack gap={1} px={2}>
          <ATypography.Title level={3}>Profitability Breakdown</ATypography.Title>
          <ATypography>Please note that this is an estimated breakdown of cost and profit for this offtake. It is adjusted throughout the production process for transperancy and fairness ensuring your business attains a sustainable profitability.</ATypography>
        </Stack>
        <MList >
          <ListItem>
            <ListItemText primary="Total Income" secondary={`${SystemService.formatCurrency((parseFloat(offtake?.offer_price_per_unit) * parseFloat(record.offer_quantity)))}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Production Cost" secondary={`${SystemService.formatCurrency(record?.prod_cost)} \n Calc: [${record?.prod_item?.map(String)?.join(" + ")}]`} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Agrowex Software Licensing" secondary={`${SystemService.formatCurrency((((parseFloat(offtake?.offer_price_per_unit) * parseFloat(record.offer_quantity)) + parseFloat(record?.prod_cost)) * .10))} \n Calc: @ 10%`} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Total Profit" secondary={`${SystemService.formatCurrency(((parseFloat(offtake?.offer_price_per_unit) * parseFloat(record.offer_quantity)) + record?.prod_cost + (((parseFloat(offtake?.offer_price_per_unit) * parseFloat(record.offer_quantity)) + parseFloat(record?.prod_cost)) * .10)))} \n Calc: overall cost`} />
          </ListItem>
        </MList>
      </Card>
    </Stack>

  )
}
const document_data = {
  companyName: "MWAKOBA AND ASSOCIATES COMPANY LIMITED",
  regNo: "1200867",
  tin: "129-727-810",
  address: "P.O BO 32853, DAR ES SALAAM",
  country: "TANZANIA",
  phone: "+255 713 315 719",
  email: "alikomwakoba@gmail.com",
  recipient: {
    name: "HESTER HALL",
    company: "PHOFU MILLING",
    address: "P.O BOX 144, MHAKAMME WARD",
    id: "548316311",
    phone: "+27845829236",
    email: "hester.lovet@gmail.com"
  },
  date: "13TH NOVEMBER, 2024",
  content: "MWAKOBA AND ASSOCIATES COMPANY LIMITED intent to express our interest in purchasing 10,000 metric tons (MT) of SUGAR BEANS, Non-GMO...",
  specifications: {
    commodity: "SUGAR BEANS",
    quantity: "10,000 METRIC TONS",
    quality: "SUGAR BEANS - GRADE A Non-GMO",
    packaging: "50KG",
    paymentMethod: "Payment term to be sight ESCROW ACCOUNT after all terms and conditions applied as per the contract agreed.",
    price: "USD $ 997/MT",
    deliveryTerms: "FOB",
    destinationPort: "JOHANNESBURG, SOUTH AFRICA"
  }
};
const FarmSubmissions = () => {
  const [finalstage, setFinalStage] = useState(false)
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [farms, setFarms] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [selectedFarms, setSelectedFarms] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [required, setRequired] = useState(0)
  const [tonsSelected, setTons] = useState(0)
  const { offtake_id, offtake_page } = useParams()
  const offtake = useSelector((state) => state.offtake?.active);
  const profile = useSelector((state) => state.user?.profile);
  const [messageAPI, useContext] = message.useMessage()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const onSelectChange = (newSelectedRowKeys, c) => {
    setSelectedRowKeys(newSelectedRowKeys);
    const t = calculateTotalRequestedOffer(newSelectedRowKeys)
    setTons(t)
    const sF = getSelectedFarms(newSelectedRowKeys)
    setSelectedFarms(sF)
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'odd',
        text: 'Select Odd Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false;
            }
            return true;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: 'even',
        text: 'Select Even Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true;
            }
            return false;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
  };
  const currentStatus = OfftakeService.getStatus.Name(offtake.status);

  const calculateTotalRequestedOffer = (keysArray) => {
    console.log({ keysArray, submissions });
    const a = submissions
      .filter(sub => keysArray.includes(sub.key)) // Filter the farms by the keys in the array
      .reduce((total, sub) => total + (sub.offer_quantity), 0); // Sum the requestedOffer values
    // .reduce((total, sub) => total + (sub.offer_quantity * offtake.weight), 0); // Sum the requestedOffer values
    console.log(a);
    return a
  };
  const getSelectedFarms = (keysArray) => {
    return submissions
      .filter(sub => keysArray.includes(sub.uid)) // Filter the farms by the keys in the array
  };
  const listenForFarmSubmissions = () => {
    OfftakeService.getFarmSubmissions(offtake_id).then(f => {
      setFarms(f)
    })
    return
    if (offtake.suppliers) {
      setFarms(offtake.suppliers)
      let a = 0
      offtake.suppliers.forEach(f => {
        a = a + f.offers.requestedOffer
      });
      setTons(a)
    } else {
      OfftakeService.getFarmSubmissions(offtake_id).then(f => {
        setFarms(f)
      })
    }

    return
    // eslint-disable-next-line no-unreachable
    const chatRef = ref(realtimeDB, `farm-submissions/${offtake_id}`);
    // eslint-disable-next-line no-undef
    onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
      }
    });
  };
  const getRespondents = async (ot) => {
    const q = query(collection(firestoreDB, `/offtakes/${ot.offtake_id}/_farm_applications`));
    const querySnapshot = await getDocs(q);
    setSubmissions([])
    var subs = []
    if (querySnapshot.empty) {
      console.log('No matching documents.');
      return;
    }
    await querySnapshot.forEach(async (sub) => { // submission info
      if (sub.exists()) {
        const docRef = doc(firestoreDB, "users", sub.id);
        const farm_profile = await getDoc(docRef); // farmer info
        if (farm_profile.exists()) {
          subs.push({ ...sub.data(), key: sub.id, farm_profile: { ...farm_profile.data(), farm_id: farm_profile.id } })
          if (sub.data().selected) {
            setTons(tonsSelected + (sub.data().offer_quantity * 1))
          }
        }
      } else {
        console.log("No such document!");
      }
    });

    setTimeout(() => {
      setSubmissions(subs)
    }, 1000);
  }
  const generateSelectedDocument = async (pdfBytes, _updated_offtake) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const storageRef = sRef(storage, `cms-test-pdfs/${Date.now()}.pdf`);
    // const storageRef = storage().ref(`cms-test-pdfs/${Date.now()}.pdf`);
    uploadBytes(storageRef, blob).then(() => {
      getDownloadURL(storageRef).then((url) => {
        const updated_offtake = {
          ...offtake,
          _final_document: {
            name: 'Letter of Intent for ' + offtake_id,
            file_url: url,
            created_at: SystemService.generateTimestamp(),
            created_by: profile.uid,
            size: blob.size,
          }
        }
        OfftakeService.updateOfftake(offtake.offtake_id, updated_offtake).then(async () => {

          dispatch(setActiveOfftake(updated_offtake))
          setFinalStage(false)
          setLoading(false)
        })
      });
      console.log('Uploaded a blob or file!');
    }).catch((error) => {
      console.error(error);
    });
  }
  const updateSubmissionSelections = (originalSubmissions, selectedSubmissions) => {
    // Create a Set of selected submission IDs for efficient lookup
    const selectedIds = new Set(selectedSubmissions.map(sub => sub.uid));

    // Map over original submissions and update each one
    return originalSubmissions.map(submission => ({
      ...submission,
      selected: selectedIds.has(submission.uid)
    }));
  };
  useEffect(() => {
    OfftakeService.getOfftake(offtake_id).then(o => {
      if (o) {
        setRequired(o.quantity)
        dispatch(setActiveOfftake(o))
        getRespondents(o)
      }
    })
  }, [])
  return (
    <Layout >
      {useContext}
      <Modal title="Status Update" open={finalstage} onOk={async () => {
        setLoading(true)
        const _status = {
          status_name: 'contracting',
          updated_at: SystemService.generateTimestamp()
        }
        const updated_offtake = { ...offtake, status: [...offtake.status, _status] }
        // UPDATE SELECTED SUBMISSIONS to true
        const updatedSubmissions = updateSubmissionSelections(submissions, selectedFarms);
        // update unselected submission to false
        updatedSubmissions.forEach(sub => {
          const _sub = {
            "unit": sub.unit,
            "is_stock_available": sub.is_stock_available,
            "comments": sub.comments,
            "offer_quantity": sub.offer_quantity,
            "timestamp": sub.timestamp,
            "selected": sub.selected,
            "uid": sub.uid,
            "id": sub.id
          }
          OfftakeService.updateSubmission(offtake.offtake_id, sub.uid, _sub).then(() => {
            console.log('Sub updated');
          })
        });
        // Generate letter of intent document
        const pdfDoc = await DocumentService.generateLetterOfIntent(document_data);
        const pdfBytes = await pdfDoc.save();
        // generating web link for the document
        generateSelectedDocument(pdfBytes, updated_offtake)
      }}
        okButtonProps={{ loading: loading }}
        onCancel={() => {
          setFinalStage(false)
        }}>
        <Stack gap={3} alignItems={'center'} justifyItems={'center'} justifyContent={'center'}>
          <Typography variant="h4">Choosen</Typography>
          <Stack direction={'row'} alignSelf={'center'} gap={1}>
            <Typography variant="subtitle2">AGRO-{offtake_id}</Typography>
            <StatusTag status={'published'} />
          </Stack>
          <ArrowDownwardRounded />
          <Stack direction={'row'} alignSelf={'center'} gap={1}>
            <Typography variant="subtitle2">AGRO-{offtake_id}</Typography>
            <StatusTag status={'contracting'} />
          </Stack>
          <Typography variant="subtitle2">
            This list of selected farms for the offtake will be submitted to OP
            Manager, continue?
          </Typography>

        </Stack>
      </Modal>

      <Modal title="Status Update" open={active} onOk={() => {
        setLoading(true)
        OfftakeService.getOfftake(offtake_id).then(ot => {
          const _status = {
            status_name: 'active',
            updated_at: SystemService.generateTimestamp()
          }
          const updated_status = [...ot.status, _status]
          OfftakeService.updateOfftake(ot.offtake_id, { ...ot, status: updated_status }).then(() => {
            setActive(false)
            setLoading(false)
            navigate(`/offtakes/${offtake_page}`)
          })
        })
      }} okButtonProps={{ loading: loading }}
        onCancel={() => {
          setActive(false)
        }}>
        <Stack gap={3} alignItems={'center'} justifyItems={'center'} justifyContent={'center'}>
          <Typography variant="h4">Activate Offtake</Typography>
          <Stack direction={'row'} alignSelf={'center'} gap={1}>
            <Typography variant="subtitle2">AGRO-{offtake_id}</Typography>
            <StatusTag status={'contracting'} />
          </Stack>
          <ArrowDownwardRounded />
          <Stack direction={'row'} alignSelf={'center'} gap={1}>
            <Typography variant="subtitle2">AGRO-{offtake_id}</Typography>
            <StatusTag status={'active'} />
          </Stack>
          <Typography variant="subtitle2">
            This offtake will be put into Active, continue?
          </Typography>

        </Stack>
      </Modal>
      {offtake.offtake_id ? (<Stack gap={0} sx={{ overflow: 'hidden' }} flex={1} direction={'row'} position={'relative'}>
        <Stack flex={1} sx={{ overflow: 'auto' }}>
          <Stack pl={2} direction={'row'} gap={1} alignItems={'center'}>
            <Button onClick={() => {
              navigate(`/offtakes/${offtake_page}`)
            }} icon={<ArrowLeftOutlined />}></Button>
            <Stack gap={0} p={2} flex={1}>
              <Typography variant='h6' flex={1}>Respondents</Typography>
            </Stack>
            <Typography variant='h6' p={2} flex={1}>{tonsSelected}QTY / {`${required}QTY`} [{offtake?._commodity_details?.quantity * offtake?._commodity_details?.weight}{offtake?._commodity_details?.matrix} @ {offtake?._commodity_details?.weight}{offtake?._commodity_details?.matrix}]</Typography>

            {currentStatus !== 'contracting' && currentStatus !== 'active' && (<Button onClick={() => {
              if (offtake.master_contract) {
                setFinalStage(true)
              } else {
                messageAPI.warning('Master Contract required')
              }

            }} disabled={tonsSelected < required} size='large' type='primary'>Final Stage</Button>)}
            {/*  */}
            {currentStatus === 'contracting' && profile?.role !== "pm" && (
              <Button onClick={() => {
                setActive(true)
              }}
                disabled={tonsSelected < required} size='large' type='primary'>Activate Offtake</Button>)}
          </Stack>
          <Table
            rowSelection={currentStatus === 'contracting' || currentStatus === 'active' ? null : rowSelection}
            dataSource={submissions}
            columns={[...FarmSubmissionColumns, {
              title: "Actions",
              dataIndex: ['offers', 'actions'],
              key: 'x',
              width: 130,
              render: (v, r) => {
                const disablePause = OfftakeService.getStatus.Name(offtake.status) !== 'active'
                return (
                  <Stack>
                    <Popconfirm okButtonProps={{ disabled: disablePause }} title="Pause Farm" description="Farm activity will be suspended, continue?">
                      <Button disabled={disablePause} type='primary' icon={<PlayCircleOutlined />} shape='circle'></Button>
                    </Popconfirm>
                  </Stack>
                )
              }
            }]}
            expandable={{
              expandedRowRender: (record) => <FarmerView record={record} getRespondents={getRespondents} />,
              rowExpandable: (record) => record?.name !== 'Not Expandable',
            }} />
        </Stack>
        <Stack position={'sticky'} flex={0.5} gap={2} p={1} sx={{ overflowY: 'auto' }}>
          <OfftakeDetails setOfftakeId={() => { }} showSubmissions={true} />
        </Stack>
      </Stack>) : (
        <Stack flex={1} alignItems={'center'} alignContent={'center'}>
          <Stack py={10} >
            <Spin size='large' />
            <Typography>Getting Offtake...</Typography>
          </Stack>
        </Stack>)}

    </Layout>
  )
}

export default FarmSubmissions