import React, { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/user/userSelectors";
import { createError } from "../../notifications/notifications";
import ProcessBar from "../../process-bar/ProcessBar";
import InterviewMessageList from "./message/InterviewMessageList";

//RERENDER RETARD ALERT
function Interview({
  fetchLink,
  userId,
  onInterviewChange,
  createLink,
  onAnswer,
}) {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [interview, setInterview] = useState(undefined);
  const interviewHref = useRef(null);

  useEffect(() => {
    if (interview) onInterviewChange(interview);
  }, [interview]);

  useEffect(() => {
    if (fetchLink && interviewHref.current != fetchLink.href) {
      interviewHref.current = fetchLink.href;
      setInterview(undefined);
      fetchLink
        .fetch(setLoading)
        .then((interview) => {
          setInterview(interview);
        })
        .catch((err) => {
          if (err.response && err.response.status == 404) setInterview(null);
        });
    }
  }, [fetchLink]);

  function createInterview() {
    createLink
      .post({ interviewerId: userId ?? user.id }, setLoading)
      .then((interview) => setInterview(interview))
      .catch((err) => createError("Не удалось создать интервью.", err));
  }

  return (
    <div className="position-relative">
      <div
        className={`border ${
          userId != user.id ? "" : "border-top-0"
        } bg-light interview-container`}
      >
        <div className="sticky-top">
          <ProcessBar
            height={2}
            active={loading}
            className="position-absolute"
          />
        </div>
        {!loading && (
          <>
            {interview === null && (
              <div className="d-flex flex-column bg-white justify-content-between align-items-center w-100 h-100">
                <div></div>
                <span className="text-muted">Интервью ещё не начато</span>
                <Button
                  variant="outline-primary"
                  className="w-100"
                  onClick={createInterview}
                >
                  Начать
                </Button>
              </div>
            )}
            {interview && (
              <InterviewMessageList
                fetchLink={interview.link("interviewMessages")}
                closed={interview.closed}
                currentUser={user}
                onAnswer={onAnswer}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Interview;
