import React from "react";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import Moment from "react-moment";
import HumanReadableDate from "./HumanReadableDate";

function AnswerStatus({ answer, padding = 2, withTime, variant = "badge" }) {
  const statuses = {
    NOT_PERFORMED: {
      color: "primary",
      name: (
        <div className="saving">
          Выполняется
          <span>.</span>
          <span>.</span>
          <span>.</span> ({answer.answeredQuestionCount}/
          {answer.questionCount ?? ""})
        </div>
      ),
      icon: (
        <div className="saving">
          <span style={{ verticalAlign: "super" }}>
            <b>.</b>
          </span>
          <span style={{ verticalAlign: "super" }}>
            <b>.</b>
          </span>
          <span style={{ verticalAlign: "super" }}>
            <b>.</b>
          </span>
        </div>
      ),
      time: answer.submittedAt,
    },
    PERFORMED: {
      color: "primary",
      name: "Выполнено",
      icon: <i className="fas fa-check"></i>,
      time: answer.completionDate,
    },
    APPRECIATED: {
      color: "success",
      name: "Принято",
      icon: <i className="fas fa-check-circle"></i>,
      time: answer.editedAt,
    },
    RETURNED: {
      color: "warning",
      name: "Возвращено",
      icon: <i className="fas fa-exclamation-triangle"></i>,
      time: answer.editedAt,
    },
    NOT_APPRECIATED: {
      color: "danger",
      name: "Не принято",
      icon: <i className="fas fa-times"></i>,
      time: answer.editedAt,
    },
  };

  const status = statuses[answer.answerStatus];

  return (
    <div className="d-flex w-100 justify-content-between align-items-center">
      {variant == "badge" ? (
        <Badge variant={status.color} className={`p-${padding}`}>
          {status.name}
        </Badge>
      ) : (
        <OverlayTrigger overlay={<Tooltip>{status.name}</Tooltip>}>
          <div className={"text-" + status.color}>{status.icon}</div>
        </OverlayTrigger>
      )}

      {withTime &&
        (answer.answerStatus != "NOT_PERFORMED" ? (
          <div>
            <HumanReadableDate date={status.time} withTime />
          </div>
        ) : (
          <div className="d-flex align-items-center flex-wrap justify-content-center">
            <i className="far fa-clock mr-1"></i>
            <Moment
              durationFromNow
              interval={1000}
              format="HH:mm:ss"
              trim
              date={status.time}
              locale="ru"
            />
          </div>
        ))}
    </div>
  );
}

export default AnswerStatus;
