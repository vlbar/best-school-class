import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Form,
  InputGroup,
  SplitButton,
} from "react-bootstrap";

function InterviewMarkInput({ total, onSubmit }) {
  const [mark, setMark] = useState(total);
  const [closed, setClosed] = useState(true);

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit && onSubmit({ mark, closed });
        }}
      >
        <div className="d-flex justify-content-end">
          <Form.Control
            style={{ maxWidth: 100 }}
            type="number"
            className="w-50 mr-2"
            value={mark}
            onChange={(e) =>
              e.target.value >= 0 && setMark(Number(e.target.value))
            }
          />

          <SplitButton role="button" title="Оценить" type="submit">
            <Dropdown.Item onClick={() => setClosed(!closed)}>
              {closed && <i className="fas fa-check"></i>} Закрыть интервью
            </Dropdown.Item>
          </SplitButton>
        </div>
      </Form>
    </div>
  );
}

export default InterviewMarkInput;
