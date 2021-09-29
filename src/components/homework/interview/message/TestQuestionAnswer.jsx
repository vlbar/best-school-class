import React from "react";
import { Form } from "react-bootstrap";
import "./TestQuestionAnswer.less";

function TestQuestionAnswer({ question }) {
  return question.question.testAnswerVariants.map((answerVariant) => {
    answerVariant.checked =
      question.questionAnswer.selectedAnswerVariantsIds.find(
        (x) => x === answerVariant.id
      ) != null;
    return (
      <div key={answerVariant.id} className="text-break">
        <Form.Check
          custom
          disabled
          type={question.question.isMultipleAnswer ? "checkbox" : "radio"}
          label={
            answerVariant.answer + (answerVariant.right ? " (Правильный)" : "")
          }
          name={question.question.id}
          defaultChecked={answerVariant.checked}
          className={
            !answerVariant.right && !answerVariant.checked
              ? "text-break"
              : answerVariant.right && answerVariant.checked
              ? "right text-break"
              : "not-right text-break"
          }
        />
      </div>
    );
  });
}

export default TestQuestionAnswer;
