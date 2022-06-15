import React, { useEffect, useRef, useState } from "react";
import { Badge, Row, Col, Tabs, Tab } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import axios from "axios";

import { addErrorNotification } from "../notifications/notifications";
import { LoadingItem } from "../loading/LoadingList";
import ProcessBar from "../process-bar/ProcessBar";
import HomeworkTaskList from "./HomeworkTaskList";
import "./HomeworkDetails.less";
import Link from "../../util/Hateoas/Link";
import PrivateContent from "../routing/PrivateContent";
import { ASSISTANT, STUDENT, TEACHER } from "../../redux/state/stateActions";
import Student from "../routing/PrivateContentAliases/Student";
import Interview from "./interview/Interview";
import HumanReadableDate from "./interview/message/HumanReadableDate";
import InterviewContainter from "./interview/InterviewContainer";
import User from "../user/User";
import { useSelector } from "react-redux";
import { selectState } from "../../redux/state/stateSelector";
import Resource from "../../util/Hateoas/Resource";
import ExecuteTaskModal from "../tasks/execute/ExecuteTaskModal";
import usePageTitle from "../feedback/usePageTitle";

// requests
const baseUrl = "/homeworks";

async function fetchDetails(homeworkId) {
  return axios.get(`${baseUrl}/${homeworkId}`);
}

