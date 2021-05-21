import React from "react";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import { selectAuth } from "../../redux/auth/authSelectors";
import { selectState } from "../../redux/state/stateSelector";

export default function PrivateRoute(props, { children, ...rest }) {
  const { isLoggedIn } = useSelector(selectAuth);
  const { state } = useSelector(selectState)

  const allowedStates = props.allowedStates;
  console.log(props.allowedStates, state)

  return (
    <Route {...rest}>
      {isLoggedIn? (
        (!allowedStates || allowedStates.includes(state))?
        children : <Redirect to={{pathname: "/home", state: { from: props.location } }}/>
      ) : (
        <Redirect to={{pathname: "/login", state: { from: props.location } }}/>
      )}
    </Route>
  );
}
