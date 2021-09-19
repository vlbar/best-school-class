import React, { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import WaitingListener from "../../../common/WaitingListener";
import { createError } from "../../../notifications/notifications";
import TextQuestionAnswer from "./TextQuestionAnswer";
import "./Message.less";
import { useContext } from "react";
import { MessageContext } from "./InterviewMessageList";
import TestQuestionAnswer from "./TestQuestionAnswer";

function Question({
  link,
  question,
  questionAnswer,
  onScoreChange,
  onSaving,
  readOnly = false,
}) {
  const { commentingAnswer, setCommentingAnswer, disabled } =
    useContext(MessageContext);

  const scoreRef = useRef(questionAnswer?.score);
  const [status, setStatus] = useState("saved");

  useEffect(() => {
    onSaving && onSaving(status == "saved");
  }, [status]);

  function onMarkChange(score) {
    if (score != scoreRef.current)
      link
        .put({
          type: questionAnswer.type,
          questionId: questionAnswer.questionId,
          score,
        })
        .then(() => {
          setStatus("saved");
          onScoreChange &&
            onScoreChange(scoreRef.current, score, questionAnswer.id);
          scoreRef.current = score;
        })
        .catch((err) => {
          createError("Не удалось сохранить балл за вопрос.", err);
          setStatus("error");
        });
    else setStatus("saved");
  }

  return (
    <div className="p-3 px-4 rounded-lg bg-light message">
      <div
        className={`mb-2 d-flex w-100 justify-content-between  ${
          !questionAnswer && "text-muted"
        }`}
      >
        <b>{question.formulation}</b>
        {!disabled &&
          questionAnswer &&
          question.id != commentingAnswer?.question.id && (
            <div className="tool-panel">
              <Button
                variant="transparent"
                className="p-0 d-flex align-items-baseline tool"
                onClick={() =>
                  setCommentingAnswer({ question, questionAnswer })
                }
              >
                <i className="fas fa-reply fa-sm"></i>
              </Button>
            </div>
          )}
      </div>
      {questionAnswer && (
        <>
          <span className="mb-1">Ответ ученика:</span>
          {questionAnswer.type == "TEXT_QUESTION" && (
            <TextQuestionAnswer question={{ question, questionAnswer }} />
          )}
          {questionAnswer.type == "TEST_QUESTION" && (
            <TestQuestionAnswer question={{ question, questionAnswer }} />
          )}
          <div className="w-100 d-flex justify-content-end mt-3">
            {!readOnly && (
              <div className="d-flex align-items-center position-relative">
                <span>Балл:</span>
                <WaitingListener
                  delay={2000}
                  onChange={onMarkChange}
                  value={questionAnswer.score}
                >
                  {({ value, onChange }) => {
                    return (
                      <>
                        {status == "error" && (
                          <Button
                            variant="link"
                            className="p-0 text-danger w-100 text-center position-absolute mt-n4"
                            size="sm"
                            onClick={() => onMarkChange(value)}
                            style={{ top: 0 }}
                          >
                            Повторить попытку
                          </Button>
                        )}
                        <Form.Control
                          className={`mx-2 text-center ${
                            status == "saved" && "border-success"
                          } ${status == "error" && "border-danger"}`}
                          type="number"
                          min={0}
                          value={value}
                          onChange={(e) => {
                            if (
                              e.target.value >= 0 &&
                              e.target.value <= question.questionMaxScore
                            ) {
                              onChange(Number(e.target.value));
                              setStatus("notSaved");
                            }
                          }}
                          max={question.questionMaxScore}
                          style={{ width: 70, height: 35 }}
                        />
                      </>
                    );
                  }}
                </WaitingListener>
                <span> из {question.questionMaxScore}</span>
              </div>
            )}
            {readOnly && (
              <span>
                Балл: {questionAnswer.score} из {question.questionMaxScore}
              </span>
            )}
          </div>
        </>
      )}
      {!questionAnswer && (
        <div className="text-muted">
          <div>Ответ отсутствует.</div>
          <div className="w-100 d-flex justify-content-end align-items-center mt-2">
            <span>Балл: 0 из {question.questionMaxScore}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Question;