const HomeworkDetails = ({ homeworkId }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [homework, setHomework] = useState(undefined);
  const [interview, setInterview] = useState(undefined);
  const [answer, setAnswer] = useState(null);
  const mounted = useRef(false);
  const state = useSelector(selectState);

  const [isExecuteTaskModalShow, setIsExecuteTaskModalShow] = useState(false);
  const [taskLink, setTaskLink] = useState(undefined);
  usePageTitle({ title: "Домашнее задание" });

  const history = useHistory();

  useEffect(() => {
    fetchHomeworkDetails();
  }, []);

  useEffect(() => {
    if (mounted.current) history.replace("/homeworks");
    else mounted.current = true;
  }, [state]);

  useEffect(() => {
    if (homework && state.state == STUDENT)
      setInterview(Resource.based(homework.link("myInterview")));
  }, [homework]);

  const fetchHomeworkDetails = () => {
    setIsFetching(true);

    fetchDetails(homeworkId)
      .then((res) => setHomework(res.data))
      .catch((error) =>
        addErrorNotification(
          "Не удалось загрузить список домащних работ. \n" + error
        )
      )
      .finally(() => setIsFetching(false));
  };

  function executeTask(link) {
    setTaskLink(link);
    setIsExecuteTaskModalShow(true);
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between mt-3">
        <div className="d-flex flex-row">
          <h4 className="mr-2 mb-1 mb-2">Домашняя работа</h4>
          <div>
            <Badge variant="secondary" className="y-auto">
              Завершено
            </Badge>
          </div>
        </div>
        <div className="d-flex">
          {homework ? (
            <>
              <div>
                <div
                  className="select-group-circle mt-1"
                  style={{ backgroundColor: homework.group.color ?? "#343a40" }}
                />
              </div>
              <b
                className="text-link"
                onClick={() => history.push(`/groups/${homework.group.id}`)}
              >
                {homework.group.name}
              </b>
            </>
          ) : (
            <LoadingItem width="100px" />
          )}
        </div>
      </div>

      <ProcessBar active={isFetching} height=".18Rem" className="mt-1 mb-2" />

      {homework ? (
        <Row>
          <Col md={6}>
            <div
              className={"homework-card mb-2" + (isFetching ? "loading" : "")}
            >
              <div className="just-homework-line" />
              <div>
                <span>
                  <span className="text-secondary">Срок сдачи:</span>{" "}
                  <b>
                    <HumanReadableDate
                      date={new Date(homework.endingDate)}
                      withTime
                    />
                  </b>
                </span>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="homework-card">
              <div className="just-homework-line" />
              <div className="d-flex justify-content-start">
                <span className="text-secondary">Назначил:</span>
                <User
                  fetchLink={homework.link("creator")}
                  containerClasses="d-flex flex-column align-items-end"
                  iconSize="0"
                  className="ml-2"
                ></User>
              </div>
            </div>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col md={6}>
            <div className="loading-homework-card mb-2">
              <div className="just-homework-line" />
            </div>
          </Col>
          <Col md={6}>
            <div className="loading-homework-card">
              <div className="just-homework-line" />
            </div>
          </Col>
        </Row>
      )}
      <Row className="mt-3">
        <Col lg={4} className="h-100">
          {homework && (
            <>
              <PrivateContent allowedStates={[TEACHER, ASSISTANT]}>
                <InterviewContainter
                  fetchLink={homework.link("interviews")}
                  withInactive={new Link(
                    homework.group._links.groupMembers.href
                  ).fill("roles", "student")}
                  onSelect={setInterview}
                  changedInterview={interview}
                />
              </PrivateContent>
              <Student>
                <h4 className="mt-0 mb-2">Задания</h4>
                <div className="border rounded">
                  <HomeworkTaskList
                    tasks={homework.tasks}
                    interview={interview}
                    homeworkId={homeworkId}
                    updatedAnswer={answer}
                    onTaskClick={executeTask}
                  />
                </div>
              </Student>
            </>
          )}
        </Col>
        <Col lg={8}>
          {homework && (
            <div className="w-100">
              <PrivateContent allowedStates={[TEACHER, ASSISTANT]}>
                {interview === undefined && (
                  <>
                    <h4 className="mt-0 mb-0 py-1">Задания</h4>
                    <div className="border rounded">
                      <HomeworkTaskList
                        tasks={homework.tasks}
                        interview={interview}
                        homeworkId={homeworkId}
                        updatedAnswer={answer}
                      />
                    </div>
                  </>
                )}
                {interview !== undefined && (
                  <Tabs fill defaultActiveKey="interview">
                    <Tab eventKey="interview" title="Интервью">
                      <div
                        className="border border-top-0"
                        style={{
                          borderBottomLeftRadius: ".25rem",
                          borderBottomRightRadius: ".25rem",
                        }}
                      >
                        <Interview
                          fetchLink={interview.link()}
                          messageCreateLink={interview.link(
                            "interviewMessages"
                          )}
                          createLink={homework.link("interviews")}
                          closed={interview.closed}
                          onAnswer={setAnswer}
                          onInterviewChange={setInterview}
                        />
                      </div>
                    </Tab>
                    <Tab eventKey="taskList" title="Задания">
                      <div
                        className="border border-top-0"
                        style={{
                          borderBottomLeftRadius: ".25rem",
                          borderBottomRightRadius: ".25rem",
                        }}
                      >
                        <HomeworkTaskList
                          tasks={homework.tasks}
                          interview={interview}
                          homeworkId={homeworkId}
                          updatedAnswer={answer}
                          onInterviewChange={setInterview}
                        />
                      </div>
                    </Tab>
                  </Tabs>
                )}
              </PrivateContent>
              {interview !== undefined && (
                <Student>
                  <h4 className="mt-0 mb-2">Интервью</h4>
                  <div className="border rounded">
                    <Interview
                      fetchLink={interview.link()}
                      messageCreateLink={interview.link("interviewMessages")}
                      closed={interview.closed}
                      createLink={homework.link("interviews")}
                      onAnswer={setAnswer}
                      onInterviewChange={setInterview}
                    />
                  </div>
                </Student>
              )}
            </div>
          )}
        </Col>
      </Row>

      {homework && (
        <ExecuteTaskModal
          show={isExecuteTaskModalShow}
          taskLink={taskLink}
          createLink={homework.link("createMessage")}
          interview={interview}
          onClose={() => setIsExecuteTaskModalShow(false)}
        />
      )}
    </>
  );
};

export default HomeworkDetails;
