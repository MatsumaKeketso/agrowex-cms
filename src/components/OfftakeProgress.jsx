import React, { useState } from 'react';
import { Steps } from 'antd';
import { green, blue } from '@mui/material/colors';
import { colors, Step, StepLabel, Stepper, Typography } from '@mui/material';

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
const OfftakeProgress = ({ currentStage }) => {
  const [currentStep, setCurrentStep] = useState(3)
  const getCurrentStepIndex = (currentStep) => {
    return stepData.findIndex(step => step.title === currentStep);
  };
  const isStepFailed = (step) => {
    return step === null;
  };

  return (
    <Stepper activeStep={getCurrentStepIndex(currentStage)}>
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
            <StepLabel {...labelProps}>{step.title}</StepLabel>
          </Step>
        )
      })}
    </Stepper>
  );
};
export default OfftakeProgress