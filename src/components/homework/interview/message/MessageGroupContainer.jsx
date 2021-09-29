import React from "react";
import { useRef } from "react";
import { useMemo } from "react";
import HumanReadableDate from "./HumanReadableDate";
import MessageGroup from "./MessageGroup";

export function isDatesEquals(date1, date2) {
  return (
    date1.getYear() === date2.getYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDay() === date2.getDay()
  );
}

function MessageGroupContainer({
  messages,
  currentUser,
  blockTimeRange,
  onDateChange,
  onNeedBottomScroll,
}) {
  const currentDate = useRef(new Date().getTime());

  const messageGroups = useMemo(() => {
    let prevMessage = null;
    let groupedMessages = [];
    let idx = -1;
    messages.forEach((message) => {
      if (
        prevMessage == null ||
        message.author.id != prevMessage.author.id ||
        prevMessage.submittedAt - message.submittedAt > blockTimeRange ||
        !isDatesEquals(
          new Date(prevMessage.submittedAt),
          new Date(message.submittedAt)
        ) ||
        prevMessage.type != message.type
      ) {
        groupedMessages.push({
          author: message.author,
          time: message.submittedAt,
          messages: [],
          type: message.type,
        });
        idx++;
      }
      groupedMessages[idx].messages.push(message);
      prevMessage = message;
    });

    return groupedMessages;
  }, [messages, currentUser, blockTimeRange]);

  function onViewChange(messageGroup, inView, idx) {
    if (inView && messageGroup.time < currentDate.current) {
      onDateChange && onDateChange(new Date(messageGroup.time));
      currentDate.current = messageGroup.time;
    }
    if (!inView && messageGroup.time == currentDate.current && idx > 0) {
      onDateChange && onDateChange(new Date(messageGroups[idx - 1].time));
      currentDate.current = messageGroups[idx - 1].time;
    }
    if (idx == 0) onNeedBottomScroll?.(!inView);
  }

  return (
    <>
      {messageGroups.map((messageGroup, index) => {
        let isAuthor = messageGroup.author.id == currentUser.id;
        let groupPosition = isAuthor ? "right" : "left";
        let messageDate = new Date(messageGroup.time);
        let isOtherDate =
          index + 1 < messageGroups.length &&
          !isDatesEquals(messageDate, new Date(messageGroups[index + 1].time));
        return (
          <div className="position-relative" key={messageGroup.messages[0].id}>
            {isOtherDate && (
              <div className="text-muted text-center my-2">
                <HumanReadableDate date={messageDate} />
              </div>
            )}
            <MessageGroup
              messageGroup={messageGroup}
              position={groupPosition}
              isAuthor={isAuthor}
              onInView={(inView) => onViewChange(messageGroup, inView, index)}
            />
          </div>
        );
      })}
    </>
  );
}

export default MessageGroupContainer;
