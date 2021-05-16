import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Route, Redirect, useHistory } from "react-router-dom";
import { selectAuth } from "../../redux/auth/authSelectors";

export default function UnauthenticatedRoute({ children, ...rest }) {
  const { isLoggedIn } = useSelector(selectAuth);
  const history = useHistory()

  const destinationPath = history.location.state?.from.pathname;

  return (
    <Route {...rest}>
      {!isLoggedIn ? (
        children
      ) : (
        <Redirect to={destinationPath || "/"} />
      )}
    </Route>
  );
}
