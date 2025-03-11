import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  Box,
  Stack,
} from "@mui/material";
import { Table, Tag, Typography, Avatar, Button, Space, Descriptions, Input, Statistic, Card, Layout as AntLayout } from 'antd';
import MarketService from "../services/marketService";
import { EditOutlined, EllipsisOutlined, SearchOutlined, BarChartOutlined } from '@ant-design/icons';
const expandedRowRender = (record) => {
  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      <Typography.Title level={5}>Sales Performance</Typography.Title>

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
        <Card style={{ minWidth: 200 }}>
          <Statistic
            title="Quantity Sold"
            value={record.qtySold[0]}
            suffix={`/ ${record.qtyAvailable}`}
            precision={0}
          />
          <Typography.Text type="secondary">{record.qtySold[1]}</Typography.Text>
        </Card>

        <Card style={{ minWidth: 200 }}>
          <Statistic
            title="Kilograms Sold"
            value={record.kgSold[0]}
            precision={0}
          />
          <Typography.Text type="secondary">{record.kgSold[1]}</Typography.Text>
        </Card>

        <Card style={{ minWidth: 200 }}>
          <Statistic
            title="Value Sold"
            value={record.valueSold[0].replace('R', '')}
            prefix="R"
            precision={2}
          />
          <Typography.Text type="secondary">{record.valueSold[1]}</Typography.Text>
        </Card>
      </Stack>

      <Descriptions title="Product Details" bordered column={{ xs: 1, sm: 2, md: 3 }}>
        <Descriptions.Item label="Commodity ID">{record.commodityId}</Descriptions.Item>
        <Descriptions.Item label="Package ID">{record.packageId}</Descriptions.Item>
        <Descriptions.Item label="Key">{record.key}</Descriptions.Item>
        <Descriptions.Item label="Price Per Matrix">R{record.pricePerMatrix}</Descriptions.Item>
        <Descriptions.Item label="Category">{record.productCategory}</Descriptions.Item>
      </Descriptions>
    </Stack>
  );
};
const Market = () => {
  const [pageLoading, setPageLoading] = useState(true)
  const [markets, setMarkets] = useState([])
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
      // Custom filter logic for the commodity
      const commodity = record.commodity || '';
      const name = record.name || '';
      const productCategory = record.productCategory || '';
      const searchValue = value.toLowerCase();

      return commodity.toString().toLowerCase().includes(searchValue) ||
        name.toString().toLowerCase().includes(searchValue) ||
        productCategory.toString().toLowerCase().includes(searchValue);
    },
  });
  const columns = [
    {
      title: 'Commodity',
      key: 'commodity',
      ...getColumnSearchProps('commodity'),
      render: (record) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={record.img}
            alt={record.name}
            shape="square"
            size={54}
          />
          <Stack>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {record.name}
            </Typography.Title>
            <Typography.Text type="secondary">
              {record.productCategory} · ID: {record.commodityId}
            </Typography.Text>
          </Stack>
        </Stack>
      ),
    },
    {
      title: 'Packaging',
      key: 'packaging',
      render: (record) => (
        <Stack>
          <Typography.Text strong>{record.packaging}</Typography.Text>
          <Typography.Text type="secondary">
            ID: {record.packageId}
          </Typography.Text>
        </Stack>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      render: (record) => (
        <Stack>
          <Typography.Text strong>{record.price}/kg</Typography.Text>
          <Typography.Text type="secondary">
            Avg: {record.avgPricePerKg}
          </Typography.Text>
        </Stack>
      ),
      sorter: (a, b) => parseFloat(a.price.replace('R', '')) - parseFloat(b.price.replace('R', '')),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (record) => (
        <Stack>
          <Typography.Text strong>{record.qtyAvailable} available</Typography.Text>
          <Typography.Text type="secondary">
            Sold: {record.qtySold[0]}
          </Typography.Text>
        </Stack>
      ),
      sorter: (a, b) => parseFloat(a.qtyAvailable) - parseFloat(b.qtyAvailable),
    },
    // {
    //   title: 'Actions',
    //   key: 'actions',
    //   render: () => (
    //     <Space>
    //       <Button type="primary" icon={<EditOutlined />} size="small">
    //         Edit
    //       </Button>
    //       <Button icon={<BarChartOutlined />} size="small">
    //         Analytics
    //       </Button>
    //     </Space>
    //   ),
    // },
  ];
  useEffect(() => {
    MarketService.getAll().then((data) => {
      console.log(data);
      setMarkets(data)
      setPageLoading(false)
    })
  }, [])
  return (
    <Layout>
      <AntLayout>
        <AntLayout.Header title="Market">
          <Typography.Text >Welcome to Agrowex Marketplace</Typography.Text>
        </AntLayout.Header>
        <AntLayout.Content>
          <Table
            scroll={{ y: 670 }}
            columns={columns}
            dataSource={markets}
            loading={pageLoading}
            expandable={{
              expandedRowRender,
              // expandRowByClick: true,
            }}
            rowKey="key"
          />
        </AntLayout.Content >
      </AntLayout>
    </Layout>
  );
};

export default Market;
