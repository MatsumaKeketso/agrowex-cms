import { AppBar, CardHeader, Divider, Stack, Toolbar, Typography, colors } from '@mui/material';
import { Button, Collapse, Form, Input, Select, Spin, Statistic } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Statistics from './Statistics';
import Persona from './Persona';
// import debounce from 'lodash/debounce';
import debounce from 'https://esm.sh/lodash/debounce';
import { PManagers } from '../database/db-data';
import { setActiveOfftake } from '../services/offtake/offtakeSlice';
import { CardMembership, Person2Outlined } from '@mui/icons-material';
import Documents from './Documents';
const Assign = () => {
    const [profiles, setProfiles] = useState([]);
    const offtake = useSelector((state) => state.offtake)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    useEffect(() => {
        setProfiles([])
        Object.keys(PManagers).map((uid) => {
            const profile = { ...PManagers[uid], uid: uid }
            setProfiles(prev => [...prev, { profile: profile, label: `${profile.name} | ${profile.department}`, value: profile.name }])
        })
        console.log(profiles);
    }, [])

    return (
        <Select loading={loading} disabled={loading} showSearch labelInValue placeholder={loading ? "Assigning..." : "Search..."} options={profiles} onChange={(v, o) => {
            setLoading(true)
            const { profile } = o
            const assigned = { ...offtake.active, assigned: profile }
            setTimeout(() => {
                setLoading(false)
                dispatch(setActiveOfftake(assigned))
            }, 3000);
        }} style={{ width: '40%' }} />)
}
const AssignOM = () => {

}
const OfftakeDetails = (props) => {
    const { data } = props;
    const offtake = useSelector((state) => state.offtake)
    return (
        <Stack spacing={3}>
            <Stack>
                <Stack direction={'row'}>
                    <Stack flex={1}>
                        <Typography variant='h4'>Offtake Details</Typography>
                    </Stack>
                    {offtake?.active?.assigned && (<Persona user={offtake?.active?.assigned} />)}
                    {!offtake?.active?.assigned && (<Assign />)}
                </Stack>
            </Stack>
            <Stack spacing={2}>
                <Stack direction={'row'} gap={2}>
                    <Statistics inputMode={true} title="Active Users" value={112893} />
                    <Statistics input={true} title="Active Users" value={112893} />
                    <Statistics input={true} title="Active Users" value={112893} />
                </Stack>

                <Stack>
                    <Collapse>
                        <Collapse.Panel header={<Stack direction={'row'} alignItems={'center'} gap={2}><Person2Outlined /> <Typography>Contact Details</Typography></Stack>}>
                            <Stack p={0} direction={'row'} gap={3}>
                                <Statistics title={'Phone Number'} value={"0642828115"} />
                                <Statistics title={'Email'} value={"0642828115"} />
                                <Statistics title={'Location'} value={"0642828115"} />
                            </Stack>
                        </Collapse.Panel>

                    </Collapse>
                </Stack>

                <AppBar sx={{ borderRadius: 5 }} variant='outlined' position='sticky' >
                    <Toolbar variant='dense'  >
                        <Typography>Product details</Typography>
                    </Toolbar>
                </AppBar>
                <Stack p={0} direction={'row'} flexWrap={'wrap'} gap={3}>
                    <Statistics title={'Category Type'} value={"Fruit"} />
                    <Statistics title={'Product Name'} value={"Tomato"} />
                    <Statistics title={'Production Method'} value={"Organic"} />
                    <Statistics title={'Country of Origin'} value={"South Africa"} />
                </Stack>
                <Form layout='vertical' onFinish={(v) => {
                    console.log(v);
                }} >
                    <Stack bgcolor={colors.grey[100]} p={3} gap={3}>
                        <Stack direction={'row'} gap={2}>
                            <Statistics inputMode={true} title="Total Order Quantity" value={112893} />
                            <Statistics inputMode={true} title="Delivery Frequency" value={112893} />
                        </Stack>
                        <Stack direction={'row'} gap={2}>
                            <Statistics inputMode={true} title="Supply Duration" value={112893} />
                            <Statistics inputMode={true} title="Offer price Per Unit" value={112893} />
                            <Statistics inputMode={true} title="Quality/Grade" value={112893} />
                        </Stack>
                        <Stack gap={2}>
                            <Stack>
                                <Form.Item name="comment" label="Comments">
                                    <Input.TextArea />
                                </Form.Item>
                            </Stack>
                            <Button htmlType='submit' style={{ alignSelf: 'flex-end' }} type='primary'>Submit</Button>
                        </Stack>
                    </Stack>
                </Form>
                <Divider></Divider>
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                    <Documents />
                    <Documents />
                    <Documents />
                    <Documents upload={true} />
                </Stack>
            </Stack>
        </Stack>
    )
}

export default OfftakeDetails