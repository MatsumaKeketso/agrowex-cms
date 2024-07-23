import { Tag } from 'antd';
import React from 'react'
const colors = {
  inprogress: '#EAA300',
  negotiation: '#061724',
  planning: '#62ABF5',
  active: 'success',
  published: '#54B054',
  notViable: '#3F1011',
  submitted: '#EAA300'
}
const StatusTag = (props) => {
  const { status } = props;
  return <Tag color={colors[status]} >{status.toUpperCase()}</Tag>
}

export default StatusTag