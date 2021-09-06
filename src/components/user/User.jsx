import React from "react";
import UserName from "./UserName";
import UserIcon from "./UserIcon";

function User({
  user,
  iconSize = 26,
  short = false,
  showCurrent = false,
  iconPlacement = "left",
  ...props
}) {
  return (
    <div
      className={`d-flex align-items-center w-100 ${
        iconPlacement === "right" ? "flex-row-reverse" : ""
      }`}
    >
      <div {...props}>
        <UserIcon email={user.email} iconSize={iconSize} />
      </div>
      <UserName user={user} short={short} withCurrent={showCurrent} />
    </div>
  );
}

export default User;
