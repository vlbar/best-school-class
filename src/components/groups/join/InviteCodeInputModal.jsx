import React, { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { Button, Modal, Form, InputGroup, FormControl } from "react-bootstrap";
import { useHistory } from "react-router-dom";

export const InviteCodeInputModal = ({ onClose }) => {
  const history = useHistory();
  const inputRef = useRef();
  const [code, setCode] = useState("");

  function submitHandle(e) {
    e.preventDefault();
    onClose();
    history.push(`/invites/${code}`);
  }

  useEffect(() => {
    inputRef.current.focus();
  });

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Присоединиться</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={submitHandle}>
          <p>Введите код приглашения, выданный преподавателем</p>
          <InputGroup>
            <input
              ref={inputRef}
              name="joinCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={"Введите код..."}
            />
            <InputGroup.Append>
              <Button
                variant="primary"
                type="submit"
                disabled={!code}
                className="w-100 px-5"
              >
                <i className="fas fa-long-arrow-alt-right"></i>
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
