import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { useInView } from "react-intersection-observer";
import Resource from "../../../util/Hateoas/Resource";
import { createError } from "../../notifications/notifications";
import ProcessBar from "../../process-bar/ProcessBar";
import User from "../../user/User";

function InterviewList({
  fetchLink,
  withInactive,
  selectedId,
  onSelect: handleSelect,
  search,
  changedInterview,
  onlyClosed,
}) {
  const [active, setActive] = useState(selectedId);
  const page = useRef(undefined);
  const groupPage = useRef(undefined);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const { ref, inView } = useInView({ threshold: 1, rootMargin: "10%" });

  function onSelect(interview) {
    if (interview.interviewer.id == active) {
      setActive(null);
      interview = undefined;
    } else setActive(interview.interviewer.id);
    handleSelect && handleSelect(interview);
  }

  useEffect(() => {
    if (changedInterview) {
      setInterviews(
        interviews.map((interview) => {
          if (interview.interviewer.id == changedInterview.interviewer.id)
            return changedInterview;
          return interview;
        })
      );
    }
  }, [changedInterview]);

  useEffect(() => {
    page.current = undefined;
    groupPage.current = undefined;

    fetchInterviews(fetchLink.fill("name", search).fill("closed", onlyClosed));
  }, [search, onlyClosed]);

  function fetchInterviews(link) {
    link
      .fetch(setLoading)
      .then((newPage) => {
        if (newPage.list("interviews")) {
          if (page.current)
            setInterviews([...interviews, ...newPage.list("interviews")]);
          else setInterviews(newPage.list("interviews"));
        } else if (!page.current) setInterviews([]);
        page.current = newPage;
      })
      .catch((err) => {
        page.current = null;
        setHasNext(false);
        createError("Не удалось загрузить участников.", err);
      });
  }

  function fetchGroups(link) {
    link
      .fetch(setLoading)
      .then((newPage) => {
        setHasNext(newPage.link("next"));
        groupPage.current = newPage;
        if (newPage.list("members"))
          setInterviews(
            [
              ...interviews,
              ...newPage.list("members").map((member) => {
                return Resource.basedList(
                  {
                    undefined: fetchLink.withPathTale(member.user.id),
                    interviewMessages: fetchLink
                      .withPathTale(member.user.id)
                      .withPathTale("messages"),
                    changeMark: fetchLink.withPathTale(member.user.id),
                  },
                  {
                    interviewer: member.user,
                    inactive: true,
                  }
                );
              }),
            ].filter(
              (value, index, self) =>
                self.findIndex(
                  (elem) => elem.interviewer.id === value.interviewer.id
                ) === index
            )
          );
      })
      .catch((err) => {
        groupPage.current = null;
        createError("Не удалось загрузить участников.", err);
      });
  }

  function fetch() {
    if (page.current && page.current.link("next"))
      fetchInterviews(page.current.link("next"));
    else if (
      page.current &&
      withInactive &&
      onlyClosed == null &&
      (groupPage.current === undefined || groupPage.current?.link("next"))
    )
      fetchGroups(
        groupPage.current === undefined
          ? withInactive.fill("name", search)
          : groupPage.current.link("next")
      );
  }

  useEffect(() => {
    if (inView && !loading) fetch();
  }, [inView]);

  return (
    <div className="border rounded overflow-auto interview-container">
      <div className="sticky-top">
        <ProcessBar height={2} active={loading} className="position-absolute" />
      </div>

      {interviews.length == 0 && !loading && (
        <div className="alert-light mt-2 text-center w-100 p-3">
          {page.current == null && !hasNext && (
            <div className="w-100 text-center p-5 text-muted">
              <h5 className="text-dark">Произошла ошибка</h5>
              <div>Не удалось загрузить список участников</div>
              <Button
                onClick={() =>
                  fetchInterviews(
                    fetchLink.fill("name", search).fill("closed", onlyClosed)
                  )
                }
                variant="link mx-auto w-100"
              >
                Попробовать снова
              </Button>
            </div>
          )}
          {page.current != null && onlyClosed == null && search.length == 0 ? (
            <div>
              <p>Похоже, здесь пока никого нет. </p>
              <p>
                Это возможно в том случае, если в группе отсутствуют ученики.
                <br />
                Сначала нужно пригласить учеников в группу!
              </p>
            </div>
          ) : (
            page.current != null && (
              <div>По заданным критериям поиска никого не нашлось. :(</div>
            )
          )}
        </div>
      )}
      <ListGroup variant="flush">
        {interviews.map((interview) => {
          return (
            <ListGroup.Item
              key={interview.interviewer.id}
              active={interview.interviewer.id == active}
              action
              onClick={() => {
                onSelect(interview);
              }}
              variant={
                interview.inactive
                  ? "secondary"
                  : interview.closed
                  ? "light"
                  : null
              }
            >
              <div className="d-flex align-items-center">
                <User
                  className="mr-2"
                  user={interview.interviewer}
                  iconSize={36}
                />
                <div className="text-success bg-white rounded p-1">
                  {interview.result}
                </div>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
      {!loading && hasNext && (
        <Button ref={ref} onClick={fetch} variant="link mx-auto w-100">
          Загрузить ещё...
        </Button>
      )}
    </div>
  );
}

export default InterviewList;
