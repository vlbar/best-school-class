import React, { useRef } from "react";
import { useState } from "react";
import { useContext } from "react";
import { Button, Form } from "react-bootstrap";
import { MessageContext } from "./InterviewMessageList";
import TextareaAutosize from "react-textarea-autosize";
import { useEffect } from "react";
import { createError } from "../../../notifications/notifications";
import UserName from "../../../user/UserName";

function MessageInput({ messagesLink, onSubmit: handleSubmit }) {
  //Context
  const {
    replyMessage,
    setReply,
    editingMessage,
    setEdit,
    commentingAnswer,
    setCommentingAnswer,
  } = useContext(MessageContext);

  const [text, setText] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      setReply(editingMessage.replyOn);
      if (editingMessage.type == "COMMENT")
        setCommentingAnswer({
          question: { formulation: editingMessage.formulation },
          questionAnswer: editingMessage.questionAnswer,
        });
      inputRef.current.focus();
    } else {
      setText("");
      setReply(null);
    }
  }, [editingMessage]);

  useEffect(() => {
    if (replyMessage) inputRef.current.focus();
  }, [replyMessage]);

  useEffect(() => {
    if (commentingAnswer) {
      inputRef.current.focus();
      if (
        editingMessage &&
        editingMessage.questionAnswer != commentingAnswer.questionAnswer
      ) {
        setEdit(null);
        setText("");
        setReply(null);
      }
    } else reset();
  }, [commentingAnswer]);

  function reset() {
    setText("");
    setEdit(null);
    setReply(null);
    setCommentingAnswer(null);
  }

  function onSubmit() {
    if (!editingMessage) createMessage();
    else if (text.trim().length > 0) updateMessage();
    else deleteMessage();
  }

  function createMessage() {
    if (text.trim().length > 0)
      messagesLink
        .post({
          type: commentingAnswer ? "COMMENT" : "MESSAGE",
          content: text,
          replyOnId: replyMessage ? replyMessage.id : null,
          questionAnswerId: commentingAnswer?.questionAnswer?.questionId,
        })
        .then((message) => {
          reset();
          handleSubmit?.(message);
        })
        .catch((err) => createError("Не удалось отправить сообщение.", err));
  }

  function updateMessage() {
    if (
      text != editingMessage.text ||
      replyMessage?.id != editingMessage.replyOn?.id
    ) {
      let editedMessage = {
        type: editingMessage.type,
        content: text,
        replyOnId: replyMessage ? replyMessage.id : null,
      };
      editingMessage
        .link()
        .put(editedMessage)
        .then(() => {
          reset();
          handleSubmit?.({
            ...editingMessage,
            ...editedMessage,
            editedAt: new Date(),
          });
        })
        .catch((err) => createError("Не удалось обновить сообщение.", err));
    }
  }

  function deleteMessage() {
    editingMessage
      .link()
      .remove()
      .then(() => {
        reset();
        handleSubmit?.({
          ...editingMessage,
          deletedAt: new Date(),
        });
      })
      .catch((err) => createError("Не удалось удалить сообщение.", err));
  }

  return (
    <div className="d-flex w-100 align-items-end">
      <div className="d-flex flex-fill overflow-hidden flex-column p-1">
        <div className="mr-5">
          {editingMessage && (
            <div className="mb-2 text-muted d-flex w-100 justify-content-between">
              Редактирование{" "}
              {editingMessage.type == "MESSAGE" ? "сообщения" : "комментария"}
              <div className="tool-panel">
                <i
                  className="fas fa-times tool"
                  style={{ opacity: 0.5 }}
                  onClick={reset}
                ></i>
              </div>
            </div>
          )}
          {replyMessage && (
            <div className="d-flex w-100 ">
              <div
                className="pl-2 text-left text-muted mb-2 w-100"
                style={{ borderLeft: "2px solid #dee2e6" }}
              >
                <div className="position-relative w-100">
                  <div className="text-truncate pr-3 w-100">
                    {replyMessage.content}
                  </div>
                  <div
                    className="position-absolute tool-panel"
                    style={{ right: 0, top: 0 }}
                  >
                    <i
                      className="fas fa-times tool"
                      style={{ opacity: 0.5 }}
                      onClick={() => setReply(null)}
                    ></i>
                  </div>
                </div>
                <div className="d-flex justify-content-end">
                  — <UserName user={replyMessage.author} short /> ©
                </div>
              </div>
            </div>
          )}
          {commentingAnswer && (
            <div className="d-flex w-100 ">
              <div className="text-muted w-100 position-relative">
                {!editingMessage && (
                  <div className="mb-2">Комментарий на вопрос</div>
                )}
                <div
                  className="pl-2 text-left mb-2 w-100"
                  style={{ borderLeft: "2px solid #dee2e6" }}
                >
                  <div className="position-relative w-100">
                    <div className="text-truncate pr-3 w-100">
                      {commentingAnswer.question.formulation.replace(
                        /<[^>]*>?/gm,
                        ""
                      )}
                    </div>
                  </div>
                  {!editingMessage && (
                    <div
                      className="position-absolute tool-panel"
                      style={{ right: 0, top: 0 }}
                    >
                      <i
                        className="fas fa-times tool"
                        style={{ opacity: 0.5 }}
                        onClick={reset}
                      ></i>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="py-0 mr-5">
          <div className="position-relative">
            <Form.Control
              ref={inputRef}
              cacheMeasurements
              maxRows={6}
              value={text}
              as={TextareaAutosize}
              onChange={(e) => {
                setText(e.target.value.slice(0, 4096));
              }}
              onKeyDown={(e) => {
                if (e.keyCode === 13 && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              style={{ resize: "none" }}
              placeholder={
                commentingAnswer
                  ? "Введите комментарий..."
                  : "Введите сообщение..."
              }
            />
            <div
              className="position-absolute mr-n5 pl-3"
              style={{ bottom: 0, right: 0, height: 38, width: 56 }}
            >
              <div className="tool-panel h-100 d-flex justify-content-center align-items-center">
                <Button
                  type="submit"
                  variant="transparent"
                  className="border-0 p-0 tool text-muted"
                  style={{ boxShadow: "none", opacity: 0.5 }}
                  onClick={onSubmit}
                  disabled={!editingMessage && text.length == 0}
                >
                  {!editingMessage && commentingAnswer && (
                    <i className="fas fa-comment-dots fa-2x"></i>
                  )}
                  {!editingMessage && !commentingAnswer && (
                    <svg
                      height="30"
                      viewBox="0 0 48 48"
                      width="30"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="gray"
                    >
                      <path d="M4.02 42l41.98-18-41.98-18-.02 14 30 4-30 4z" />
                      <path d="M0 0h48v48h-48z" fill="none" />
                    </svg>
                  )}
                  {editingMessage &&
                    (text.trim().length > 0 ? (
                      <i className="far  fa-check-circle fa-2x"></i>
                    ) : (
                      <i className="fas fa-eraser" style={{ fontSize: 25 }}></i>
                    ))}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageInput;
