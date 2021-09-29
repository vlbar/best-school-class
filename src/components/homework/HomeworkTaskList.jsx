import React, { useState, useEffect, useRef } from "react";
import { Badge, Button, Modal, ModalBody } from "react-bootstrap";
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
import ProcessBar from "../process-bar/ProcessBar";
import { MessageContext } from "./interview/message/InterviewMessageList";


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
  const [loading, setLoading] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const state = useSelector(selectState);
  const fetchLinkHref = useRef(null);

  useEffect(() => {
    if (interview && !interview.inactive && interview.link()) {
      if (interview.link("interviewMessages").href != fetchLinkHref.current) {
        setAnswers([]);
        fetchLinkHref.current = interview.link("interviewMessages").href;
        interview
          .link("interviewMessages")
          ?.fill("type", "ANSWER")
          .fill("size", 100) //FIXME: nu tut vse ponyatno :\
          .fetch(setLoading)
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
      else answers.unshift(updatedAnswer);
    }
  }, [updatedAnswer]);

  function markInterview({ mark: result, closed }) {
    interview
      .link("changeMark")
      .put({ result, closed })
      .then(() => {
        onInterviewChange({
          ...interview,
          result,
          closed,
          inactive: false,
        });
        setEdit(false);
      })
      .catch((err) => createError("Не удалось поставить оценку.", err));
  }

  let total = 0;
  let maxScore = 0;
  return (
    <>
      <div className="d-flex flex-column justify-content-between interview-container position-relative">
        <ProcessBar
          active={loading}
          height={2}
          className="position-absolute w-100"
        />
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
                    disabled={interview?.closed}
                  />
                );
              })}
            </div>
            {interview && (
              <>
                {interview.result != null && interview.closed && !isEdit && (
                  <div
                    className="position-absolute h-100 w-100"
                    style={{
                      backgroundColor: "rgba(248 249 250 / 50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <div className="d-flex h-100 w-100 justify-content-center align-items-center">
                      <div
                        className="text-center"
                        style={{ pointerEvents: "all" }}
                      >
                        <h4>Оценено</h4>
                        <h3 className="mt-2">{interview.result}</h3>
                        <PrivateContent allowedStates={[TEACHER, ASSISTANT]}>
                          <Button variant="link" onClick={() => setEdit(true)}>
                            Переоценить
                          </Button>
                        </PrivateContent>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className="mt-auto text-secondary d-flex justify-content-between align-items-center flex-wrap"
                  style={{ padding: "0.75rem" }}
                >
                  <div className="mt-3" style={{ padding: "0.75rem" }}>
                    Итого: {total}/{maxScore} (
                    {((total * 100) / maxScore).toFixed(2)}
                    %)
                  </div>

                  <div
                    className="d-flex mt-3 justify-content-between align-items-center"
                    style={{ padding: "0.75rem" }}
                  >
                    {isEdit && (
                      <PrivateContent allowedStates={[TEACHER, ASSISTANT]}>
                        <Button
                          variant="link"
                          className="px-0 mr-2"
                          onClick={() => setEdit(false)}
                        >
                          Отменить
                        </Button>

                        <div>
                          <InterviewMarkInput
                            interview={interview}
                            total={interview.result ?? total}
                            onSubmit={markInterview}
                            onEdit={setEdit}
                            isInitMarking={answers.length == tasks.length}
                          />
                        </div>
                      </PrivateContent>
                    )}
                    {!isEdit && (
                      <>
                        {!interview.closed && (
                          <PrivateContent allowedStates={[TEACHER, ASSISTANT]}>
                            <Button
                              variant="link"
                              className="px-0 mr-2"
                              onClick={() => setEdit(true)}
                            >
                              {interview.result != null
                                ? "Переоценить"
                                : "Оценить"}
                            </Button>
                          </PrivateContent>
                        )}
                        {interview.result && (
                          <div>
                            <i>Оценка: </i> <b>{interview.result}</b>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};


const TaskTableItem = ({
  task,
  homeworkId,
  answer,
  onTaskClick,
  inInterview = true,
  disabled,
}) => {

  const [show, setIsShow] = useState(false);
  const history = useHistory();

  return (
    <>
      {answer && (
        <MessageContext.Provider value={{ disabled: true }}>
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
                  updatedAnswer={answer}
                  disabled={disabled}
                />
              </div>
            </ModalBody>
          </Modal>
        </MessageContext.Provider>
      )}
      <div
        className={
          "task-table-item d-flex position-relative" +
          (inInterview && (answer ? " bg-light" : ""))
        }
        onClick={() => answer && (answer.answerStatus !== "NOT_PERFORMED" && answer.answerStatus !== "RETURNED" && answer.answerStatus !== "NOT_ACCEPTED") && setIsShow(true)}
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
                      !disabled &&
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
                {answer.score ?? answer.notConfirmedScore}/{task.maxScore}
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
