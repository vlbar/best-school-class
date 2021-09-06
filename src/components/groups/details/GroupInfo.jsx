import React from "react";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { GroupAddModal } from "../create/GroupAddModal";
import ModalTrigger from "../../common/ModalTrigger";

function GroupInfo({ initGroup, isCreator, showYear = true }) {
  const [group, setGroup] = useState(initGroup);

  function onUpdateSubmit(values) {
    setGroup({ ...group, ...values });
  }

  return (
    <>
      <div>
        <div className="d-flex flex-row align-items-center">
          <div>
            <div
              className="mr-2 rounded-circle"
              style={{
                height: 18,
                width: 18,
                backgroundColor: group.color ?? "#343a40",
              }}
            ></div>
          </div>
          <h4 className="m-0 text-break">{group.name}</h4>
          {isCreator && (
            <ModalTrigger
              modal={
                <GroupAddModal
                  values={group}
                  link={group.link()}
                  onSubmit={onUpdateSubmit}
                />
              }
            >
              <Button
                variant="transparent"
                className="ml-2 py-0 text-secondary"
              >
                <i className="fas fa-pen"></i>
              </Button>
            </ModalTrigger>
          )}
        </div>

        {showYear && (
          <small>
            <i>{new Date(group.createdAt).getFullYear()}</i>
          </small>
        )}
      </div>
    </>
  );
}

export default GroupInfo;
