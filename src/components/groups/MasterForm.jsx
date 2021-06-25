import React from "react";
import { useState } from "react";

export default function MasterForm({
  onEnd,
  steps,
  initialValues = [],
  ...props
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);

  function onNext(values) {
    if (step + 1 < steps.length) {
      setValues(values);
      setStep(step + 1);
    }
  }

  function handleEnd(values) {
    onEnd(values);
  }

  const Step = steps[step];

  return (
    <Step
      onNext={onNext}
      onEnd={handleEnd}
      {...values}
      {...props}
    />
  );
}
