import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";


function InviteForm({ code, onGenerate, loading }) {
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    setCopyMessage("");
  }, [code]);

  const onCodeSelect = (e) => {
    e.target.select();
    navigator.clipboard.writeText(code);
    setCopyMessage("Код для присоединения был скопирован в буфер обмена");
  };

  const onUrlSelect = (e) => {
    navigator.clipboard.writeText(`${location.hostname}/invites/${code}`);
    setCopyMessage("Ссылка для присоединения была скопирована в буфер обмена");
  };


  return (
    <Form.Group controlId="formBasicEmail" style={{ marginBottom: 0 }}>
      <Form.Label>Код для присоединения </Form.Label>
      <InputGroup>
        <Form.Control
          readOnly
          value={code}
          onClick={onCodeSelect}
          style={{ userSelect: "all", cursor: "pointer" }}
        />
        <InputGroup.Append>
          <Button onClick={onGenerate} disabled={loading}>
            <i className="fas fa-redo"></i>
          </Button>
        </InputGroup.Append>
      </InputGroup>

      <Form.Text muted>
        <i
          onClick={onUrlSelect}
          style={{ userSelect: "all", cursor: "pointer" }}
        >
          {location.hostname}/invites/{code}
        </i>
      </Form.Text>
      {copyMessage && (
        <Form.Text muted>
          <span className="text-success">{copyMessage}</span>
        </Form.Text>
      )}
    </Form.Group>
  );
}

export default InviteForm;
