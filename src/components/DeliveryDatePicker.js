import React, { useState, useEffect } from 'react';
import { DatePicker, Select, Form, Button, Card, Space, Tag, List, Typography, InputNumber, Empty, Input } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Stack } from '@mui/material';

const { Option } = Select;
const { Title, Text } = Typography;

// Define frequency options and their corresponding days
const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'daily', days: 1 },
  { label: 'Weekly', value: 'weekly', days: 7 },
  { label: 'Bi-Weekly', value: 'biweekly', days: 14 },
  { label: 'Monthly', value: 'monthly', days: 30 },
  { label: 'Quarterly', value: 'quarterly', days: 90 },
];

const DeliveryDatePicker = ({ onScheduleChange, updatedList = [] }) => {
  const [form] = Form.useForm();
  const [frequency, setFrequency] = useState('weekly');
  const [selectedDates, setSelectedDates] = useState([]);
  const [disabledDates, setDisabledDates] = useState([]);
  const [stop, setStop] = useState(false)
  const offtake = useSelector((state) => state?.offtake?.active);
  // Get days to add based on frequency
  const getDaysToAdd = (freq) => {
    const selectedFreq = FREQUENCY_OPTIONS.find(option => option.value === freq);
    return selectedFreq ? selectedFreq.days : 7; // Default to weekly
  };

  // Handle frequency change
  const handleFrequencyChange = (value) => {
    setFrequency(value);
    // Reset selections when frequency changes
    setSelectedDates([]);
    setDisabledDates([]);
    form.setFieldsValue({ deliveryDate: null });
  };

  // Disable dates function for DatePicker
  const disabledDate = (current) => {
    // Can't select days before today
    if (current && current < dayjs().startOf('day')) {
      return true;
    }

    // Check if date is in disabled range
    return disabledDates.some(dateRange => {
      return current >= dateRange.start && current <= dateRange.end;
    });
  };

  // Handle date selection
  const handleDateChange = (date) => {
    if (!date) return;

    const daysToAdd = getDaysToAdd(frequency);
    const startDate = dayjs(date);
    const endDate = startDate.add(daysToAdd - 1, 'day');

    // Add to selected dates
    const newSelectedDate = {
      startDate: startDate,
      endDate: endDate,
    };

    const updatedSelectedDates = [...selectedDates, newSelectedDate];
    setSelectedDates(updatedSelectedDates);

    // Update disabled date ranges
    const newDisabledRange = {
      start: startDate,
      end: endDate,
    };

    setDisabledDates([...disabledDates, newDisabledRange]);

    // Notify parent component about the change
    if (onScheduleChange) {
      onScheduleChange(updatedSelectedDates);
    }

    // Reset the date field
    form.setFieldsValue({ deliveryDate: null });
  };

  // Handle form submission
  const handleSubmit = (values) => {
    console.log('Form submitted with values:', values);
    // Additional form submission logic if needed
  };

  const handleRemoveDate = (index) => {
    const updatedSelectedDates = [...selectedDates];
    const updatedDisabledDates = [...disabledDates];

    updatedSelectedDates.splice(index, 1);
    updatedDisabledDates.splice(index, 1);

    setSelectedDates(updatedSelectedDates);
    setDisabledDates(updatedDisabledDates);

    // Notify parent component about the change
    if (onScheduleChange) {
      onScheduleChange(updatedSelectedDates);
    }
  };
  useEffect(() => {
    if (offtake) {
      setFrequency("")
    }
  }, [])
  useEffect(() => {
    setSelectedDates([])
    setDisabledDates([])
    if (stop) {
      updatedList.forEach((item) => {
        const newSelectedDate = {
          startDate: item.startDate,
          endDate: item.endDate,
        };
        const updatedSelectedDates = [...selectedDates, newSelectedDate];
        setSelectedDates(updatedSelectedDates);
        const newDisabledRange = {
          start: item.startDate,
          end: item.endDate,
        };
        setDisabledDates([...disabledDates, newDisabledRange]);
      })
    }
    setStop(true)
  }, [updatedList])
  return (
    <Form
      style={{ width: '100%' }}
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Space className="w-full" direction="vertical" size="large">
        <Form.Item
          name="frequency"
          // label="Delivery Frequency"
          initialValue={frequency}
          style={{ width: '100%' }}
        >
          <Select
            size='large'
            variant='borderless'
            disabled
            style={{ width: '100%' }}
          >
            {FREQUENCY_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label} ({option.days} day{option.days > 1 ? 's' : ''})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="deliveryDate"
          label="Select Delivery Date"
          style={{ width: '100%' }}
          tooltip="Dates will be blocked based on the selected frequency"
        >
          <DatePicker
            onChange={handleDateChange}
            disabledDate={disabledDate}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Space>
    </Form>
  );
};

export default DeliveryDatePicker;