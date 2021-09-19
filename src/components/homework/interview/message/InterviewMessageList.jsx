import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import { Button } from "react-bootstrap";
import { useInView } from "react-intersection-observer";
import MessageGroupContainer from "./MessageGroupContainer";

import "./Message.less";
import { createContext } from "react";
import MessageInput from "./MessageInput";
import ProcessBar from "../../../process-bar/ProcessBar";
import HumanReadableDate from "./HumanReadableDate";
import axios from "axios";

const BLOCK_TIME_RANGE_IN_MILLIS = 1000 * 60 * 5;

export const MessageContext = createContext({
  replyMessage: null,
  setReply: () => {},
  editingMessage: null,
  setEdit: () => {},
  disabled: false,
  setDisabled: () => {},
  commentingAnswer: null,
  setCommentingAnswer: () => {},
});

//RERENDER RETARD ALERT
function InterviewMessageList({
  fetchLink,
  closed = false,
  currentUser,
  onAnswer,
}) {
  //Context
  const [replyMessage, setReply] = useState(null);
  const [editingMessage, setEdit] = useState(null);
  const [commentingAnswer, setCommentingAnswer] = useState(null);
  const [disabled, setDisabled] = useState(closed);

  const page = useRef(null);
  const messagesRef = useRef({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const hasNextRef = useRef(true);
  const timeout = useRef(null);
  const { ref, inView } = useInView({ threshold: 0 });
  const [date, setDate] = useState(null);
  const fetchLinkHref = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  useEffect(() => {
    if (page.current == null && fetchLink.href != fetchLinkHref.current) {
      fetchLinkHref.current = fetchLink.href;
      clearTimeout(timeout.current);
      fetchMessages(fetchLink.fill("size", 30));
    }
  }, [fetchLink]);

  useEffect(() => {
    if (inView && !loading) fetchPrev();
  }, [inView]);

  function reloadChanges(link) {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      fetchChanges(link);
    }, 2000);
  }

  function fetchMessages(link) {
    link
      .fetch(setLoading)
      .then((newPage) => {
        let newMessages = newPage.list("messages");
        if (newMessages) {
          newMessages = newMessages.reduce((map, message) => {
            map[message.submittedAt] = message;
            return map;
          }, {});
          if (page.current == null) {
            messagesRef.current = newMessages;
          } else {
            messagesRef.current = { ...messagesRef.current, ...newMessages };
          }
          setMessages(Object.values(messagesRef.current));
        }
        page.current = newPage;
        if (hasNextRef.current) hasNextRef.current = !!newPage.link("next");

        setHasNext(hasNextRef.current);

        if (!closed) reloadChanges(newPage.link("changedAfter"));
      })
      .catch((err) => setHasNext(false));
  }

  function fetchChanges(link) {
    link.fetch().then((changes) => {
      let changedMessages = changes.list("messages");

      if (changedMessages) {
        updateMessages(changedMessages);
        reloadChanges(changes.link("changedAfter"));
      } else reloadChanges(link);
    });
  }

  function updateMessages(changedMessages) {
    let keys = Object.keys(messagesRef.current);
    let lastKey = keys.pop();
    let firstKey = keys.shift();
    let addedMessages = {};

    changedMessages = changedMessages.reduce((map, message) => {
      if (!firstKey || Number(firstKey) < message.submittedAt)
        addedMessages[message.submittedAt] = message;
      else if (Number(lastKey) <= message.submittedAt)
        map[message.submittedAt] = message;
      if (message.type == "ANSWER") onAnswer && onAnswer(message);
      return map;
    }, {});

    messagesRef.current = {
      ...addedMessages,
      ...messagesRef.current,
      ...changedMessages,
    };
    setMessages(Object.values(messagesRef.current));
  }

  function fetchPrev() {
    fetchMessages(page.current.link("next"));
  }

  function handleMessage(message) {
    if (page.current == null) fetchMessages(fetchLink);
    else {
      updateMessages([message]);
    }
  }

  return (
    <div className="h-100 w-100">
      <div className="sticky-top">
        <ProcessBar height={2} active={loading} className="position-absolute" />
      </div>

      <MessageContext.Provider
        value={{
          replyMessage,
          setReply,
          editingMessage,
          setEdit,
          disabled,
          setDisabled,
          commentingAnswer,
          setCommentingAnswer,
        }}
      >
        <div className="d-flex flex-column justify-content-end w-100 h-100">
          {date && (
            <div className="w-100 border-bottom text-center">
              <div className="text-muted p-1">
                <HumanReadableDate date={date} />
              </div>
            </div>
          )}
          <div className="d-flex flex-fill bg-white flex-column-reverse overflow-auto position-relative justify-content-start">
            {messages.length > 0 && (
              <MessageGroupContainer
                messages={messages}
                currentUser={currentUser}
                blockTimeRange={BLOCK_TIME_RANGE_IN_MILLIS}
                onDateChange={setDate}
              />
            )}
            {messages.length == 0 && (
              <div className="text-muted text-center my-auto">
                <div>Похоже, тут пока никто не писал</div>
                <div>Начните первым!</div>
              </div>
            )}
            <div>
              {!loading && hasNext && (
                <Button
                  ref={ref}
                  onClick={fetchPrev}
                  variant="link"
                  className="mx-auto w-100"
                >
                  Загрузить ещё...
                </Button>
              )}
            </div>
          </div>
          <div className="p-1" style={{ borderTop: "1px solid #dee2e6" }}>
            {!closed && (
              <MessageInput messagesLink={fetchLink} onSubmit={handleMessage} />
            )}
            {closed && (
              <div className="text-center my-auto p-2 text-muted">
                Интервью закрыто. Писать сообщения более невозможно.
              </div>
            )}
          </div>
        </div>
      </MessageContext.Provider>
    </div>
  );
}

export default InterviewMessageList;
