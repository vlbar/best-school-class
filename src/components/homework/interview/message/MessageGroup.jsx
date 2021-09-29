import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Badge, Toast } from "react-bootstrap";
import { useInView } from "react-intersection-observer";
import Moment from "react-moment";
import User from "../../../user/User";
import Answer from "./Answer";
import Comment from "./Comment";

import Message from "./Message";
import "./MessageGroup.less";

function MessageGroup({ messageGroup, position, isAuthor, onInView }) {
  const { ref, inView } = useInView({ threshold: [0, 1] });
  const [expanded, setExpanded] = useState();

  useEffect(() => {
    onInView(inView);
  }, [inView]);

  return (
    <div
      className={`p-2 message-group-wrapper ${
        expanded && "expanded"
      } ${position}`}
    >
      <Toast ref={ref} className="message-group">
        <Toast.Header
          closeButton={false}
          className="d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <User user={messageGroup.author} className="mr-2" short nameClasses="mr-3">
              {messageGroup.type == "ANSWER" && (
                <Badge variant="primary" className="mr-3">
                  Ответ на задание
                </Badge>
              )}
              {messageGroup.type == "COMMENT" && (
                <Badge variant="primary" className="mr-3">
                  Рецензия
                </Badge>
              )}
            </User>
          </div>

          <small>
            <Moment format="HH:mm">{messageGroup.time}</Moment>
          </small>
        </Toast.Header>
        <Toast.Body className="d-flex flex-column-reverse w-100 pt-1">
          {messageGroup.messages.map((message) => {
            if (message.type == "MESSAGE")
              return (
                <Message
                  key={message.id}
                  message={message}
                  isAuthor={isAuthor}
                />
              );
            else if (message.type == "ANSWER")
              return (
                <Answer
                  key={message.id}
                  message={message}
                  onExpand={setExpanded}
                />
              );
            else if (message.type == "COMMENT")
              return (
                <Comment
                  key={message.id}
                  message={message}
                  isAuthor={isAuthor}
                  onInView={onInView}
                />
              );
          })}
        </Toast.Body>
      </Toast>
    </div>
  );
}

export default MessageGroup;
