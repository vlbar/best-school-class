import React from "react";
import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import {
  fromStateToIcon,
  fromStateToName,
} from "../../../redux/state/stateActions";
import InviteForm from "./InviteForm";
import "./InviteFormContainer.less";

function InviteFormContainer({ invitesLink, roles }) {
  const [currentRole, setCurrentRole] = useState(roles[0]);

  function onRoleChange(role) {
    setCurrentRole(role);
  }

  return (
    <div className="consistent-height">
      <Tabs fill defaultActiveKey={currentRole} onSelect={onRoleChange}>
        {roles.map((role, index) => (
          <Tab
            eventKey={role}
            key={index}
            title={
              <span>
                <i className={fromStateToIcon(role)}></i>{" "}
                {fromStateToName(role)}
              </span>
            }
            style={{
              visibility: currentRole == role ? "visible" : "hidden",
            }}
          >
            <InviteForm
              invitesLink={invitesLink}
              role={role}
              isCurrent={currentRole == role}
            />
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}

export default InviteFormContainer;
