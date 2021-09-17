import React from "react";

function DateMessageGroup({ messageGroups, date }) {
  return (
    <div className="position-relative" key={date}>
      {date && (
        <div className="text-muted text-center my-2">
          <HumanReadableDate date={date} />
        </div>
      )}
      {messageGroups}
    </div>
  );
}

export default DateMessageGroup;
