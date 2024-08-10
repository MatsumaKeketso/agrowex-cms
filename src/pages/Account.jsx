import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { Card, Form, Image, Input, Menu, message, Progress, Select, Upload } from "antd";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from "../services/authService";
import { UploadOutlined } from "@mui/icons-material";
import { ProfileService } from "../services/profileService";


const Account = () => {
  const [disbleButton, setDisableButton] = useState(false)
  const [form] = Form.useForm();
  const profile = useSelector((state) => state.user.profile)
  const [uploadImage, setUploadImage] = useState(0)
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = (values) => {
    if (uploadImage >= 1 && uploadImage <= 98) {
      messageApi.info("Please wait for upload to finish.")
    } else {
      ProfileService.updateAccountProfile(values).then(data => {
        console.log(data);
        messageApi.success("Profile Updated")
      })
    }
  };
  const uploadFileToFirebase = async (file) => {
    // setDisableButton(true)
    // Create a storage reference
    const storageRef = ref(storage, `agent_picture/${profile.uid}/${file.name}`);

    // Start the file upload
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress function to track upload progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        setUploadImage(progress.toFixed(0))
      },
      (error) => {
        // Handle unsuccessful uploads
        messageApi.error(`Upload failed: ${error.message}`);
        setDisableButton(false)
      },
      () => {
        // Handle successful uploads
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          form.setFieldValue('img', downloadURL)
          console.log('File available at', downloadURL);
          messageApi.success('Upload successful!');
          setDisableButton(false)
        });
      }
    );
  };
  useEffect(() => {
    console.log(profile);
    Object.keys(profile).map(key => {
      if (key !== 'uid') {
        form.setFieldValue(key, profile[key])
      }
    })
  })
  return (
    <Layout>
      {contextHolder}
      <Stack position={"relative"} flex={1} p={2} gap={2}>
        <Stack
          position={"sticky"}
          direction={"row"}
          spacing={2}
          alignItems={"center"}
        >
          <Typography variant="h5">Account</Typography>
          <Box flex={1}></Box>
        </Stack>
        <Stack direction={'row'} gap={2}>
          <Stack gap={1}>
            <Card cover={<Image src={profile.img} />}>
              <Card.Meta title={profile.fullnames} description={profile.email} />
            </Card>
            <Divider />
            <Menu items={[{ label: 'My Account', key: 'account' }, { label: 'Settings', key: 'settings' }]}></Menu>
          </Stack>
          <Stack sx={{ width: 500 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: 'Please input your email!' }]}
              >
                <Input inputMode="email" />
              </Form.Item>

              <Form.Item
                label="Full Names"
                name="fullnames"
                rules={[{ required: true, message: 'Please input your full name!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Profile Image URL"
                name="img"
                rules={[{ required: true, message: 'Please input the image URL!' }]}
              >
                <Progress percent={uploadImage} />
                <Upload
                  customRequest={({ file, onSuccess }) => {
                    uploadFileToFirebase(file)
                  }}
                  showUploadList={false} // Hide default upload list
                >
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="Province"
                name="province"
                rules={[{ required: true, message: 'Please input your province!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Region"
                name="region"
                rules={[{ required: true, message: 'Please input your region!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: 'Please input your role!' }]}
              >
                <Select options={[{ label: 'Admin', value: 'admin' }, { label: 'Operations Manager', value: 'om' }, { label: 'Procurement Manager', value: 'pm' }]} />
              </Form.Item>
              <Form.Item>
                <Button disabled={disbleButton} type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Stack>
        </Stack>
      </Stack>
    </Layout>
  );
};

export default Account;
