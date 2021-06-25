import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import ProcessBar from "../../process-bar/ProcessBar";
import InviteForm from "../InviteForm"

export const GroupJoinDetails = ({ data, onClose, onJoin }) => {
  const [loading, setLoading] = useState(false)

  function onLoading(state) {
    setLoading(state);
  }

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Присоединение к группе</Modal.Title>
      </Modal.Header>
      {loading && <ProcessBar height="2px"/>}
      <Modal.Body>
       {data && data.isClosed && <div>Закрыта</div>}
       {data && !data.isClosed && <div>Открыта
         <Button onClick={() => onJoin(data.joinCode)}>
           Присоединиться
         </Button>
         
         </div>}
      </Modal.Body>

      <Modal.Footer className="float-left">
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
      </Modal.Footer>
    </>
  );
};
