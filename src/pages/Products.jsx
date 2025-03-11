import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Layout from "../components/Layout";
import StatsCard from "../components/StatsCard";
import { AddRounded, EditOutlined, EditRounded, RemoveRounded, SearchOutlined } from "@mui/icons-material";
import {
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Slider,
  Table,
  Tag,
  Upload,
  Avatar as AntAvatar,
  Typography as AntTypography,
  Button as AntButton,
  Layout as AntLayout,
  Space,
} from "antd";
import ProductsService from "../services/productsService";
import { EllipsisOutlined } from "@ant-design/icons";
const expandedRowRender = (record) => {
  // Column definition for the produce list in expanded view
  const produceColumns = [
    {
      title: 'Image',
      dataIndex: 'img',
      key: 'img',
      render: (img, item) => (
        <AntAvatar src={img} alt={item.name} shape="square" size={64} />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'productCategory',
      key: 'productCategory',
      render: (category) => <Tag color="green">{category}</Tag>,
    },
  ];

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      <Descriptions title="Product Details" bordered column={{ xs: 1, sm: 2, md: 3 }}>
        <Descriptions.Item label="Farmer ID">{record?.farmerUid}</Descriptions.Item>
        <Descriptions.Item label="Offtake ID"><AntTypography.Text copyable>{record?.offtake_id}</AntTypography.Text></Descriptions.Item>
        <Descriptions.Item label="Description">
          {record?.description || 'No description available'}
        </Descriptions.Item>
      </Descriptions>

      <AntTypography.Title level={5}>Produce List</AntTypography.Title>
      <Table
        columns={produceColumns}
        dataSource={record?.produceList || []}
        pagination={false}
        rowKey="name"
        size="small"
      />
    </Stack>
  );
};

