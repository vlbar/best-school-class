import moment, { duration } from "moment";
import React, { useContext } from "react";
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
import { toLocaleTimeDurationString } from "../../../common/LocaleTimeString";
import PrivateContent from "../../../routing/PrivateContent";
import { getTaskTypeColor } from "../../../tasks/TaskTypeDropdown";
import User from "../../../user/User";
import HumanReadableDate from "./HumanReadableDate";
import QuestionContainer from "./QuestionContainer";

function AnswerDetails({
  fetchLink,
  updatedAnswer,
  onStatusChanged,
  disabled,
}) {
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
    if (updatedAnswer) {
      setAnswer(updatedAnswer);

      setIsEdit(updatedAnswer.answerStatus == "PERFORMED");
    }
  }, [updatedAnswer]);

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
                <h4 className="d-inline mr-2 text-break">{task.name}</h4>
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
              <i
                className="text-muted text-break"
                dangerouslySetInnerHTML={{ __html: task.description }}
              ></i>
              <hr />
            </div>
            <Row>
              <Col lg={"auto"} md={"auto"}>
                <div>
                  <span>
                    <i>Начато:</i>{" "}
                    <HumanReadableDate date={answer.submittedAt} withTime />
                  </span>
                  {answer.answerStatus != "NOT_PERFORMED" && (
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
                          duration={moment(answer.completionDate).subtract(
                            answer.totalDuration,
                            "millisecond"
                          )}
                        >
                          {answer.completionDate}
                        </Moment>
                      </div>
                    </>
                  )}
                  {answer.completionDate >= new Date().getTime() && (
                    <div>
                      <i>Осталось:</i>{" "}
                      {toLocaleTimeDurationString(
                        answer.completionDate - new Date().getTime()
                      )}
                    </div>
                  )}
                </div>
              </Col>
              {answer.evaluatorId &&
                answer.answerStatus != "NOT_PERFORMED" &&
                answer.answerStatus != "PERFORMED" && (
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
                      {answer.answerStatus == "APPRECIATED" && <b>Принял:</b>}
                      {answer.answerStatus == "NOT_APPRECIATED" && (
                        <b>Отклонил:</b>
                      )}
                      {(answer.answerStatus == "RETURNED" ||
                        answer.answerStatus == "NOT_PERFORMED" ||
                        answer.answerStatus == "PERFORMED") && (
                        <b>Вернул:</b>
                      )}{" "}
                      <HumanReadableDate date={answer.editedAt} withTime />
                    </div>
                    {answer.answerStatus == "APPRECIATED" && (
                      <div>
                        <i>Оценка:</i>{" "}
                        <b>
                          {answer.score} из {task.maxScore}
                        </b>
                      </div>
                    )}
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
                        variant="primary"
                        title={
                          answer.answerStatus == "APPRECIATED"
                            ? "Обновить"
                            : "Принять"
                        }
                        onClick={() => updateAnswer("APPRECIATED")}
                        disabled={!saved}
                      >
                        {(!task.duration ||
                          task.duration - 5 >
                            answer.totalDuration / 1000 / 60) && (
                          <Dropdown.Item
                            onClick={() => updateAnswer("RETURNED")}
                          >
                            Вернуть
                          </Dropdown.Item>
                        )}
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
            {!isEdit && !disabled && (
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
                    variant="primary"
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
