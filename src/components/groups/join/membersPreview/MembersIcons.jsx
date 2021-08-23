import React from "react";
import UserIcon from "../../../user/UserIcon";
import "./MembersIcons.less";

function MembersIcons({ members, iconSize, total, showTotalIcon = true }) {
  return (
    <div className="d-flex align-items-center group-member-container">
      {members.map((member, index) => {
        return (
          <div className="group-member" key={index}>
            <UserIcon email={member.user.email} iconSize={iconSize} />
          </div>
        );
      })}
      {showTotalIcon && total > members.length && (
        <div className="group-member total">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              height: iconSize,
              width: iconSize,
            }}
          >
            <small>+{total - members.length}</small>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembersIcons;
