import React from "react";
import "./process-bar.less";

function ProcessBar({height = '100%', active = true, style, className}) {

return (
  <div 
    className={'process-bar' + (className !== undefined ? ' ' + className : '')} 
      style={{...style, height: height}}>
      {active && <div className="fill"></div>}
    </div>
  );
}

export default ProcessBar;
