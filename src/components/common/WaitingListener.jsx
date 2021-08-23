import { useState } from "react";
import { useRef } from "react";

function WaitingListener({
  value: initValue = "",
  delay,
  onChange: handleChange,
  children,
}) {
  const [value, setValue] = useState(initValue);
  const timeoutRef = useRef();

  function onChange(newValue) {
    setValue(newValue);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => handleChange(newValue), delay);
  }

  return children({ value, onChange });
}

export default WaitingListener;
