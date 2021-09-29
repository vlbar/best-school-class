import React from "react";

function TextQuestionAnswer({ question }) {
  return <div className="text-justify text-break">{question.questionAnswer.content}</div>;
}

export default TextQuestionAnswer;
