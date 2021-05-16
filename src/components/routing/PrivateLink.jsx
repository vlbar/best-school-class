import React from "react"
import { Nav } from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectAuth } from "../../redux/auth/authSelectors";

function PrivateLink({ children, ...rest }) {
  const { isLoggedIn } = useSelector(selectAuth);

  if (!isLoggedIn) return null;

  return <Nav.Link {...rest}>{children}</Nav.Link>;
};

export default PrivateLink;