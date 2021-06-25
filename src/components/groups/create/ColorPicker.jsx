import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Form} from "react-bootstrap";
import "./ColorPicker.less"

function ColorPicker({onColorChange, initialColor, ...props}) {
    const [color, setColor] = useState(initialColor)

    useEffect(() => {
        setColor(initialColor)
    }, [initialColor])

    function handleChange(e) {
        setColor(e.target.value)
        onColorChange({hex : e.target.value })
    }

  return (
    <div className="color-picker-outer">
      <div className="color-picker-wrapper">
        <Form.Control
          type="color"
          onChange={handleChange}
          className="color-picker"
          value={color}
        />
      </div>
    </div>
  );
}

export default ColorPicker;
