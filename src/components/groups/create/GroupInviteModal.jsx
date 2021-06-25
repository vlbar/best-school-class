import axios from "axios";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import ProcessBar from "../../process-bar/ProcessBar";
import InviteForm from "../InviteForm"

export const GroupInviteModal = ({ code, groupId, onClose }) => {
  const [loading, setLoading] = useState(false)

  function onLoading(state) {
    setLoading(state);
  }

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Приглашение</Modal.Title>
      </Modal.Header>
      {loading && <ProcessBar height="2px"/>}
      <Modal.Body>
       <InviteForm onLoading={onLoading} code={code} groupId={groupId}/>
      </Modal.Body>

      <Modal.Footer className="float-left">
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
      </Modal.Footer>
    </>
  );
};
