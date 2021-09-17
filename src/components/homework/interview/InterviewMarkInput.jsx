import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

function InterviewMarkInput({ total, onSubmit, isInitMarking = false }) {
  const [mark, setMark] = useState(total);
  const [isMarking, setIsMarking] = useState(isInitMarking);

  useEffect(() => {
    setMark(total);
  }, [isMarking, total]);

  return (
    <div className="mt-3">
      {isMarking && (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit && onSubmit(mark);
          }}
        >
          <InputGroup className="d-flex justify-content-end">
            <Button variant="link" onClick={() => setIsMarking(false)}>
              Отменить
            </Button>
            <Form.Control
              style={{ maxWidth: 100 }}
              type="number"
              className="w-50"
              value={mark}
              onChange={(e) =>
                e.target.value >= 0 && setMark(Number(e.target.value))
              }
            />
            <InputGroup.Append>
              <Button type="submit">Оценить</Button>
            </InputGroup.Append>
          </InputGroup>
        </Form>
      )}
      {!isMarking && (
        <Button variant="link" onClick={() => setIsMarking(true)}>
          Оценить
        </Button>
      )}
    </div>
  );
}

export default InterviewMarkInput;
