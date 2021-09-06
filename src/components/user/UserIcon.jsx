import md5 from "md5";
import React from "react";

function UserIcon({ email, iconSize }) {
  return (
    <img
      className="rounded-circle"
      src={`http://cdn.libravatar.org/avatar/${md5(email)}?s=100&&d=${
        email ? "identicon" : "mm"
      }&&r=g`}
      style={{ height: `${iconSize}px` }}
    />
  );
}

export default UserIcon;
