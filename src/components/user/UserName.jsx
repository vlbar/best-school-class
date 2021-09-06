import React from "react";

function UserName({ user, short = false, withCurrent = false }) {
  return (
    <>
      {user.secondName}{" "}
      {short ? (
        <>
          {user.firstName[0]}.{user.middleName ? user.middleName[0] + "." : ""}
        </>
      ) : (
        <>
          {user.firstName} {user.middleName ?? ""}
        </>
      )}
      {withCurrent && <> (Вы)</>}
    </>
  );
}

export default UserName;
