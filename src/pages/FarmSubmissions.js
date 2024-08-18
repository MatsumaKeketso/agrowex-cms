import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { OfftakeService } from '../db/offtake-service'
import { useNavigate, useParams } from 'react-router-dom';
import { ref } from 'firebase/database';
import { realtimeDB } from '../services/authService';
import { Box, colors, IconButton, Stack, Typography } from '@mui/material';
import { Avatar, Button, Divider, List, Modal, Skeleton, Statistic, Table } from 'antd';
import OfftakeDetails from '../components/OfftakeDetails';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ArrowDownwardRounded, AttachFileRounded, Fullscreen, RemoveRedEyeRounded } from '@mui/icons-material';
import StatusTag from '../components/StatusTag';
const FarmSubmissionColumns = [
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
const FarmerView = ({ record }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
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
    loadMoreData();
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
              next={loadMoreData}
              hasMore={data.length < 50}
              height={300}
              loader={
                <Skeleton
                  avatar
                  paragraph={{
                    rows: 1,
                  }}
                  active
                />
              }
              endMessage={<Divider plain> We've reached the end of the list' 🤐</Divider>}
              scrollableTarget="scrollableDiv"
            >
              <List
                dataSource={data}
                renderItem={(item) => (
                  <List.Item style={{ display: 'flex', alignItems: 'center' }} key={item.email}>
                    <List.Item.Meta
                      avatar={<IconButton size='small'>
                        <AttachFileRounded />
                      </IconButton>}
                      title={item.name.last}
                    />
                    <Stack direction={'row'} gap={1}>
                      <Button>
                        View
                      </Button>
                      <Button icon={<RemoveRedEyeRounded />} />
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
  const navigate = useNavigate()
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
  const calculateTotalRequestedOffer = (keysArray) => {
    return farms
      .filter(farm => keysArray.includes(farm.key)) // Filter the farms by the keys in the array
      .reduce((total, farm) => total + farm.offers.requestedOffer, 0); // Sum the requestedOffer values
  }
  const getSelectedFarms = (keysArray) => {
    return farms
      .filter(farm => keysArray.includes(farm.key)) // Filter the farms by the keys in the array
  }
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
  }

  useEffect(() => {
    listenForFarmSubmissions()
  }, [])
  return (
    <Layout >

      <Modal title="Status Update" open={finalstage} onOk={() => {
        setLoading(true)
        OfftakeService.getOfftake(offtake_id).then(ot => {
          OfftakeService.updateOfftake(ot.offtake_id, { ...ot, suppliers: selectedFarms, status: 'finalstage' }).then(() => {
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
        setActive(true)
        OfftakeService.getOfftake(offtake_id).then(ot => {
          OfftakeService.updateOfftake(ot.offtake_id, { ...ot, status: 'active' }).then(() => {
            setActive(false)
            setLoading(false)
            navigate('/offtakes')
          })
        })
      }} okButtonProps={{ loading: loading }}
        onCancel={() => {
          setFinalStage(false)
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
            {offtake.status !== 'finalstage' && (<Button onClick={() => {
              setFinalStage(true)
            }} disabled={tonsSelected < required} size='large' type='primary'>Final Stage</Button>)}
            {offtake.status === 'finalstage' && (<Button onClick={() => {
              setActive(true)
            }} disabled={tonsSelected < required} size='large' type='primary'>Activate Offtake</Button>)}
          </Stack>
          <Table
            rowSelection={offtake.status === 'finalstage' ? null : rowSelection}
            dataSource={farms}
            columns={FarmSubmissionColumns}
            expandable={{
              expandedRowRender: (record) => <FarmerView record={record} />,
              rowExpandable: (record) => record.name !== 'Not Expandable',
            }} />
        </Stack>
        <Stack position={'sticky'} flex={0.5} gap={2} p={1} sx={{ overflowY: 'auto' }}>
          <OfftakeDetails setOfftakeId={() => { }} showSubmissions={false} />
        </Stack>
      </Stack>
    </Layout>
  )
}

export default FarmSubmissions