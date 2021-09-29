import React, { useEffect, useState } from "react";
import UserName from "./UserName";
import UserIcon from "./UserIcon";
import { createError } from "../notifications/notifications";

function User({
  user,
  fetchLink,
  iconSize = 26,
  short = false,
  showCurrent = false,
  iconPlacement = "left",
  errorMsg,
  onLoading,
  children,
  nameClasses,
  containerClasses,
  ...props
}) {
  const [finalUser, setFinalUser] = useState(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fetchLink && !finalUser && !loading)
      fetchLink
        .fetch(setLoading)
        .then(setFinalUser)
        .catch((err) =>
          createError(errorMsg ?? "Не удалось загрузить пользователя.", err)
        );
  }, [fetchLink]);

  if (finalUser)
    return (
      <div
        className={`d-flex align-items-center w-100 ${
          iconPlacement === "right" ? "flex-row-reverse" : ""
        }`}
      >
        <div {...props}>
          <UserIcon email={finalUser.email} iconSize={iconSize} />
        </div>
        <div
          className={
            containerClasses ??
            `d-flex align-items-center flex-wrap justify-content-${
              iconPlacement == "right" ? "end" : "start"
            }`
          }
        >
          <div className={nameClasses}>
            <UserName
              user={finalUser}
              short={short}
              withCurrent={showCurrent}
            />
          </div>
          {children}
        </div>
      </div>
    );
  else return null;
}

export default User;
