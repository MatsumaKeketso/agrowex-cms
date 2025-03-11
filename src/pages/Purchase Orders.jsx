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
  Card,
  Col,
  Space,
  Row,
  Descriptions,
  Spin,
} from "antd";
import { AddRounded, ShoppingCartOutlined } from "@mui/icons-material";
import Search from "antd/es/input/Search";
import OrdersService from "../services/ordersService";
import { ClockCircleOutlined, EnvironmentOutlined, FileTextOutlined, UserOutlined } from "@ant-design/icons";
import { set } from "firebase/database";
// import type { ColumnsType } from 'antd/es/table';
const { Text, Title } = AntTypography

const OrderDetailsView = ({ orderData }) => {
  // Sample data you provided

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
const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
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


  const columns = [
    {
      title: "Invoice Number",
      width: 130,
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      fixed: "left",
    },
    {
      title: "Offtake ID",
      width: 100,
      dataIndex: "offtake_id",
      key: "offtake_id",
    },
    {
      title: "Location",
      dataIndex: "deliveryAddress",
      key: "deliveryAddress",
      width: 150,
      render: (v, r) => {
        return (
          <AntTypography.Text copyable ellipsis>{v}</AntTypography.Text>
        )
      }
    },
    {
      title: "Amount",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 150,
    },
    {
      title: "Date",
      dataIndex: "timeStamp",
      key: "timeStamp",
      width: 150,
    },
    {
      title: "Product Count",
      dataIndex: "productList",
      key: "productList",
      width: 150,
      render: (v, r) => {
        console.log({ v, r });

        return (
          <Stack>
            <AntTypography>{v?.length || 0}</AntTypography>
          </Stack>
        )
      },
    },
    {
      title: "Actions",
      key: "operation",
      width: 150,
      fixed: "right",
      render: (v, r) => {
        return <Button onClick={() => {
          setOrder(r)
          setOpen(true)
        }}>View</Button>;
      },
    },
  ];
  useEffect(() => {
    OrdersService.getAll().then((data) => {
      console.log(data);
      setOrders(data)
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
          <Typography variant="h5">Purchase Orders</Typography>
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

            style={{ height: "100%" }}
            columns={columns}
            dataSource={orders}
            scroll={{ x: 1500, y: 550 }}
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
export default PurchaseOrders;
