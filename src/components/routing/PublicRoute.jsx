import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Route, Redirect, useHistory } from "react-router-dom";
import { selectAuth } from "../../redux/auth/authSelectors";

export default function PublicRoute({ component: Component, ...rest }) {
  const { isLoggedIn } = useSelector(selectAuth);
  const history = useHistory();

  const destinationPath = history.location.state?.from.pathname;

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoggedIn) {
          return <Redirect to={destinationPath || "/home"} />;
        } else {
          return <Component {...props} />;
        }
      }}
    />
  );
}
