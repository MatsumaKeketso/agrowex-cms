import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { OfftakeService } from '../services/offtakeService'
import { useNavigate, useParams } from 'react-router-dom';
import { ref, set } from 'firebase/database';
import { firestoreDB, realtimeDB } from '../services/authService';
import { Box, CardContent, CardHeader, colors, IconButton, Stack, Typography } from '@mui/material';
import { Avatar, Button, Card, Divider, Empty, List, message, Modal, Popconfirm, Progress, Segmented, Skeleton, Spin, Statistic, Table, Timeline, Tooltip, Upload } from 'antd';
import OfftakeDetails from '../components/OfftakeDetails';
import { useDispatch, useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ArrowDownwardRounded, AttachFileRounded, Fullscreen, RemoveRedEyeRounded, SwipeRightAltOutlined } from '@mui/icons-material';
import StatusTag from '../components/StatusTag';
import { SystemService } from '../services/systemService';
import { setActiveOfftake } from '../services/offtake/offtakeSlice';
import { ArrowLeftOutlined, PauseOutlined, PlayCircleOutlined, SwapRightOutlined } from '@ant-design/icons';
import Documents from '../components/Documents';
import { FarmerService } from '../services/farmerService';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { Helpers } from '../services/helpers';
export const FarmSubmissionColumns = [
  {
    title: 'Farm Name',
    dataIndex: ['farm_profile', 'farm_name'],
    key: 'farm_name',
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
      return <>{v}{r.unit}</>
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
  // {
  //   title: 'Phone Number',
  //   dataIndex: ['contact', 'phoneNumber'], // Accessing nested property
  //   key: 'phoneNumber',
  // },
  // {
  //   title: 'Email',
  //   dataIndex: ['contact', 'email'], // Accessing nested property
  //   key: 'email',
  // },

  // {
  //   title: 'Requested Offer',
  //   dataIndex: ['offers', 'requestedOffer'], // Accessing nested property
  //   key: 'requestedOffer',
  // },
  // {
  //   title: 'Delivered',
  //   dataIndex: ['offers', 'delivered'], // Accessing nested property
  //   key: 'delivered',
  // },
  // {
  //   title: 'Address',
  //   dataIndex: 'address',
  //   key: 'address',
  // },

];
const productionColumns = [
  {
    title: 'Date',
    dataIndex: 'stepAndDate',
    key: 'stepAndDate',
  },

  {
    title: 'Comment',
    dataIndex: 'comments',
    key: 'comments',
    render: (text) => {
      const truncatedText = text.substring(0, 48).trim();
      return (
        <Tooltip title={text}>
          <div style={{ maxHeight: '48px', overflow: 'hidden' }}>
            {truncatedText}
            {text.length > 48 && '...'}</div>
        </Tooltip>
      )
    }
  },

];
const productionColumnsFS = [
  {
    title: 'End Date',
    dataIndex: 'stepAndDate',
    key: 'stepAndDate',
    width: 150
  },
  {
    title: 'Farmer',
    dataIndex: 'farmer',
    key: 'farmer',
  },
  {
    title: 'Produce',
    dataIndex: 'produce',
    key: 'produce',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },

  {
    title: 'Comment',
    dataIndex: 'comments',
    key: 'comments',

  },

];
const deliveryColumns = [
  {
    title: 'Date',
    dataIndex: 'stepAndDate',
    key: 'stepAndDate',
  },

  {
    title: 'Comment',
    dataIndex: 'comments',
    key: 'comments',
    render: (text) => {
      const truncatedText = text ? text.substring(0, 48).trim() : text;
      return (
        <Tooltip title={text}>
          <div style={{ maxHeight: '48px', overflow: 'hidden' }}>
            {truncatedText}
            {/* {text.length > 48 && '...'} */}
          </div>
        </Tooltip>
      )
    }
  },

];
const TrackerData = [
  {
    offTakeId: "AGRID-1673451062583",
    farmer: "Mantshwa farm",
    produce: "Cherry Tomato",
    status: "Land Preparation",
    stepAndDate: "02 Sep 2024",
    step: "Site selection and soil test",
    comments:
      "We are currently preparing a land of 15 hectares at Mantshwa Farm, located in Greater Giyani at the longitude of 28.674 and latitude of -23.098 by May 2024.",
    image: "View image",
  },
  {
    offTakeId: "AGRID-1673451062583",
    farmer: "Mantshwa farm",
    produce: "Cherry Tomato",
    status: "Land Preparation",
    stepAndDate: "02 Sep 2024",
    step: "Tilling and Leveling",
    comments:
      "We are currently preparing a land of 15 hectares at Mantshwa Farm, located in Greater Giyani at the longitude of 28.674 and latitude of -23.098 by May 2024.",
    image: "View image",
  },
  {
    offTakeId: "AGRID-1673451062583",
    farmer: "Mantshwa farm",
    produce: "Cherry Tomato",
    status: "Land Preparation",
    stepAndDate: "02 Sep 2024",
    step: "Irrigation, planting & amendments",
    comments:
      "We are currently preparing a land of 15 hectares at Mantshwa Farm, located in Greater Giyani at the longitude of 28.674 and latitude of -23.098 by May 2024.",
    image: "View image",
  },
  {
    offTakeId: "AGRID-1673451062583",
    farmer: "Mantshwa farm",
    produce: "Cherry Tomato",
    status: "Seeding",
    stepAndDate: "02 Sep 2024",
    step: "Choose Seeds, prep soil & soil moisture",
    comments:
      "We are currently preparing a land of 15 hectares at Mantshwa Farm, located in Greater Giyani at the longitude of 28.674 and latitude of -23.098 by May 2024.",
    image: "View image",
  },
  {
    offTakeId: "AGRID-1673451062583",
    farmer: "Mantshwa farm",
    produce: "Cherry Tomato",
    status: "Seeding",
    stepAndDate: "02 Sep 2024",
    step: "Planting depth, spacing, seed placement & covering seed",
    comments:
      "We are currently preparing a land of 15 hectares at Mantshwa Farm, located in Greater Giyani at the longitude of 28.674 and latitude of -23.098 by May 2024.",
    image: "View image",
  },
];

const FarmerView = ({ record }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [viewDoc, setViewDoc] = useState({});
  const [tableSegment, setTableSegment] = useState('Production');
  const [productionComments, setProductionComments] = useState([]);
  const [limitedProductionComments, setLimitedProductionComments] = useState([]);
  const [deliveryComments, setDeliveryComments] = useState([]);
  const [address, setAddress] = useState({});
  const [tableModal, setTableModal] = useState(false);
  const offtake = useSelector((state) => state.offtake.active);
  const navigate = useNavigate();
  const { farm_profile } = record
  const deliveryUpdates = [
    {
      key: '1',
      DeliveryDate: '02 Jan 2024',
      Size: '2 ton',
      Comment: 'We Are Currently Preparing A Land Of 15 Hectors Using A Tractor And Disk Harrow And Grass Slasher. We Should Be Completing On The 15th Of May 2024',
      Produce: 'Tomato',
      Image: 'View',
    },
    {
      key: '2',
      DeliveryDate: '02 Apr 2024',
      Size: '2 ton',
      Comment: 'We Are Currently Preparing A Land Of 15 Hectors Using A Tractor And Disk Harrow And Grass Slasher. We Should Be Completing On The 15th Of May 1034',
      Produce: 'Tomato',
      Image: 'View',
    },
  ];
  const loadMoreData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    fetch('https://randomuser.me/api/?results=10&inc=name,gender,email,nat,picture&noinfo')
      .then((res) => res.json())
      .then((body) => {
        setData([...data, ...body.results]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };
  const getProductionPlan = () => {
    OfftakeService.getProductionPlan(offtake.offtake_id).then((plan) => {
      Helpers.nestProductionData(plan).then((nestedData) => {
        console.log({ nestedData });

        setProductionComments([])
        nestedData.forEach(category => {
          category._steps.forEach(step => {
            const { name } = step
            step._costing.forEach(cost => {
              if (cost?.comment) {
                const { subject, comment, actual_amount, file_url, updated_at } = cost
                const _comment = {
                  children:
                    <Stack gap={1}>

                      <Typography variant='body2' fontWeight={'bold'} color={'GrayText'}>{subject}</Typography>
                      <Typography variant='body2' >{comment}</Typography>
                      <Typography variant='caption' color={'GrayText'}>{name}</Typography>
                      <Divider>{SystemService.formatTimestamp(updated_at)}</Divider>
                    </Stack>,
                }
                setProductionComments([...productionComments, _comment])
              }

            });
          });
        });
        // subject
        // comment
        // actual_amount
        // file_url
        console.log({ nestedData });

      })
    })
  }
  const getAddress = () => {
    FarmerService.getFarmAddress(farm_profile.farm_id).then((a) => {
      setAddress(a);
    })

  }
  useEffect(() => {
    console.log(farm_profile);

    getAddress()
    getProductionPlan()
    OfftakeService.getOfftakeDocuments(offtake.offtake_id).then((_documents) => {
      setDocuments(_documents)
    })
    // loadMoreData();
  }, []);
  return (
    <Stack gap={2}>
      <Stack direction={'row'} >
        <Modal style={{
          top: 20,
        }} width={1000} footer={
          <Segmented
            value={tableSegment}
            options={['Production', 'Delivery']}
            onChange={(value) => {
              setTableSegment(value)
              console.log(value); // string
            }}
          />} onCancel={() => {
            setTableModal(false)
          }} title={`${tableSegment} Tracker Details`} open={tableModal} bodyStyle={{ height: '80vh', }}>
          {tableSegment === 'Production' ? (
            <Stack py={3} px={1}>
              <Timeline
                mode='left'
                items={productionComments}
              />
            </Stack>
          ) : (
            <Stack>
              <Table style={{ flex: 1, width: '100%' }} columns={deliveryColumns} dataSource={[]} />
            </Stack>
          )}
        </Modal>

        <Stack flex={1} gap={2} p={1} overflow={'hidden'} borderRadius={2} bgcolor={colors.grey[200]}>
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
                      navigate(`/offtakes/${offtake.offtake_id}/chat`)
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
          <Card title="Attachments" extra={
            <Upload showUploadList={false}>
              <Button>Attach Document</Button>
            </Upload>}>
            <Stack>
              <Stack direction={'row'} gap={1}  >
                <Stack flex={1} >
                  <InfiniteScroll
                    dataLength={farm_profile?.certificates?.length || 0}
                    height={400}

                    endMessage={<Divider plain> We've reached the end of the list' 🤐</Divider>}
                    scrollableTarget="scrollableDiv"
                  >
                    <List
                      dataSource={farm_profile.certificates}

                      renderItem={(document) => (
                        <List.Item style={{ display: 'flex', alignItems: 'center' }} key={document.id}>
                          <List.Item.Meta
                            avatar={<IconButton size='small'>
                              <AttachFileRounded />
                            </IconButton>}
                            title={document.name}
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
                {viewDoc?.name && (<Stack height={'100%'}>
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
                  <Progress type="dashboard" percent={75} />
                  <Stack p={1} >
                    <Typography>Production</Typography>
                  </Stack>

                </Stack>
                <SwapRightOutlined />
                <Stack flex={1} alignItems={'center'}>
                  <Progress type="dashboard" percent={0} />
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
                    console.log(value); // string
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
                        items={productionComments}
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
                <Stack width={'100%'} py={3}>
                  <Table style={{ flex: 1, width: '100%' }} columns={deliveryColumns} dataSource={[]} />
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
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography>TOTAL INCOME</Typography>
              <Typography>= R 3 360 000.00 [(@R7000/ton) x 8 tons production/ha]</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>PRODUCTION COST</Typography>
              <Typography>= R 2 392 490.01 [(@R39 874,83/ha) x 60 has]</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>AGROWEX SOFTWARE LICENSING</Typography>
              <Typography>= R 111 000.00 [@R1850/ha x60]</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">TOTAL PROFIT</Typography>
              <Typography variant="h6" fontWeight="bold">= R 856 510,20 [@R14 275,17/ha x60 ha]</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>

  )
}
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
  const { offtake_id } = useParams()
  const offtake = useSelector((state) => state.offtake?.active);
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
    const a = submissions
      .filter(sub => keysArray.includes(sub.uid)) // Filter the farms by the keys in the array
      .reduce((total, sub) => total + (sub.offer_quantity * 1), 0); // Sum the requestedOffer values
    return a
  };
  const getSelectedFarms = (keysArray) => {
    return submissions
      .filter(sub => keysArray.includes(sub.uid)) // Filter the farms by the keys in the array
  };
  const listenForFarmSubmissions = () => {
    OfftakeService.getFarmSubmissions(offtake_id).then(f => {
      setFarms(f)
      console.log(f);
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
        console.log(f);
      })
    }

    return
    // eslint-disable-next-line no-unreachable
    const chatRef = ref(realtimeDB, `farm-submissions/${offtake_id}`);
    // eslint-disable-next-line no-undef
    onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(data);
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
      <Modal title="Status Update" open={finalstage} onOk={() => {
        setLoading(true)
        const _status = {
          status_name: 'contracting',
          updated_at: SystemService.generateTimestamp()
        }
        const updated_offtake = { ...offtake, status: [...offtake.status, _status] }
        // UPDATE SELECTED SUBMISSIONS to true
        const updatedSubmissions = updateSubmissionSelections(submissions, selectedFarms);
        // update unselected submission to false
        console.log(updatedSubmissions);
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
        OfftakeService.updateOfftake(offtake.offtake_id, updated_offtake).then(() => {
          dispatch(setActiveOfftake(updated_offtake))
          setFinalStage(false)
          setLoading(false)
        })
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
            navigate('/offtakes')
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
              navigate(`/offtakes`)
            }} icon={<ArrowLeftOutlined />}></Button>
            <Stack gap={0} p={2} flex={1}>
              <Typography variant='h6' flex={1}>Farmers who are interested</Typography>
            </Stack>
            <Typography variant='h6' p={2} flex={1}>{tonsSelected}{offtake?.unit} / {tonsSelected < required ? `${required}${offtake?.unit}` : `${tonsSelected}${offtake?.unit}`}</Typography>
            {currentStatus !== 'contracting' && currentStatus !== 'active' && (<Button onClick={() => {
              if (offtake.master_contract) {
                setFinalStage(true)
              } else {
                messageAPI.warning('Master Contract required')
              }

            }} disabled={tonsSelected < required} size='large' type='primary'>Final Stage</Button>)}
            {currentStatus === 'contracting' && (<Button onClick={() => {
              setActive(true)
            }} disabled={tonsSelected < required} size='large' type='primary'>Activate Offtake</Button>)}
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
              expandedRowRender: (record) => <FarmerView record={record} />,
              rowExpandable: (record) => record.name !== 'Not Expandable',
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