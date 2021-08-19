import React from "react";
import UserIcon from "../../user/UserIcon";
import UserName from "../../user/UserName";

function GroupCreator({ creator, isCurrent }) {
  return (
    <div className="d-flex align-items-center">
      <div className="text-right">
        <div>
          <UserName user={creator} withCurrent={isCurrent} />
        </div>
        <small>
          <i>Создатель</i>
        </small>
      </div>
      <div className="ml-2">
        <UserIcon email={creator.email} iconSize={36} />
      </div>
    </div>
  );
}

export default GroupCreator;