const Products = () => {
  const [tab, setTab] = React.useState(0);
  const [swiper, setSwiper] = React.useState(null);
  const [products, setProducts] = React.useState([]);
  const [pageLoading, setPageLoading] = React.useState(true);
  const [product, setProduct] = useState({})
  const [open, setOpen] = useState(false);
  const [productType, setProduceType] = useState("Fruits/Veggies/Greens");
  const [inputValue, setInputValue] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const onChange = (newValue) => {
    setInputValue(newValue);
  };
  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <AntButton
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}

            size="middle"
            style={{ width: 90 }}
          >
            Search
          </AntButton>
          <AntButton
            onClick={() => handleReset(clearFilters)}
            size="middle"
            style={{ width: 90 }}
          >
            Reset
          </AntButton>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      // Custom filter logic for the product column
      const productKind = record.produceKind || '';
      const produceCategory = record.produceCategory || '';
      const searchValue = value.toLowerCase();

      return productKind.toString().toLowerCase().includes(searchValue) ||
        produceCategory.toString().toLowerCase().includes(searchValue);
    },
  });
  const columns = [
    {
      title: 'Product',
      key: 'product',
      ...getColumnSearchProps('product'),
      render: (record) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <AntAvatar
            src={record.produceList?.[0]?.img}
            alt={record.produceKind}
            shape="square"
            size={54}
          />
          <Stack>
            <AntTypography.Title level={5} style={{ margin: 0 }}>
              {record.produceKind}
            </AntTypography.Title>
            <AntTypography.Text type="secondary">
              {record.produceCategory} · {record.size}
            </AntTypography.Text>
          </Stack>
        </Stack>
      ),
    },
    {
      title: 'Product Code',
      dataIndex: 'productCode',
      key: 'productCode',
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (record) => (
        <Stack>
          <AntTypography.Text strong>{record.quantity}</AntTypography.Text>
          <AntTypography.Text type="secondary">
            {record.weight} {record.matrix}
          </AntTypography.Text>
        </Stack>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      render: (record) => (
        <Stack>
          <AntTypography.Text strong>${record?.price}</AntTypography.Text>
          <AntTypography.Text type="secondary">
            ${record?.priceDetails?.originalProductPrice || 0} + ${record?.priceDetails?.serviceFee || 0} fee
          </AntTypography.Text>
        </Stack>
      ),
    },
    // {
    //   title: 'Actions',
    //   key: 'actions',
    //   render: () => (
    //     <Space>
    //       <AntButton type="primary" icon={<EditOutlined />} size="small">
    //         Edit
    //       </AntButton>
    //       <AntButton icon={<EllipsisOutlined />} size="small" />
    //     </Space>
    //   ),
    // },
  ];
  const produceForm = [
    {
      label: "Product Name",
      name: "name",
    },

    {
      label: "Price",
      name: "price",
    },
  ];
  useEffect(() => {
    ProductsService.getAll().then((data) => {
      console.log(data);
      setProducts(data)
      setPageLoading(false)
    })
  }, [])
  return (
    <Layout>
      <Drawer
        title="Add Produce"
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Stack>
            <Segmented
              onChange={(e) => {
                setProduceType(e);
              }}
              default={productType}
              options={["Fruits/Veggies/Grains", "Livestock"]}
            />
          </Stack>
        }
        width={500}
      // style={{ width: 400 }}
      >
        <Stack>
          {productType === "Livestock" ? (
            <Form layout="vertical">
              <Upload
                name="avatar"
                listType="picture-circle"
                // className="avatar-uploader"
                showUploadList={false}
                action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
              >
                <Avatar />
              </Upload>

              {produceForm.map((item) => (
                <Form.Item label={item.label} name={item.name} key={item.name}>
                  <Input />
                </Form.Item>
              ))}
              <Form.Item label="Category">
                <Select
                  // style={{ width: 120 }}
                  options={[
                    { value: "fruits", label: "Fruits" },
                    { value: "veggies", label: "Vegetables" },
                    { value: "grains", label: "Grains" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Quantity">
                <Stack direction={"row"}>
                  <Slider
                    style={{ width: "100%" }}
                    min={1}
                    max={500}
                    onChange={onChange}
                    value={typeof inputValue === "number" ? inputValue : 0}
                  />
                  <InputNumber
                    min={1}
                    max={500}
                    style={{ margin: "0 16px" }}
                    value={inputValue}
                    onChange={onChange}
                  />
                </Stack>
              </Form.Item>
              <Button variant="contained" fullWidth>
                Add
              </Button>
            </Form>
          ) : (
            <Form layout="vertical">
              <Upload
                name="avatar"
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false}
                action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
              >
                <Avatar />
              </Upload>
              <Form.Item label="Livestock">
                <Input />
              </Form.Item>
              <Form.Item label="Quantity">
                <Stack direction={"row"}>
                  <Slider
                    style={{ width: "100%" }}
                    min={1}
                    max={500}
                    onChange={onChange}
                    value={typeof inputValue === "number" ? inputValue : 0}
                  />
                  <InputNumber
                    min={1}
                    max={500}
                    style={{ margin: "0 16px" }}
                    value={inputValue}
                    onChange={onChange}
                  />
                </Stack>
              </Form.Item>
              <Button variant="contained" fullWidth>
                Add
              </Button>
            </Form>
          )}
        </Stack>
      </Drawer>

      <AntLayout>
        <AntLayout.Content style={{maxHeight: "calc(100vh - 64px)", overflowY: "auto", background: '#fff'}}>
          <Table
            scroll={{ y: 650 }}
            loading={pageLoading}
            columns={columns}
            dataSource={products || []} // Your JSON data as an array item
            expandable={{
              expandedRowRender,
              // expandRowByClick: true,
            }}
            rowKey="productCode"
          />
        </AntLayout.Content>
        <AntLayout.Footer>
          <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
            export data
          </Button>
        </AntLayout.Footer>
      </AntLayout>
    </Layout>
  );
};

export default Products;
