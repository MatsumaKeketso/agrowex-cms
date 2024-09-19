import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { OfftakeService } from '../services/offtakeService'
import { useNavigate, useParams } from 'react-router-dom';
import { ref } from 'firebase/database';
import { realtimeDB } from '../services/authService';
import { Box, colors, IconButton, Stack, Typography } from '@mui/material';
import { Avatar, Button, Divider, List, message, Modal, Progress, Skeleton, Statistic, Table, Tooltip } from 'antd';
import OfftakeDetails from '../components/OfftakeDetails';
import { useDispatch, useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ArrowDownwardRounded, AttachFileRounded, Fullscreen, RemoveRedEyeRounded } from '@mui/icons-material';
import StatusTag from '../components/StatusTag';
import { SystemService } from '../services/systemService';
import { setActiveOfftake } from '../services/offtake/offtakeSlice';
export const FarmSubmissionColumns = [
  {
    title: 'Farm Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
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
const livestockTypes = [
  { key: '1', type: "Cattle" },
  { key: '2', type: "Sheep" },
  { key: '3', type: "Goats" },
  { key: '4', type: "Pigs" },
  { key: '5', type: "Chickens" },
  { key: '6', type: "Ducks" },
  { key: '7', type: "Turkeys" },
  { key: '8', type: "Horses" },
  { key: '9', type: "Rabbits" },
  { key: '10', type: "Bees" },
];

const livestockColumns = [
  {
    title: 'Livestock Type',
    dataIndex: 'type',
    key: 'type',
  },
];
const produceTypes = [
  { key: '1', type: "Wheat" },
  { key: '2', type: "Corn" },
  { key: '3', type: "Soybeans" },
  { key: '4', type: "Barley" },
  { key: '5', type: "Oats" },
  { key: '6', type: "Rice" },
  { key: '7', type: "Fruits" },
  { key: '8', type: "Vegetables" },
  { key: '9', type: "Nuts" },
  { key: '10', type: "Herbs" },
];

const produceColumns = [
  {
    title: 'Produce Type',
    dataIndex: 'type',
    key: 'type',
  },
];
const deliveryColumns = [
  {
    title: 'Delivery Date',
    dataIndex: 'DeliveryDate',
    key: 'DeliveryDate',
  },
  {
    title: 'Size',
    dataIndex: 'Size',
    key: 'Size',
  },
  {
    title: 'Comment',
    dataIndex: 'Comment',
    key: 'Comment',
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
  {
    title: 'Produce',
    dataIndex: 'Produce',
    key: 'Produce',
  },
  {
    title: 'Image',
    dataIndex: 'Image',
    key: 'Image',
  },
];
const FarmerView = ({ record }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [documents, setDocuments] = useState([])
  const offtake = useSelector((state) => state.offtake.active)
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

  useEffect(() => {
    console.log(offtake);
    OfftakeService.getOfftakeDocuments(offtake.offtake_id).then((_documents) => {
      setDocuments(_documents)

    })
    // loadMoreData();
  }, []);
  return (<Stack direction={'row'} >
    <Stack flex={1} gap={2} bgcolor={colors.grey[200]}>
      {/* Profile */}
      <Stack p={2}>
        <Stack direction={'row'} gap={2}>
          <Avatar size={'large'}></Avatar>
          <Stack gap={1}>
            <Typography variant='h5'>{record.name}</Typography>
            <Typography variant='subtitle1'>{record.type}</Typography>
            <Stack>
              <Button style={{ alignSelf: 'start' }}>Chat</Button>
            </Stack>
          </Stack>
        </Stack>
        <Stack direction={'row'} flexWrap={'wrap'} gap={5}>
          <Statistic title="Farm Hecters" value={50} />
          <Statistic title="Email" value={record.contact.email} />
          <Statistic title="Phone Number" formatter={(value) => {
            return value
          }} value={record.contact.phoneNumber} />
          <Statistic title="Address" value={record.address} />
        </Stack>
      </Stack>
      <Stack>
        <Stack p={2}>
          <Typography variant='subtitle1'>Attachments</Typography>
        </Stack>
        <Stack direction={'row'}  >
          <Stack flex={1} >
            <InfiniteScroll
              dataLength={data.length}
              height={300}
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
                      title={document.name}
                    />
                    <Stack direction={'row'} gap={1}>
                      <Button>
                        Preview
                      </Button>
                    </Stack>
                  </List.Item>
                )}
              />
            </InfiniteScroll>
          </Stack>
          <Stack flex={1} height={'100%'}>
            <Box sx={{ width: '100%', height: '100%', background: colors.grey[300] }} >
              <iframe style={{ width: '100%', height: '100%', border: 'solid 0px' }} src='https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/documents%2FYour%20Curriculum%20Vitae%20.pdf?alt=media&token=0fa86281-4f59-4027-9627-cd8ca7266954' />
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
    <Stack flex={1}>
      {offtake.status == 'active' && (
        <Stack py={3} alignItems={'center'}>
          <Progress type="dashboard" percent={75} gapDegree={30} />
          <Typography variant='caption'>Delivered</Typography>
          <Typography variant='subtitle1'>Cherry Tomato</Typography>
          <Typography variant='h6'>10tons</Typography>
          <Stack>
            <Table columns={deliveryColumns} dataSource={deliveryUpdates} />
          </Stack>
        </Stack>
      )}

      <Stack p={2}>
        <Typography variant='subtitle1' fontWeight={'bold'}>Farm Produce</Typography>
      </Stack>
      <Stack direction={'row'}>
        <Stack flex={1}>
          <Table columns={livestockColumns} dataSource={livestockTypes} />
        </Stack>
        <Stack flex={1}>
          <Table columns={produceColumns} dataSource={produceTypes} />
        </Stack>
      </Stack>
    </Stack>
  </Stack>)
}
const FarmSubmissions = () => {
  const [finalstage, setFinalStage] = useState(false)
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [farms, setFarms] = useState([])
  const [selectedFarms, setSelectedFarms] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [required, setRequired] = useState(2700)
  const [tonsSelected, setTons] = useState(0)
  const { offtake_id } = useParams()
  const offtake = useSelector((state) => state.offtake?.active);
  const [messageAPI, useContext] = message.useMessage()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const onSelectChange = (newSelectedRowKeys, c) => {
    console.log('selectedRowKeys changed: ', c);
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
    return farms
      .filter(farm => keysArray.includes(farm.key)) // Filter the farms by the keys in the array
      .reduce((total, farm) => total + farm.offers.requestedOffer, 0); // Sum the requestedOffer values
  };
  const getSelectedFarms = (keysArray) => {
    return farms
      .filter(farm => keysArray.includes(farm.key)) // Filter the farms by the keys in the array
  };
  const listenForFarmSubmissions = () => {
    if (offtake.suppliers) {
      setFarms(offtake.suppliers)
      let a = 0
      offtake.suppliers.forEach(f => {
        a = a + f.offers.requestedOffer
      });
      setTons(a)
    } else {
      OfftakeService.getFarmSubmissions().then(f => {
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
        console.log(data);
      }
    });
  };

  useEffect(() => {
    listenForFarmSubmissions()
  }, [])
  return (
    <Layout >
      {useContext}
      <Modal title="Status Update" open={finalstage} onOk={() => {
        setLoading(true)
        OfftakeService.getOfftake(offtake_id).then(ot => {
          const _status = {
            status_name: 'finalstage',
            updated_at: SystemService.generateTimestamp()
          }
          const updated_offtake = { ...ot, suppliers: selectedFarms, status: [...ot.status, _status] }
          OfftakeService.updateOfftake(ot.offtake_id, updated_offtake).then(() => {
            dispatch(setActiveOfftake(updated_offtake))
            setFinalStage(false)
            setLoading(false)
          })
        })
      }} okButtonProps={{ loading: loading }}
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
            <StatusTag status={'finalstage'} />
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
            <StatusTag status={'finalstage'} />
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

      <Stack gap={0} sx={{ overflow: 'hidden' }} flex={1} direction={'row'} position={'relative'}>
        <Stack flex={1} sx={{ overflow: 'auto' }}>
          <Stack direction={'row'} gap={1} alignItems={'center'}>
            <Stack gap={0} p={2} flex={1}>
              <Typography variant='h6' flex={1}>Suppliers</Typography>
              <Typography variant='body2' flex={1}>Closing Date : { }</Typography>
            </Stack>
            <Typography variant='h6' p={2} flex={1}>{tonsSelected}t / {tonsSelected < required ? required : tonsSelected}t</Typography>
            {currentStatus !== 'finalstage' && currentStatus !== 'active' && (<Button onClick={() => {
              OfftakeService.getOfftake(offtake_id).then(_offtake => {
                // check for master contract
                const { master_contract } = _offtake;
                if (master_contract) {
                  setFinalStage(true)
                } else {
                  messageAPI.warning('Master Contract required')
                }

              })
            }} disabled={tonsSelected < required} size='large' type='primary'>Final Stage</Button>)}
            {currentStatus === 'finalstage' && (<Button onClick={() => {
              setActive(true)
            }} disabled={tonsSelected < required} size='large' type='primary'>Activate Offtake</Button>)}
          </Stack>
          <Table
            rowSelection={currentStatus === 'finalstage' || currentStatus === 'active' ? null : rowSelection}
            dataSource={farms}
            columns={FarmSubmissionColumns}
            expandable={{
              expandedRowRender: (record) => <FarmerView record={record} />,
              rowExpandable: (record) => record.name !== 'Not Expandable',
            }} />
        </Stack>
        <Stack position={'sticky'} flex={0.5} gap={2} p={1} sx={{ overflowY: 'auto' }}>
          <OfftakeDetails setOfftakeId={() => { }} showSubmissions={true} />
        </Stack>
      </Stack>
    </Layout>
  )
}

export default FarmSubmissions