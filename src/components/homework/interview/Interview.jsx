import React, { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/user/userSelectors";
import ProcessBar from "../../process-bar/ProcessBar";
import InterviewMessageList from "./message/InterviewMessageList";

//RERENDER RETARD ALERT
function Interview({ fetchLink, userId, onInterviewChange, closed, onAnswer }) {
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

  return (
    <div className="position-relative">
      <div className={"bg-light interview-container"}>
        <div className="sticky-top">
          <ProcessBar
            height={2}
            active={loading}
            className="position-absolute"
          />
        </div>
        {!loading && interview !== undefined && (
          <>
            <InterviewMessageList
              fetchLink={
                interview?.link("interviewMessages") ??
                fetchLink.withPathTale("messages")
              }
              closed={closed}
              currentUser={user}
              onAnswer={onAnswer}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Interview;
