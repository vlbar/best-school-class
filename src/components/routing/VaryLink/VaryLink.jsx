import React from "react";
import { Nav } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import ActiveContent from "./ActiveContent";
import UnactiveContent from "./UnactiveContent";

function VaryLink({ children, activeContent, to, ...props }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Nav.Link to={to} {...props}>
      {children.filter((content) => {
        return content.type !== (active ? UnactiveContent : ActiveContent);
      })}
    </Nav.Link>
  );
}

export default VaryLink;
