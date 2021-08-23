import React from "react";

function MembersNames({ members, total, showTotal = true}) {
  function membersWord(count) {
    var number = count % 10;
    if (number === 1) return "участник";
    if (number > 1 && number < 5) return "участника";
    if (number >= 5) return "участников";
  }

  return (
    <small className="text-muted">
      {total <= members.length && <span>Участники: </span>}
      {members.map((member) => member.user.secondName).join(", ")}{" "}
      {showTotal && total > members.length && (
        <span>
          и еще {total - members.length} {membersWord(total - members.length)}
        </span>
      )}
    </small>
  );
}

export default MembersNames;
