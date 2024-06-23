import React, { useState } from "react";
import Layout from "../components/Layout";
import {
    Avatar,
    Box,
    ButtonBase,
    Divider,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import { Table, Button, Badge, Tag, Drawer } from "antd";
import { useDispatch, useSelector } from "react-redux";
import OfftakeDetails from "../components/OfftakeDetails";
import { setActiveOfftake } from "../services/offtake/offtakeSlice";
import { PManagers } from "../database/db-data";
const _columns = [
    {
        title: 'Customer Id',
        dataIndex: 'customerId',
        key: 'customerId',
    },
    {
        title: 'Customer',
        dataIndex: 'customer',
        key: 'customer',
    },
    // {
    //     title: 'Amount',
    //     dataIndex: 'amount',
    //     key: 'amount',
    // },
    {
        title: 'Start Date',
        dataIndex: 'startDate',
        key: 'startDate',
    },
    {
        title: 'Due Date',
        dataIndex: 'dueDate',
        key: 'dueDate',
    },
    // { // removing reference, can be searched for (maybe)
    //     title: 'Reference',
    //     dataIndex: 'reference',
    //     key: 'refernce',
    // },
    {
        title: 'ContractType',
        dataIndex: 'contractType',
        key: 'contractType',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (v, r) => {
            return (<Stack sx={{ alignItems: 'flex-start' }}>
                <Tag >{r.status}</Tag>
            </Stack>);
        }
    },

];
const data = [
    {
        customerId: 'AGRO-1678451052830',
        customer: 'Manana Inc',
        startDate: '02/06/24',
        dueDate: '02/09/24',
        contractType: 'On Demand Supply',
        status: 'New',

    },
    {
        customerId: 'AGRO-1678451052831',
        customer: 'FarmFresh Ltd',
        startDate: '01/15/24',
        dueDate: '04/15/24',
        contractType: 'Fixed Supply',
        status: 'Pending',

    },
    {
        customerId: 'AGRO-1678451052832',
        customer: 'GreenGrocers Co.',
        startDate: '03/10/24',
        dueDate: '06/10/24',
        contractType: 'On Demand Supply',
        status: 'Completed',

    },
    {
        customerId: 'AGRO-1678451052833',
        customer: 'Organic Farms LLC',
        startDate: '05/20/24',
        dueDate: '08/20/24',
        contractType: 'Fixed Supply',
        status: 'In Progress',
        assigned: PManagers["12AB34XY"]

    },
    {
        customerId: 'AGRO-1678451052834',
        customer: 'HealthyHarvest Inc',
        startDate: '04/01/24',
        dueDate: '07/01/24',
        contractType: 'On Demand Supply',
        status: 'Cancelled',

    }
];
const Offtake = () => {
    const [openOfftake, setOpenOfftake] = useState(false);
    const dispatch = useDispatch()
    const offtake = useSelector((state) => state.offtake)
    const columns = [..._columns, {
        title: 'Actions',
        dataIndex: 'actions',
        fixed: 'right',
        key: 'actions',
        render: (v, r) => {
            return <Stack>
                <Button onClick={() => {
                    dispatch(setActiveOfftake(r))
                    setOpenOfftake(true)
                }}>View More</Button>
            </Stack>
        }
    },]
    return (
        <Layout>
            <Drawer size="large" title={offtake?.active?.status || ""} onClose={() => {
                dispatch(setActiveOfftake({}))
                setOpenOfftake(false)
            }} open={openOfftake} extra={
                <Stack direction={'row'} gap={1}>
                    <Button type="link" danger={true} onClick={() => { }}>Cancel Request</Button>
                    <Button onClick={() => { }}>
                        Pipeline
                    </Button>
                </Stack>
            } ><OfftakeDetails /></Drawer>
            <Stack position={"relative"} flex={1} p={2} spacing={2}>
                <Stack
                    position={"sticky"}
                    direction={"row"}
                    spacing={2}
                    alignItems={"center"}
                >
                    <Typography variant="h5">Offtakes</Typography>
                    <Box flex={1}></Box>
                </Stack>
                <Table
                    size="small"
                    style={{ height: "100%" }}
                    columns={columns}
                    dataSource={data}
                    scroll={{ x: 1500, y: 700 }}
                />
            </Stack>
        </Layout>
    );
};

export default Offtake;
