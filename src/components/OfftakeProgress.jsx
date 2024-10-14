import React, { useEffect, useState } from 'react';
import { Steps } from 'antd';
import { green, blue } from '@mui/material/colors';
import { colors, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { SystemService } from '../services/systemService';
import { useSelector } from 'react-redux';

// const { Step } = Steps;
const stepData = [
  { title: 'inprogress', status: 'wait' },
  { title: 'negotiation', status: 'wait' },
  { title: 'planning', status: 'success' },
  { title: 'submitted', status: 'wait' },
  { title: 'published', status: 'wait' },
  { title: 'finalstage', status: 'wait' },
  { title: 'active', status: 'wait' },
];
const OfftakeProgress = ({ status }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [updatedAt, setUpdatedAt] = useState('...')
  const offtake = useSelector(state => state.offtake.active)
  const isStepFailed = (step) => {
    return step === null;
  };
  useEffect(() => {
    console.log(offtake);
    if (offtake?.status) {
      if (offtake.status?.length) {
        const currentStatus = status[status?.length - 1].status_name
        const updatedAt = SystemService.formatTimestamp(status[status?.length - 1].updated_at)
        const currentStepIndex = stepData.findIndex(step => step.title === currentStatus);
        setCurrentStep(currentStepIndex)
        setUpdatedAt(updatedAt)
      }
    }


  })
  return (
    <Stepper activeStep={currentStep}>
      {stepData.map((step, index) => {
        const labelProps = {};
        if (isStepFailed(index)) {
          labelProps.optional = (
            <Typography variant="caption" color="error">
              Alert message
            </Typography>
          );
          labelProps.error = true;
        }

        return (
          <Step key={index}          >
            <StepLabel {...labelProps}>{SystemService.converStringToSentenceCase(step.title)}</StepLabel>
          </Step>
        )
      })}
    </Stepper>
  );
};
export default OfftakeProgress