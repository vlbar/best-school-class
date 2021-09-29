import React, { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { useInView } from "react-intersection-observer";
import { createError } from "../../../notifications/notifications";
import ProcessBar from "../../../process-bar/ProcessBar";
import Question from "./Question";

function QuestionContainer({
  isExpanded,
  fetchLink,
  readOnly,
  onScoreChange,
  onLoaded,
  onSaved,
}) {
  const page = useRef(null);
  const savingQuestions = useRef([]);
  const [hasNext, setHasNext] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView({ threshold: 0 });
  const maxScore = useRef(0);

  useEffect(() => {
    if (isExpanded && fetchLink && page.current == null && !loading)
      fetchPage(fetchLink);
  }, [fetchLink, isExpanded]);

  useEffect(() => {
    if (inView && isExpanded) onNext();
  }, [inView]);

  function fetchPage(link) {
    link
      .fetch(setLoading)
      .then((newPage) => {
        if (newPage.list("questions")) {
          let newPageScore = newPage
            .list("questions")
            .reduce(
              (accumulator, value) =>
                accumulator + value.questionVariant.questionMaxScore,
              0
            );

          if (page.current == null) {
            setQuestions(newPage.list("questions"));
            maxScore.current = newPageScore;
            onLoaded && onLoaded();
          } else {
            setQuestions([...questions, ...newPage.list("questions")]);
            maxScore.current += newPageScore;
          }
        }
        page.current = newPage;
        setHasNext(newPage.link("next"));
      })
      .catch((err) =>
        createError("Не удалось загрузить список вопросов.", err)
      );
  }

  function onNext() {
    if (hasNext && !loading) fetchPage(page.current.link("next"));
  }

  function handleScoreChange(oldScore, newScore, id) {
    onScoreChange && onScoreChange(oldScore, newScore, maxScore.current);
    setQuestions(
      questions.map((q) => {
        if (q.questionAnswer?.id == id) q.questionAnswer.score = newScore;
        return q;
      })
    );
  }

  function handleSaving(saved, id) {
    if (saved)
      savingQuestions.current = savingQuestions.current.filter(
        (qId) => qId != id
      );
    else savingQuestions.current.push(id);

    onSaved(savingQuestions.current.length == 0);
  }

  if (!isExpanded) return null;
  else
    return (
      <div className="position-relative">
        <h6 className="mt-4">Ответы:</h6>
        {questions.map((question, index) => {
          return (
            <div key={index} className="my-1">
              <Question
                link={question.link("changeScore")}
                question={question.questionVariant}
                questionAnswer={question.questionAnswer}
                onScoreChange={handleScoreChange}
                readOnly={readOnly}
                onSaving={(status) => handleSaving(status, question.id)}
              />
            </div>
          );
        })}
        {hasNext && !loading && (
          <Button ref={ref} onClick={onNext} variant="link mx-auto w-100">
            Загрузить ещё...
          </Button>
        )}
        <ProcessBar className="position-absolute" active={loading} height={2} />
      </div>
    );
}

export default QuestionContainer;
