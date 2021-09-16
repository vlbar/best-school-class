import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { useInView } from "react-intersection-observer";
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
  const page = useRef(null);
  const groupPage = useRef(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
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
    page.current = null;
    groupPage.current = null;

    fetchInterviews(fetchLink.fill("name", search).fill("closed", onlyClosed));
  }, [search, onlyClosed]);

  function fetchInterviews(link) {
    link.fetch(setLoading).then((newPage) => {
      if (newPage.list("interviews")) {
        if (page.current)
          setInterviews([...interviews, ...newPage.list("interviews")]);
        else setInterviews(newPage.list("interviews"));
      } else if (!page.current) setInterviews([]);
      page.current = newPage;
    });
  }

  function fetchGroups(link) {
    link.fetch(setLoading).then((newPage) => {
      groupPage.current = newPage;
      if (newPage.list("members"))
        setInterviews(
          [
            ...interviews,
            ...newPage.list("members").map((member) => {
              return {
                interviewer: member.user,
                inactive: true,
                link: () => fetchLink.withPathTale(member.user.id),
              };
            }),
          ].filter(
            (value, index, self) =>
              self.findIndex(
                (elem) => elem.interviewer.id === value.interviewer.id
              ) === index
          )
        );
    });
  }

  function fetch() {
    if (page.current && page.current.link("next"))
      fetchInterviews(page.current.link("next"));
    else if (
      withInactive &&
      onlyClosed == null &&
      (groupPage.current == null || groupPage.current.link("next"))
    )
      fetchGroups(
        groupPage.current == null
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
          {onlyClosed == null && search.length == 0 ? (
            <div>
              <p>Похоже, здесь пока никого нет. </p>
              <p>
                Это возможно в том случае, если в группе отсутствуют ученики.
                <br />
                Сначала нужно пригласить учеников в группу!
              </p>
            </div>
          ) : (
            <div>По заданным критериям поиска никого не нашлось. :(</div>
          )}
        </div>
      )}
      <ListGroup variant="flush">
        {interviews.map((interview, index) => {
          return (
            <ListGroup.Item
              key={index}
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
                <div className="text-success">{interview.result}</div>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
      {!loading &&
        (page.current == null ||
          (onlyClosed == null && groupPage.current == null) ||
          page.current.link("next") ||
          (onlyClosed == null && groupPage.current.link("next"))) && (
          <Button ref={ref} onClick={fetch} variant="link mx-auto w-100">
            Загрузить ещё...
          </Button>
        )}
    </div>
  );
}

export default InterviewList;
