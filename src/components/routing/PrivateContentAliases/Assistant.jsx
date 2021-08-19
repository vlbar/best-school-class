import React from "react";
import { ASSISTANT } from "../../../redux/state/stateActions";
import PrivateContent from "../PrivateContent";

function Assistant({ children }) {
  return (
    <PrivateContent allowedStates={[ASSISTANT]}>{children}</PrivateContent>
  );
}

export default Assistant;
