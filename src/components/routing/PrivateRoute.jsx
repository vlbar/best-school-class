import React from "react";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import { selectAuth } from "../../redux/auth/authSelectors";
import { selectState } from "../../redux/state/stateSelector";

export default function PrivateRoute({ component: Component, location, allowedStates, ...rest }) {
  const { isLoggedIn } = useSelector(selectAuth);
  const { state } = useSelector(selectState);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoggedIn) {
          if (!allowedStates || allowedStates.includes(state))
            return <Component {...props} />;
          else
            return (
              <Redirect
                to={{ pathname: "/home", state: { from: location } }}
              />
            );
        } else {
          return (
            <Redirect
              to={{ pathname: "/login", state: { from: location } }}
            />
          );
        }
      }}
    />
  );
}
