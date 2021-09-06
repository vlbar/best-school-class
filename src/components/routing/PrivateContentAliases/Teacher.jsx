import React from "react";
import { TEACHER } from "../../../redux/state/stateActions";
import PrivateContent from "../PrivateContent";

function Teacher({ children }) {
  return <PrivateContent allowedStates={[TEACHER]}>{children}</PrivateContent>;
}

export default Teacher;
