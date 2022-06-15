import React from "react";
import { useContext } from "react";
import { Button } from "react-bootstrap";
import UserName from "../../../user/UserName";
import { MessageContext } from "./InterviewMessageList";
import "./Message.less";

function Message({ message, isAuthor }) {
  const {
    replyMessage,
    setReply,
    editingMessage,
    setEdit,
    commentingAnswer,
    disabled,
  } = useContext(MessageContext);

  if (message.deletedAt == null)
    return (
      <div
        className={`message my-1 w-100 ${
          replyMessage?.id == message.id && "bg-light rounded-lg px-2"
        }`}
      >
        {message.replyOn && (
          <div className="text-muted border-left pl-2 text-left">
            <div>{message.replyOn.content}</div>
            <div className="d-flex justify-content-end">
              — <UserName user={message.replyOn.author} short /> ©
            </div>
          </div>
        )}
        <div className="d-flex justify-content-between position-relative">
          <div className="text-break mr-5" style={{ whiteSpace: "pre-line" }}>
            <div>{message.content}</div>
          </div>
          {!disabled && (
            <div className="position-absolute right-panel h-100">
              <div className="tool-panel h-100 d-flex align-items-start mt-1 justify-content-end">
                {isAuthor && editingMessage?.id != message.id && (
                  <Button
                    variant="transparent"
                    className="p-0 mr-1 d-flex align-items-baseline tool"
                    onClick={() => setEdit(message)}
                  >
                    <i className="fas fa-pen fa-sm"></i>
                  </Button>
                )}
                {!commentingAnswer && editingMessage?.id != message.id && (
                  <Button
                    variant="transparent"
                    className="p-0 d-flex align-items-baseline tool"
                    onClick={() => setReply(message)}
                  >
                    <i className="fas fa-reply fa-sm"></i>
                  </Button>
                )}
                {message.editedAt && (
                  <div className="text-muted position-absolute label my-auto">
                    <small>ред.</small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  else return <div className="text-muted">Сообщение удалено.</div>;
}

export default Message;
