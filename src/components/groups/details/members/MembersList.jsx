import React from "react";
import { Dropdown, DropdownButton, ListGroup } from "react-bootstrap";
import Member from "./Member";

function MemberList({
  members,
  isCreator,
  showRoles = false,
  withOptions = true,
  variant = "flush",
  user,
  onLeave,
  onKick,
  emptyMessage,

  internalState = null,
}) {
  function isCurrent(member) {
    return user && member.user.id === user.id;
  }

  if (members)
    return (
      <ListGroup variant={variant}>
        {members.map((member, index) => {
          return (
            <ListGroup.Item
              key={index}
              className="d-flex justify-content-between align-items-center p-1"
            >
              <Member
                member={member}
                showRole={showRoles}
                isCurrent={isCurrent(member)}
              />
              {withOptions && (
                <DropdownButton
                  className="dropdown-best"
                  variant="transparent"
                  title="⋮"
                  menuAlign="right"
                >
                  <Dropdown.Item>Профиль</Dropdown.Item>
                  {isCurrent(member) ? (
                    <Dropdown.Item className="text-danger" onClick={onLeave}>
                      Выйти
                    </Dropdown.Item>
                  ) : (
                    isCreator && (
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => onKick(member)}
                      >
                        Выгнать
                      </Dropdown.Item>
                    )
                  )}
                </DropdownButton>
              )}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    );
  else
    return (
      <div className="text-center">
        {emptyMessage ?? "Похоже, тут пока никого нет :("}
      </div>
    );
}

export default MemberList;
