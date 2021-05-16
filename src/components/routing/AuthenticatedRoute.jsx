import React from "react";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import { selectAuth } from "../../redux/auth/authSelectors";

export default function AuthenticatedRoute(props, { children, ...rest }) {
  const { isLoggedIn } = useSelector(selectAuth);
  return (
    <Route {...rest}>
      {isLoggedIn ? (
        children
      ) : (
        <Redirect to={{pathname: "/login", state: { from: props.location } }}/>
      )}
    </Route>
  );
}
