import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Accordion, Card } from "react-bootstrap";
import AnswerDetails from "./AnswerDetails";
import AnswerStatus from "./AnswerStatus";

function Answer({ message, onExpand }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    onExpand && onExpand(expanded);
  }, [expanded]);

  return (
    <Accordion activeKey={expanded ? "0" : null}>
      <Card>
        <Card.Header className="px-2 py-2">
          <Accordion.Toggle
            as={"div"}
            className="d-flex justify-content-between w-100"
            variant="link"
            eventKey="0"
            onClick={() => setExpanded(!expanded)}
          >
            <AnswerStatus answer={message} withTime />
          </Accordion.Toggle>
        </Card.Header>

        <Accordion.Collapse eventKey="0">
          <Card.Body className="p-0">
            {expanded && (
              <AnswerDetails
                fetchLink={message.link()}
                answerStatus={message.answerStatus}
              />
            )}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
}

export default Answer;
