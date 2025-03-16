import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Backdrop,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Layout from "../components/Layout";
import StatsCard from "../components/StatsCard";
import {
  Breadcrumb,
  Drawer,
  Empty,
  Form,
  Input,
  Statistic,
  Table,
  Tag,
  theme,
  Layout as AntLayout,
  Typography as AntTypography,
  Avatar as AntAvatar,
  List as AntList,
  Button as AntButton,
  Card,
  Col,
  Image,
  Space,
  Row,
  Descriptions,
  Spin,
  Segmented,
} from "antd";
import { AddRounded, ShoppingCartOutlined } from "@mui/icons-material";
import Search from "antd/es/input/Search";
import OrdersService from "../services/ordersService";
import { EyeOutlined, FilePdfOutlined, ClockCircleOutlined, UserOutlined, EnvironmentOutlined, FileTextOutlined } from '@ant-design/icons';
import { set } from "firebase/database";
import moment from 'moment';
// import type { ColumnsType } from 'antd/es/table';
const { Text, Title } = AntTypography
const formatDate = (timestamp) => {
  return moment(timestamp).format('MMM DD, YYYY HH:mm');
};
const renderStatus = (statuses) => {
  var latestStatus = 'Processing'
  if (statuses) {
    latestStatus = statuses[statuses?.length - 1];
  }
  const statusColors = {
    'Order Placed': 'blue',
    'Processing': 'orange',
    'Shipped': 'purple',
    'Delivered': 'green',
    'Cancelled': 'red',
  };

  return (
    <Tag color={statusColors[latestStatus?.status] || 'default'}>
      {latestStatus?.status}
    </Tag>
  );
};
const OrderDetailsView = ({ orderData }) => {
  // Sample data you provided
  const _orderData = {
    "totalPrice": "2244.00",
    "farmerUids": [
      "x7WKCRSJr0SBKWnDDEhzbD0aSr03",
      "VTzn3UGQhwZWDwL4yFA8rsjPbUA3"
    ],
    "deliveryFee": "150.00",
    "deliveryAddress": "Southgate Mall, Cnr Columbine Ave & Rifle Range Rd, Mondeor, Johannesburg, Gauteng 2082, South Africa",
    "buyerUid": "x7WKCRSJr0SBKWnDDEhzbD0aSr03",
    "finalTotal": 2394,
    "productList": [
      {
        "livestock": "Bees",
        "produceKind": "By-Product",
        "weight": 1,
        "productImg": "https://sc01.alicdn.com/kf/UTB8wQQ8jiaMiuJk43PTq6ySmXXaf.jpg",
        "quantity": 3,
        "key": "Il7MthAKKQEVa5PvJS3C",
        "totalPrice": "264.00",
        "id": "Il7MthAKKQEVa5PvJS3C",
        "produceCategory": "Livestock",
        "type": "Beeswax",
        "productCode": 1604339165576,
        "price": "R88.00",
        "farmerUid": "VTzn3UGQhwZWDwL4yFA8rsjPbUA3"
      },
      {
        "produceKind": "By-Product",
        "quantity": 2,
        "productCode": 1604339135406,
        "farmerUid": "VTzn3UGQhwZWDwL4yFA8rsjPbUA3",
        "totalPrice": "156.00",
        "id": "Pf1HIMYS5l0rbUPbizeX",
        "productImg": "https://thehealthyfish.com/wp-content/uploads/2016/08/frozentilapiafishmyths_1280px_728904722cfe4b608df1234aefd6fb04-1280x720.jpeg",
        "livestock": "Fish",
        "key": "Pf1HIMYS5l0rbUPbizeX",
        "weight": 3,
        "price": "R78.00",
        "type": "Fish Bones",
        "produceCategory": "Livestock"
      },
      {
        "totalPrice": "435.00",
        "produceCategory": "Livestock",
        "productImg": "https://p1.pxfuel.com/preview/332/477/68/meat-lamb-t-bone-steak-hille-gourmets-royalty-free-thumbnail.jpg",
        "type": "Lamp Horns",
        "price": "R145.00",
        "farmerUid": "VTzn3UGQhwZWDwL4yFA8rsjPbUA3",
        "key": "hgwb2cf7kEKSgHi2nkBq",
        "produceKind": "By-Product",
        "quantity": 3,
        "productCode": 1604339078603,
        "livestock": "Sheep",
        "weight": 7,
        "id": "hgwb2cf7kEKSgHi2nkBq"
      },
      {
        "productCode": 1604338942040,
        "type": "Leghorn Chicken",
        "key": "iNl5pj2bTCbOOEVVp4gb",
        "produceCategory": "Livestock",
        "weight": 166,
        "produceKind": "Livestock",
        "livestock": "Chicken",
        "price": "R89.00",
        "id": "iNl5pj2bTCbOOEVVp4gb",
        "farmerUid": "VTzn3UGQhwZWDwL4yFA8rsjPbUA3",
        "productImg": "https://www.backyardchickens.com/content/type/61/id/6922143/width/200/height/400",
        "quantity": 1,
        "totalPrice": "89.00"
      },
      {
        "price": "R1,300.00",
        "key": "zWyQnyzmnUCPyE25jcvK",
        "weight": 430,
        "quantity": 1,
        "produceCategory": "Livestock",
        "id": "zWyQnyzmnUCPyE25jcvK",
        "productCode": 1604312473569,
        "produceKind": "Livestock",
        "farmerUid": "VTzn3UGQhwZWDwL4yFA8rsjPbUA3",
        "livestock": "Goat",
        "productImg": "https://www.israel21c.org/wp-content/uploads/2020/06/shutterstock_794370853-1000x657.jpg",
        "type": "Fibre Goats",
        "totalPrice": "1300.00"
      }
    ],
    "invoiceNumber": "AGRO-1604400141559",
    "timeStamp": "1604400141559",
    "offtake_id": "1604400141559"
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
  };

  // Table columns for product list
  const columns = [
    {
      title: 'Product',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => (
        <Space>
          <AntAvatar shape="square" size={64} src={record.productImg} />
          <div>
            <Text strong>{text}</Text>
            <div>
              <Tag color="blue">{record.livestock}</Tag>
              <Tag color="green">{record.produceKind}</Tag>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => `${weight} kg`,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `R${price}`,
    },
  ];

  return (
    <Stack gap={2}>
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col>
            <Space align="center">
              <FileTextOutlined style={{ fontSize: 24 }} />
              <Title level={3} style={{ margin: 0 }}>Order Details</Title>
            </Space>
          </Col>
          <Col>
            <Tag color="blue" style={{ fontSize: 16, padding: '4px 8px' }}>
              {orderData.invoiceNumber}
            </Tag>
          </Col>
        </Row>
        <Divider />
        <Stack mt={3} gap={2}>
          <Stack direction={'row'} gap={2}>
            <Stack flex={1} gap={2}>
              <Descriptions title="Order Information" layout="vertical" bordered>
                <Descriptions.Item label="Invoice Number" span={3}>
                  <Space>
                    <FileTextOutlined />
                    {orderData.invoiceNumber}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Date" span={3}>
                  <Space>
                    <ClockCircleOutlined />
                    {formatDate(orderData.timeStamp)}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Buyer ID" span={3}>
                  <Space>
                    <UserOutlined />
                    {orderData.buyerUid}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Stack>
            <Stack flex={1} gap={2} pt={6}>
              <Card title="Order Summary" bordered>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row justify="space-between">
                    <Col><Text>Subtotal:</Text></Col>
                    <Col><Text strong>R{orderData.totalPrice}</Text></Col>
                  </Row>
                  <Row justify="space-between">
                    <Col><Text>Delivery Fee:</Text></Col>
                    <Col><Text strong>R{orderData.deliveryFee}</Text></Col>
                  </Row>
                  <Divider style={{ margin: '12px 0' }} />
                  <Row justify="space-between">
                    <Col><Text strong style={{ fontSize: 16 }}>Total:</Text></Col>
                    <Col><Text strong style={{ fontSize: 16 }}>R{(parseInt(orderData?.totalPrice) + parseInt(orderData?.deliveryFee)).toFixed(2)}</Text></Col>
                  </Row>
                </Space>
              </Card>
            </Stack>

          </Stack>
          <Descriptions title="Delivery Information" layout="vertical" bordered>
            <Descriptions.Item label="Delivery Address" span={3}>
              <Space align="start">
                <EnvironmentOutlined style={{ marginTop: 4 }} />
                <Text>{orderData.deliveryAddress}</Text>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Stack>

      </Card>

      <Card title={<Space><UserOutlined /> Farmers</Space>} className="mt-6">
        <AntList
          dataSource={orderData.farmerUids}
          renderItem={item => (
            <AntList.Item>
              <AntList.Item.Meta
                avatar={<AntAvatar icon={<UserOutlined />} />}
                title={`Farmer ID: ${item}`}
                description="Farmer information"
              />
            </AntList.Item>
          )}
        />
      </Card>
      <Card title={<Space><ShoppingCartOutlined /> Order Items</Space>}>
        <Table
          dataSource={orderData.productList}
          columns={columns}
          pagination={false}
          rowKey="id"
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}></Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <Text strong>Subtotal:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Text strong>R{orderData.totalPrice}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}></Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <Text strong>Delivery Fee:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Text strong>R{orderData.deliveryFee}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}></Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <Text strong style={{ fontSize: 16 }}>Total:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Text strong style={{ fontSize: 16 }}>R{(parseInt(orderData?.deliveryFee) + parseInt(orderData?.totalPrice)).toFixed(2)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

    </Stack>
  );
};
const expandableConfig = {
  expandedRowRender: (record) => {
    return (
      <Table
        columns={[
          {
            title: 'Product',
            dataIndex: '_commodity_meta',
            key: 'product',
            render: (product) => (
              <Stack spacing={1} direction={'row'} alignItems={'center'}>
                <Image width={50} src={Array.isArray(product?.img) ? product?.img[0] : product?.img} />
                <Text strong>{product?.name}</Text>
              </Stack>
            ),
          },
          {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
          },
          {
            title: 'Quantity',
            dataIndex: '_commodity_details',
            key: 'quantity',
            render: (quantity) => (
              <Text>{quantity?.quantity} {quantity?.matrix} ({quantity?.weight} kg)</Text>
            ),
          },
          {
            title: 'Price',
            dataIndex: '_price_details',
            key: 'price',
            render: (_price_details) => (
              <Stack spacing={1}>
                <Text strong>Final: R {_price_details?.final_price || "-.--"}</Text>
                <Text type="secondary">Original: R {_price_details?.origin_price || "-.--"}</Text>
                <Text type="secondary">Service Fee: R {_price_details?.service_fee || "-.--"}</Text>
              </Stack>
            ),
          },
        ]}
        dataSource={record?.items?.map((item) => ({ ...item, key: item?.id })) || []}

      />
    );
  }

};
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [order, setOrder] = useState({})
  const [tab, setTab] = React.useState(0);
  const [pageLoading, setPageLoading] = useState(true)
  const [swiper, setSwiper] = React.useState(null);
  const [open, setOpen] = useState(false);
  const [openAssignDriver, setAssignDriver] = useState(false);
  const [openNewOrderDrawer, setOpenNewOrderDrawer] = useState(false);
  const { token } = theme.useToken();
  const handleChange = (event, newValue) => {
    setTab(newValue);
  };
  const handleOrderSwitch = (value) => {
    switch (value) {
      case 'unpaid':
        break;
      default:
      case 'unpaid':
        break;
        break;
    }
  }
  // const finalTotal = parseFloat(orderData.totalPrice) + orderData.deliveryFee;

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
  };
  const handleViewOrderDetails = (id) => {
    console.log(`View details for order ${id}`);
    // Implement navigation or modal display logic
  };
  const columns = [
    {
      title: 'Invoice',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Total Price',
      dataIndex: '_price_details',
      key: 'total_price',
      render: (_total) => (

        < Stack spacing={1} >
          <Text strong>Total: R {_total?.total.toFixed(2)} </Text>
          <Text type="secondary">VAT: R {_total?.vat_amount.toFixed(2)} R</Text>
          <Text type="secondary">Delivery Fee: {_total?.delivery_fee?.toFixed(2)} R</Text>
        </Stack >
      ),
    },
    {
      title: 'Delivery Address',
      dataIndex: '_delivery_address',
      key: 'delivery_address',
      render: (delivery_address) => (
        <Stack spacing={1}>
          <Text strong>{delivery_address?.street_address}</Text>
          <Text>{delivery_address?.city}, {delivery_address?.province}, {delivery_address?.country}</Text>
        </Stack>
      ),
    },
    {
      title: 'Order Status',
      dataIndex: 'statuses',
      key: 'status',
      render: (statuses) => {
        console.log(statuses);

        return (
          <Tag color="blue">{statuses ? statuses[0].status : "-- --"}</Tag>
        )
      },
    },
  ];

  // quote_doc_url

  useEffect(() => {
    OrdersService.getAll().then((data) => {
      setOrders([])
      Object.keys(data).map((key) => {
        setOrders((prev) => [...prev, { ...data[key], key: key }])
      });
      setPageLoading(false)
    })
  }, [])
  return (
    <Layout>
      <Backdrop sx={{ zIndex: 99 }} open={pageLoading}>
        <Stack alignItems={'center'} justifyContent={'center'} p={2}>
          <Spin size="large" />
        </Stack>
      </Backdrop>
      <Drawer
        title="New Order"
        open={openNewOrderDrawer}
        onClose={() => setOpenNewOrderDrawer(false)}
      >
        <Stack gap={2}>
          <Typography>Invoice Number: AGRO-1664203076594</Typography>
          <Form
            layout="vertical"
            onFinish={(values) => {
              console.log("Form Values: ", values);
            }}
          >
            <Form.Item label="Delivery Fee Exclusive Total">
              <Input />
            </Form.Item>
            <Form.Item label="Delivery Fee Inclusive Total">
              <Input />
            </Form.Item>
            <Form.Item label="Transport Fare">
              <Input />
            </Form.Item>
            <Form.Item label="Location">
              <Input />
            </Form.Item>
            <Button fullWidth variant="contained">
              Submit
            </Button>
          </Form>
          <Stack gap={2}>
            <Stack gap={1}>
              <Typography fontWeight={"bold"}>Customer Details</Typography>
              <Grid container gap={1} direction={"row"}>
                <Grid item>
                  <Statistic
                    valueStyle={{ fontSize: 16 }}
                    title="Phone Number"
                    value={"0726390088"}
                    groupSeparator=""
                  />
                </Grid>
                <Grid item>
                  <Statistic
                    valueStyle={{ fontSize: 16 }}
                    title="Email"
                    value={"agrowex.test@gmail.com"}
                  />
                </Grid>
                <Grid item>
                  <Statistic
                    title="Address"
                    valueStyle={{ fontSize: 16 }}
                    value={
                      "V&A Waterfront, East Pier Rd, Cape Town, Western Cape 8001, South Africa, Cape Town, Western Cape, South Africa"
                    }
                  />
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </Stack>
      </Drawer>
      <Stack position={"relative"} flex={1} p={2} spacing={2}>
        <Stack
          position={"sticky"}
          direction={"row"}
          spacing={2}
          alignItems={"center"}
        >
          <Typography variant="h5">Orders</Typography>
          <Segmented
            options={[{ label: 'All', value: 'all' }, { label: 'Paid', value: 'paid', disabled: true }, { label: 'Unpaid', value: 'unpaid', disabled: true }]}
            onChange={(value) => {
              // console.log(value); // string
            }}
          />
          <Box flex={1}></Box>
          {/* <Button
            variant="contained"
            onClick={() => setOpenNewOrderDrawer(true)}
          >
            New Order
          </Button> */}
          <Statistic value={orders.length} title="Total Orders" />
        </Stack>
        <Stack
          spacing={2}
          flex={1}
          sx={{
            width: "100%",
            // maxheight: "100%",
            // minheight: "100%",
          }}
        >
          <Drawer
            title="Details"
            open={open}
            onClose={() => setOpen(false)}
            getContainer={false}
            width={"50%"}
          >
            <OrderDetailsView orderData={order} />
          </Drawer>

          <Table
            size="small"
            columns={columns}
            dataSource={orders}
            rowKey="key"
            loading={pageLoading}
            expandable={expandableConfig}
            scroll={{ y: 580 }}
          />
        </Stack>
        <Divider />
        <Stack>
          <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
            export data
          </Button>
        </Stack>
      </Stack>
    </Layout>
  );
};

export default Orders;
