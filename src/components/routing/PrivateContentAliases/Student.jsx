import React from "react";
import { STUDENT } from "../../../redux/state/stateActions";
import PrivateContent from "../PrivateContent";

function Student({ children }) {
  return <PrivateContent allowedStates={[STUDENT]}>{children}</PrivateContent>;
}

export default Student;
