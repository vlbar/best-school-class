import React from "react";
import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";

import usePageTitle from "../components/feedback/usePageTitle";
import HomeworkDetails from "../components/homework/HomeworkDetails";
import HomeworkList from "../components/homework/HomeworkList";
import { STUDENT } from "../redux/state/stateActions";
import { selectState } from "../redux/state/stateSelector";

function Homeworks() {
  const { homeworkId } = useParams();
  const history = useHistory();
  const state = useSelector(selectState);
  usePageTitle({ title: homeworkId ? "Домашняя работа" : "Задания" });

  return homeworkId ? (
    <Container>
      <HomeworkDetails homeworkId={homeworkId} />
    </Container>
  ) : (
    <Container>
      <h4 className="my-3">Текущие задания</h4>
      <HomeworkList
        role={state.state}
        className="high-homework-list"
        canExpandTasks={false}
        onClick={(hw) => history.push(`/homeworks/${hw.id}`)}
      />
    </Container>
  );
}

export default Homeworks;
