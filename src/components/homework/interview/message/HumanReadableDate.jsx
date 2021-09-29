import React from "react";
import Moment from "react-moment";

export function getCalendarStrings(date) {
  if (date.getYear() === new Date().getYear())
    return {
      sameDay: "сегодня",
      lastDay: "вчера",
      nextDay: "завтра",
      lastWeek: "D MMMM",
      nextWeek: "D MMMM",
      sameElse: "D MMMM",
    };
  else
    return {
      sameElse: "D MMMM YYYY",
    };
}

function HumanReadableDate({ date, withTime = false }) {
  return (
    <>
      <Moment
        date={date}
        calendar={getCalendarStrings(new Date(date))}
        locale="ru"
      />
      {withTime && (
        <>
          {" "}
          в <Moment date={date} format="HH:mm" />
        </>
      )}
    </>
  );
}

export default HumanReadableDate;
