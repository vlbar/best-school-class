import React from "react";
import MembersIcons from "./membersPreview/MembersIcons";
import MembersNames from "./membersPreview/MembersNames";

function GroupMembersPreview({ previewedMembers, total, iconSize = 26 }) {
  return (
    <div className="d-flex flex-column align-items-center">
      <MembersIcons
        members={previewedMembers}
        total={total}
        iconSize={iconSize}
      />
      <MembersNames members={previewedMembers} total={total} />
    </div>
  );
}

export default GroupMembersPreview;
