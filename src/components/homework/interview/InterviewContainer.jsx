import React, { useEffect, useState } from "react";
import WaitingListener from "../../common/WaitingListener";
import PopupSearchBar from "../../search/PopupSearchBar";
import SortOrder from "../../search/SortOrder";
import InterviewList from "./InterviewList";

function InterviewContainer({
  fetchLink,
  withInactive,
  onSelect,
  changedInterview,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  return (
    <>
      <div className="d-flex my-1 justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h4 className="m-0">Участники</h4>
          <SortOrder
            className="ml-2"
            orders={{
              ALL: "Все",
              ACTIVE: "Активные",
              CLOSED: "Закрытые",
            }}
            initialOrder={filter}
            onSelect={setFilter}
          />
        </div>

        <WaitingListener delay={500} onChange={setSearch}>
          {({ value: query, onChange }) => {
            return (
              <PopupSearchBar
                value={query}
                onChange={onChange}
                onSubmit={onChange}
                placeholder="Введите имя.."
              />
            );
          }}
        </WaitingListener>
      </div>

      <InterviewList
        fetchLink={fetchLink}
        withInactive={withInactive}
        onSelect={onSelect}
        changedInterview={changedInterview}
        search={search}
        onlyClosed={
          filter == "CLOSED" ? true : filter == "ACTIVE" ? false : null
        }
      />
    </>
  );
}

export default InterviewContainer;
