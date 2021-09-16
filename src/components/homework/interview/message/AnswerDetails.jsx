import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
  Badge,
  Button,
  Col,
  Dropdown,
  Row,
  SplitButton,
} from "react-bootstrap";
import Moment from "react-moment";
import { useSelector } from "react-redux";
import { ASSISTANT, TEACHER } from "../../../../redux/state/stateActions";
import { selectUser } from "../../../../redux/user/userSelectors";
import getContrastColor from "../../../../util/ContrastColor";
import PrivateContent from "../../../routing/PrivateContent";
import { getTaskTypeColor } from "../../../tasks/TaskTypeDropdown";
import User from "../../../user/User";
import HumanReadableDate from "./HumanReadableDate";
import QuestionContainer from "./QuestionContainer";

function AnswerDetails({ fetchLink, answerStatus, onStatusChanged }) {
  const user = useSelector(selectUser);

  const [answer, setAnswer] = useState(null);
  const [task, setTask] = useState(null);
  const [score, setScore] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(true);
  const scrollRef = useRef();
  const scoreRef = useRef(0);

  useEffect(() => {
    if (fetchLink && answer == null && !loading)
      fetchLink.fetch(setLoading).then(setAnswer);
  }, [fetchLink]);

  useEffect(() => {
    if (answer) {
      setAnswer({ ...answer, answerStatus });
    }

    setIsEdit(answerStatus == "PERFORMED");
  }, [answerStatus]);

  useEffect(() => {
    setExpanded(isEdit);
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) scrollToTop();
  }, [isExpanded]);

  useEffect(() => {
    if (answer) {
      setScore(answer.notConfirmedScore);
      scoreRef.current = answer.notConfirmedScore;
      if (!task) answer.link("task").fetch(setLoading).then(setTask);
    }
  }, [answer]);

  function updateAnswer(answerStatus) {
    answer
      .link()
      .put({ type: answer.type, score, answerStatus }, setLoading)
      .then(() => {
        setAnswer({
          ...answer,
          score: answerStatus == "APPRECIATED" ? score : answer.score,
          answerStatus,
          evaluatorId: user.id,
          editedAt: new Date(),
        });
        setIsEdit(answerStatus == "PERFORMED");
        onStatusChanged && onStatusChanged(answerStatus);
      });
  }

  function scrollToTop() {
    if (scrollRef.current) {
      setTimeout(
        () =>
          scrollRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        200
      );
    }
  }

  function handleScoreChange(oldScore, newScore, maxScore) {
    let weight = task.maxScore / maxScore;
    scoreRef.current += (newScore - oldScore) * weight;
    setScore(scoreRef.current);
  }

  return (
    <div className="p-3">
      {answer && task && (
        <div>
          <div>
            <div ref={scrollRef}>
              <div className="d-flex flex-wrap align-items-center">
                <h4 className="d-inline mr-2">{task.name}</h4>
                {task.taskType && (
                  <Badge
                  className="p-1"
                    style={{
                      backgroundColor: getTaskTypeColor(task.taskType.id),
                      color: getContrastColor(
                        getTaskTypeColor(task.taskType.id)
                      ),
                    }}
                  >
                    {task.taskType.name}
                  </Badge>
                )}
              </div>
              <i className="text-muted">{task.description}</i>
              <hr />
            </div>
            <Row>
              <Col lg={"auto"} md={"auto"}>
                <div className="mt-2">
                  <span>
                    <i>Начато:</i>{" "}
                    <HumanReadableDate date={answer.submittedAt} withTime />
                  </span>
                  {answer.completionDate && (
                    <>
                      <div>
                        <i>Выполнено:</i>{" "}
                        <HumanReadableDate
                          date={answer.completionDate}
                          withTime
                        />
                      </div>
                      <div>
                        <i>Время выполнения:</i>{" "}
                        <Moment
                          locale="ru"
                          format="Y [г.] M [мес.] w [нед.] d [д.] h [ч.] m [мин.] ss [сек]"
                          trim
                          duration={new Date(answer.submittedAt)}
                        >
                          {new Date(answer.completionDate)}
                        </Moment>
                        .
                      </div>
                    </>
                  )}
                  {answer.completionDate >= new Date().getTime() && (
                    <div>
                      Осталось:{" "}
                      <Moment
                        locale="ru"
                        format="HH:mm:ss"
                        interval={1000}
                        durationFromNow={answer.completionDate}
                      >
                        {answer.completionDate}
                      </Moment>
                    </div>
                  )}
                </div>
              </Col>
              {answer.evaluatorId && (
                <Col className="text-right">
                  <div className="d-flex justify-content-end">
                    <div>
                      <User
                        fetchLink={answer.link("evaluator")}
                        className="ml-2"
                        iconPlacement="right"
                        iconSize={30}
                      />
                    </div>
                  </div>
                  <div>
                    <i>Принял:</i>{" "}
                    <HumanReadableDate date={answer.editedAt} withTime />
                  </div>

                  <div>
                    <i>Оценка:</i>{" "}
                    <b>
                      {answer.score} из {task.maxScore}
                    </b>
                  </div>
                </Col>
              )}
            </Row>
          </div>
          <PrivateContent allowedStates={[TEACHER, ASSISTANT]}>
            {answer.answerStatus != "NOT_PERFORMED" && (
              <div>
                <QuestionContainer
                  isExpanded={isExpanded}
                  fetchLink={answer.link("answerQuestions")}
                  onScoreChange={handleScoreChange}
                  readOnly={!isEdit}
                  onLoaded={scrollToTop}
                  onSaved={setSaved}
                />

                {!isEdit && (
                  <Button
                    variant="link"
                    className="w-100 mt-2"
                    onClick={() => setExpanded(!isExpanded)}
                  >
                    {isExpanded ? "Свернуть" : "Подробнее"}
                  </Button>
                )}
              </div>
            )}
            <hr />
            {isEdit && (
              <>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-center">
                    <div>Итоговый балл: </div>
                    <div>
                      {score} из {task.maxScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-right">
                      <Button variant="link" onClick={() => setIsEdit(false)}>
                        Отменить
                      </Button>
                      <SplitButton
                        variant="outline-primary"
                        title={
                          answer.answerStatus == "APPRECIATED"
                            ? "Обновить"
                            : "Принять"
                        }
                        onClick={() => updateAnswer("APPRECIATED")}
                        disabled={!saved}
                      >
                        <Dropdown.Item onClick={() => updateAnswer("RETURNED")}>
                          Вернуть
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => updateAnswer("NOT_APPRECIATED")}
                        >
                          Отклонить
                        </Dropdown.Item>
                      </SplitButton>
                    </div>
                  </div>
                </div>
              </>
            )}
            {!isEdit && (
              <div className="d-flex justify-content-end">
                {answer.answerStatus == "NOT_PERFORMED" ? (
                  <Button
                    className="text-right"
                    variant="outline-danger"
                    onClick={() => updateAnswer("PERFORMED")}
                  >
                    Завершить досрочно
                  </Button>
                ) : (
                  <Button
                    className="text-right"
                    variant="outline-primary"
                    onClick={() => setIsEdit(true)}
                  >
                    Переоценить
                  </Button>
                )}
              </div>
            )}
          </PrivateContent>
        </div>
      )}
    </div>
  );
}

export default AnswerDetails;
