import React from "react";
import { Badge, Col, Row } from "react-bootstrap";
import UserIcon from "../../../user/UserIcon";
import UserName from "../../../user/UserName";

function Member({ member, iconSize = 30, showRole = false, isCurrent }) {
  const user = member.user;

  function getRole(role) {
    const roles = {
      TEACHER: "Преподаватель",
      STUDENT: "Ученик",
      ASSISTANT: "Помощник",
    };
    return roles[role];
  }

  return (
    <div className="d-flex align-items-center p-2 w-100">
      <div className="ml-2 mr-3">
        <UserIcon email={user.email} iconSize={iconSize} />
      </div>
      <Row className="w-100">
        <Col>
          <UserName user={user} withCurrent={isCurrent} />
        </Col>
        {showRole && (
          <Col xl={4}>
            <Badge variant="light">{getRole(member.role)}</Badge>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default Member;
