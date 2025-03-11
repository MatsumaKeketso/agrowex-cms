import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Button, Space, Input, Carousel, Card, Image, Descriptions, List, Radio, Upload } from 'antd';
import { Stack } from '@mui/material';
import { EditOutlined, ShoppingCartOutlined, SearchOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons';

import StoreService from "../services/storeService";
import Layout from "../components/Layout";
const { Dragger } = Upload;

const { Text } = Typography;
const expandedRowRender = (record) => {
  return (
    <Table
      columns={[
        {
          title: 'Item',
          dataIndex: '_commodity_meta',
          key: 'item',
          render: (meta) => (
            <Stack spacing={1}>
              <Image width={50} src={meta?.img || "-"} />
              <Text strong>{meta?.name || "-"}</Text>
            </Stack>
          ),
        },
        {
          title: 'Category',
          dataIndex: '_commodity_meta',
          key: 'meta_category',
          render: (meta) => <Tag color="blue">{meta?.productCategory || "-.--"}</Tag>,
        },
      ]}
      dataSource={[]}
      pagination={false}
    />
  );
};

const Store = () => {
  const [tab, setTab] = React.useState(0);
  const [drawer, setDrawer] = React.useState(false);
  const [pageLoading, setPageLoading] = React.useState(true);
  const [openCategoryDrawer, setOpenCategoryDrawer] = useState(false);
  const [stores, setStores] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [selectedSize, setSelectedSize] = useState('1 Gal');

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
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
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      const productName = record.productName || '';
      const searchValue = value.toLowerCase();

      return productName.toString().toLowerCase().includes(searchValue);
    },
  });
  const columns = [
    {
      title: 'Product Code',
      dataIndex: 'product_code',
      key: 'product_code',
      render: (text) => <Text strong>{text || " --"}</Text>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="green">{text || " --"}</Tag>,
    },
    {
      title: 'Price Details',
      dataIndex: '_price_details',
      key: 'price_details',
      render: (_price_details) => (
        <Stack spacing={1}>
          <Text strong>Final : R {_price_details?.final_price || "-.--"} </Text>
          <Text type="secondary">Original : R {_price_details?.origin_price || "-.--"}</Text>
          <Text type="secondary">Service Fee : R {_price_details?.service_fee || "-.--"}</Text>
        </Stack>
      ),
    },
    {
      title: 'Packaging',
      dataIndex: '_commodity_details',
      key: 'packaging',
      render: (_commodity_details) => (
        <Stack spacing={1}>
          <Text strong>{_commodity_details?.quantity || "--"} {_commodity_details?.packaging || "--"}</Text>
          <Text>{_commodity_details?.weight || "--"} {_commodity_details?.matrix || "--"}</Text>
        </Stack>
      ),
    },
  ];


  // Filter `option.label` match the user type `input`
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  useEffect(() => {
    StoreService.getAll().then((data) => {
      console.log(data);
      setStores(data)
      setPageLoading(false)
    })
  }, [])
  return (
    <Layout>
      <Table
        columns={columns}
        dataSource={stores}
        expandable={{ expandedRowRender }}
        pagination={{ pageSize: 5 }}
      />
    </Layout>
  );
};

export default Store;
