import React from "react";
import "./process-bar.less";

function ProcessBar(props) {
  return (
    <div className="process-bar" {...props}>
      <div className="fill"></div>
    </div>
  );
}

export default ProcessBar;
