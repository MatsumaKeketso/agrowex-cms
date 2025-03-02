import { Container, Stack, Typography } from '@mui/material'
import { Button, Divider, Form, Input, Layout, message, Select, Splitter, Upload } from 'antd'
import React, { useEffect, useState } from 'react'
import { AuthService } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toggleOnline, updateAuth, updateProfile } from '../services/user/userSlice'
import { Logo } from '../components/Layout'
import { AlternateEmailRounded, BusinessRounded, EmailRounded, MailOutlined, MarkEmailRead, Password, Person2Rounded, Person3Rounded } from '@mui/icons-material'
import { ProfileService } from '../services/profileService'
import { BuildOutlined, IdcardOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { SystemService } from '../services/systemService'
import { AdminService } from '../services/adminService'


const AdminProfile = () => {
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage();
  const [imageUrl, setImageUrl] = useState("'https://th.bing.com/th/id/OIP.Yaficbwe3N2MjD2Sg0J9OgHaHa?rs=1&pid=ImgDetMain'")
  const [ca, satCa] = useState({})
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [profileForm] = Form.useForm()
  const getProfile = (user) => {
    ProfileService.getProfile(user.uid).then((profile) => {
      dispatch(updateProfile(profile))
      dispatch(toggleOnline(true))
      navigate('/offtakes/1')
    }).catch((err) => {
      AuthService.signout().then(() => { messageApi.error('Failed to get profile. Signing out!') })
    })
  }

  const handleImageUpload = (info) => {
    if (info.file.status === 'done') {
      // When image upload is successful
      message.success(`${info.file.name} file uploaded successfully`);
      // You would typically get the uploaded image URL here
      // setImageUrl(uploadedImageUrl);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };
  useEffect(() => {
    setLoading(true)
    AuthService.getUser().then(user => {
      if (user) {
        dispatch(updateAuth({ uid: user.uid, displayName: user.displayName, email: user.email }));
        profileForm.setFieldsValue({ email: user.email })
        profileForm.setFieldsValue({ img: user.photoURL })
        setImageUrl(user.photoURL)
        setLoading(false)
        satCa(user)
        // getProfile(user)
      } else {
        setLoading(false)
      }
    }).catch(err => {
      setLoading(false)
      console.log(err);
    })
  }, [])
  return (

    <Layout style={{ width: '100%' }}>
      <Layout.Content style={{ width: '100%' }}>
        <Container style={{ overflowY: 'auto', height: '100vh', paddingBottom: 50 }}>
          {contextHolder}
          <Stack alignItems={'center'}>
            <Stack width={'100%'} py={5} gap={2} alignItems={'center'}>
              <Logo />
              <Typography variant="h3">Create Profile</Typography>
              <Typography textAlign={'center'} variant="body2">Please enter your details to have your profile approved</Typography>
            </Stack>
            <Divider />
            <Form
              style={{ width: '100%' }}
              form={profileForm}
              requiredMark={true}
              layout="vertical"
              onFinish={(v) => {
                setLoading(true)
                const admin_profile = {
                  img: imageUrl,
                  role: "admin",
                  approved: false,
                  uid: ca?.uid,
                  email: ca?.email,
                  fullnames: v.fullnames,
                  region: v.region,
                  province: v.province,
                  phone: v.phone,
                  empNo: v.empNo,
                  created_at: SystemService.generateTimestamp()
                }
                AdminService.createProfile(admin_profile).then((data) => {
                  setLoading(false)
                  console.log(data);
                  messageApi.success("Profile created successfully. Please wait for approval");
                  navigate("/admin/pending")
                }).catch(err => {
                  setLoading(false)
                  console.log(err);
                  messageApi.error("Failed to create profile")
                })
              }}
            >
              <Form.Item
                name="img"
                label="Profile Image"
                initialValue={imageUrl}
              >
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  maxCount={1}
                  accept='image/*'
                  showUploadList={false}
                  onChange={handleImageUpload}
                >
                  {imageUrl ? (
                    <Stack style={{ width: 90, height: 90, borderRadius: '8px', overflow: 'hidden' }}>
                      <img
                        src={imageUrl}
                        alt="avatar"
                        style={{ width: '100%', height: "100%", objectFit: 'cover' }}
                      />
                    </Stack>
                  ) : (
                    <div>
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>

              </Form.Item>
              <Stack gap={2} direction={{ xs: 'column', sm: 'row' }}>
                <Form.Item
                  style={{ flex: 1 }}
                  name="fullnames"
                  label="Full Names"
                  rules={[{ required: true, message: 'Please input your full names' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Full Names"
                  />
                </Form.Item>
                <Form.Item
                  style={{ flex: 1 }}
                  name="role"
                  label="Role"
                  rules={[{ required: true, message: 'Please select your role' }]}
                >
                  <Select placeholder="Select Role">
                    <Select.Option value="admin">Admin</Select.Option>
                    <Select.Option value="pm">Procurement Manager</Select.Option>
                    <Select.Option value="om">Opps Manager</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  style={{ flex: 1 }}
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please input your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input
                    disabled
                    prefix={<MailOutlined />}
                    placeholder="Email"
                  />
                </Form.Item>
              </Stack>
              <Stack gap={2} direction={{ xs: 'column', sm: 'row' }}>
                <Form.Item
                  style={{ flex: 1 }}
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please input your phone number' }]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Phone Number"
                  />
                </Form.Item>

                <Form.Item
                  style={{ flex: 1 }}
                  name="empNo"
                  label="Employee Number"
                  rules={[{ required: true, message: 'Please input your employee number' }]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="Employee Number"
                  />
                </Form.Item>

              </Stack>


              <Stack gap={2} direction={{ xs: 'column', sm: 'row' }}>
                <Form.Item
                  style={{ flex: 1 }}
                  name="country"
                  label="Country"
                  rules={[{ required: true, message: 'Please input your phone number' }]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Country"
                  />
                </Form.Item>

                <Form.Item
                  style={{ flex: 1 }}
                  name="region"
                  label="Region"
                  rules={[{ required: true, message: 'Please input your employee number' }]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="Region"
                  />
                </Form.Item>

              </Stack>
              <Stack gap={2} direction={{ xs: 'column', sm: 'row' }}>
                <Form.Item
                  style={{ flex: 1 }}
                  name="province"
                  label="Province"
                  rules={[{ required: true, message: 'Please select your province' }]}
                >
                  <Select placeholder="Select Province">
                    <Select.Option value="Gauteng">Gauteng</Select.Option>
                    <Select.Option value="Western Cape">Western Cape</Select.Option>
                    <Select.Option value="KwaZulu-Natal">KwaZulu-Natal</Select.Option>
                    {/* Add more provinces */}
                  </Select>
                </Form.Item>

                <Form.Item
                  style={{ flex: 1 }}
                  name="region"
                  label="Region"
                  rules={[{ required: true, message: 'Please input your region' }]}
                >
                  <Input placeholder="Region" />
                </Form.Item>
              </Stack>


              <Button type='primary' htmlType='submit' loading={loading}>Create Profile</Button>

            </Form>
          </Stack>
        </Container >
      </Layout.Content>
    </Layout>

  )
}

export default AdminProfile