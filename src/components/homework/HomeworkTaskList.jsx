import React, { useState, useEffect, useRef } from "react";
import { Badge, Modal, ModalBody } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";

import { getTaskTypeColor } from "../tasks/TaskTypeDropdown";
import "./HomeworkTaskList.less";
import Student from "../routing/PrivateContentAliases/Student";
import AnswerStatus from "./interview/message/AnswerStatus";
import AnswerDetails from "./interview/message/AnswerDetails";
import PrivateContent from "../routing/PrivateContent";
import { ASSISTANT, STUDENT, TEACHER } from "../../redux/state/stateActions";
import { useSelector } from "react-redux";
import { selectState } from "../../redux/state/stateSelector";
import InterviewMarkInput from "./interview/InterviewMarkInput";
import { createError } from "../notifications/notifications";
import Resource from "../../util/Hateoas/Resource";

const MAX_DISPLAY_TASKS = 10;

//RERENDER RETARD ALERT
const HomeworkTaskList = ({
  tasks,
  interview,
  homeworkId,
  updatedAnswer,
  onInterviewChange,
  onTaskClick
}) => {
  const [answers, setAnswers] = useState([]);
  const state = useSelector(selectState);
  const fetchLinkHref = useRef(null);

  useEffect(() => {
    if (interview && interview.link()) {
      if (interview.link("interviewMessages").href != fetchLinkHref.current) {
        fetchLinkHref.current = interview.link("interviewMessages").href;
        interview
          .link("interviewMessages")
          ?.fill("type", "ANSWER")
          .fetch()
          .then((page) => setAnswers(page.list("messages") ?? []));
      }
    } else setAnswers([]);
  }, [interview]);

  useEffect(() => {
    if (updatedAnswer) {
      let founded = answers?.find((answer) => answer.id == updatedAnswer.id);
      if (founded)
        setAnswers(
          answers.map((answer) => {
            if (answer.id == updatedAnswer.id) return updatedAnswer;
            else return answer;
          })
        );
      else answers.push(updatedAnswer);
    }
  }, [updatedAnswer]);

  function markInterview(mark) {
    interview
      .link("changeMark")
      .put({ mark })
      .then(() =>
        onInterviewChange({
          ...interview,
          result: mark,
        })
      )
      .catch((err) => createError("Не удалось поставить оценку.", err));
  }

  let total = 0;
  let maxScore = 0;
  return (
    <>
      <div
        className={`border ${
          interview && state.state != STUDENT ? "border-top-0" : ""
        } d-flex flex-column justify-content-between interview-container`}
      >
        {tasks && (
          <>
            <div className="overflow-auto">
              {tasks.slice(0, MAX_DISPLAY_TASKS).map((task) => {
                maxScore += task.maxScore;
                let answer = answers?.find(
                  (answer) => answer.taskId == task.id
                );
                if (answer) total += answer.score ?? answer.notConfirmedScore;
                return (
                  <TaskTableItem
                    key={task.id}
                    task={task}
                    homeworkId={homeworkId}
                    answer={answers?.find((answer) => answer.taskId == task.id)}
                    inInterview={!!interview}
                    onTaskClick={onTaskClick}
                  />
                );
              })}
            </div>
            {interview && (
              <div
                className="flex-fill text-secondary d-flex flex-column justify-content-between align-items-end"
                style={{ padding: "0.75rem" }}
              >
                <div>
                  Итого: {total}/{maxScore} (
                  {((total * 100) / maxScore).toFixed(2)}
                  %)
                </div>

                <PrivateContent allowedStates={[TEACHER, ASSISTANT]}>
                  <InterviewMarkInput
                    interview={interview}
                    total={total}
                    onSubmit={markInterview}
                    isInitMarking={answers.length == tasks.length}
                  />
                </PrivateContent>

                {interview.result && (
                  <div>
                    <i>Оценка:</i> <b>{interview.result}</b>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

const TaskTableItem = ({ task, homeworkId, answer, inInterview = true, onTaskClick }) => {
  const history = useHistory();
  const [show, setIsShow] = useState(false);

  return (
    <>
      {answer && (
        <Modal
          show={show}
          size="lg"
          onHide={() => setIsShow(false)}
          className="font-size-14"
        >
          <ModalBody className="py-0">
            <div className="position-relative">
              <Modal.Header
                closeButton
                className="p-3 position-absolute border-0"
                style={{ right: -20 }}
              />
              <AnswerDetails
                fetchLink={answer.link()}
                answerStatus={answer.answerStatus}
              />
            </div>
          </ModalBody>
        </Modal>
      )}
      <div
        className={
          "task-table-item d-flex position-relative" +
          (inInterview && (answer ? " bg-light" : ""))
        }
        onClick={() => answer && setIsShow(true)}
      >
        <div className="d-flex w-100 align-items-center justify-content-between">
          <div className="overflow-hidden">
            <div className="d-flex flex-wrap align-items-center">
              <div className="d-flex overflow-hidden align-items-center">
                {answer && (
                  <div className="mr-2">
                    <AnswerStatus answer={answer} variant="icon" />
                  </div>
                )}
                <div className="text-semi-bold text-truncate task-name mr-2">
                  <span className="mr-2  text-dark" title={task.name}>
                    <Student>
                      {inInterview &&
                      (!answer ||
                        answer.answerStatus == "NOT_PERFORMED" ||
                        answer.answerStatus == "RETURNED") ? (
                        <span
                          className="stretched-link text-dark"
                          onClick={() => onTaskClick(Resource.of(task).link())}
                        >
                          {task.name}
                        </span>
                      ) : (
                        task.name
                      )}
                    </Student>
                    <PrivateContent allowedStates={[TEACHER, ASSISTANT]}>
                      {task.name}
                    </PrivateContent>
                  </span>
                </div>
              </div>
              {task.taskType != null && (
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: getTaskTypeColor(task.taskType.id),
                  }}
                >
                  {task.taskType.name}
                </Badge>
              )}
            </div>

            <div>
              <span
                className="text-description text-ellipsis"
                title={task.description?.replace(/<[^>]*>?/gm, "")}
              >
                {task.description?.replace(/<[^>]*>?/gm, "")}
              </span>
            </div>
          </div>
          <div className="d-flex ml-3 text-center flex-wrap align-items-center text-center">
            {answer && (
              <span>
                {answer.score ?? answer.notConfirmedScore}/{answer.taskMaxScore}
              </span>
            )}
            {!answer && (
              <div className="text-secondary flex-fill">{task.maxScore}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeworkTaskList;
