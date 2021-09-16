import React, { useState, useRef, useEffect } from "react";
import HomeworkListHeader from "./HomeworkListHeader";
import { useInView } from "react-intersection-observer";
import axios from "axios";

import ProcessBar from "../process-bar/ProcessBar";
import HomeworkListItem, { FakeHomeworkListItem } from "./HomeworkListItem";
import { addErrorNotification } from "../notifications/notifications";
import { TEACHER } from "../../redux/state/stateActions";
import "./HomeworkList.less";

const baseUrl = "/homeworks";

async function fetch(page, size, groupId, role, order) {
  return axios.get(
    `${baseUrl}?page=${page}&size=${size}${
      groupId !== undefined ? `&groupId=${groupId}` : ""
    }${order !== undefined ? `&order=${order}` : ""}&r=${role[0]}`
  );
}

const HomeworkList = ({
  onSelect,
  onClick,
  canExpandTasks = true,
  role = TEACHER,
  groupId,
  ...props
}) => {
  // fetching
  const [homeworks, setHomeworks] = useState(undefined);
  const [isFetching, setIsFetching] = useState(false);

  const pagination = useRef({
    page: 0,
    size: 10,
    total: undefined,
    groupId: groupId,
    orderBy: "openingDate-desc",
  });

  useEffect(() => {
    //if(!homeworks)
    pagination.current.page = 0;
    fetchHomeworks();
  }, [role]);

  //auto fetch
  const { ref, inView } = useInView({
    threshold: 1,
  });

  useEffect(() => {
    if (inView && !isFetching) fetchHomeworks();
  }, [inView]);

  const onSelectFilterHandler = (filter) => {
    pagination.current = { ...pagination.current, ...filter };
    pagination.current.page = 0;
    fetchHomeworks();
  };
  let isSearching = pagination.current.groupId != undefined;

  const fetchHomeworks = () => {
    setIsFetching(true);
    pagination.current.page++;

    if (pagination.current.page == 1) {
      setHomeworks(undefined);
    }

    fetch(
      pagination.current.page,
      pagination.current.size,
      pagination.current.groupId,
      role,
      pagination.current.orderBy
    )
      .then((res) => {
        let fetchedData = res.data;
        pagination.current.total = fetchedData.page.totalElements;

        if (pagination.current.page == 1)
          setHomeworks(fetchedData.list("homeworks") ?? []);
        else setHomeworks([...homeworks, ...fetchedData.list("homeworks")]);
      })
      .catch((error) =>
        addErrorNotification(
          "Не удалось загрузить список домащних работ. \n" + error
        )
      )
      .finally(() => setIsFetching(false));
  };

  return (
    <div {...props}>
      {!groupId && (
        <HomeworkListHeader onSelectFilter={onSelectFilterHandler} />
      )}
      <div className="homework-list">
        {isFetching && (
          <ProcessBar height=".18Rem" className="position-absolute" />
        )}
        <div className="scroll-container">
          {homeworks &&
            homeworks.map((homework) => {
              return (
                <HomeworkListItem
                  key={homework.id}
                  homework={homework}
                  onSelect={onSelect && (() => onSelect(homework))}
                  onClick={onClick && (() => onClick(homework))}
                  canExpandTasks={canExpandTasks}
                />
              );
            })}
          {isFetching && (
            <>
              <FakeHomeworkListItem canExpandTasks={canExpandTasks} />
              <FakeHomeworkListItem canExpandTasks={canExpandTasks} />
            </>
          )}
          {homeworks !== undefined &&
            !isFetching &&
            pagination.current.page * pagination.current.size <
              pagination.current.total && (
              <button
                className="fetch-types-btn"
                onClick={() => fetchHomeworks()}
                disabled={isFetching}
                ref={ref}
              >
                Загрузить еще
              </button>
            )}
          {!isFetching &&
            (homeworks
              ? homeworks.length === 0 &&
                (isSearching ? (
                  <div className="m-2 text-center">
                    <h6 className="mt-4">Ничего не найдено</h6>
                    <p className="text-muted">
                      По вашему запросу ничего не найдено.
                    </p>
                  </div>
                ) : (
                  <div className="m-2 text-center">
                    <h6 className="mt-4">Ничего нет</h6>
                    <p className="text-muted">Еще ничего не добавлено.</p>
                  </div>
                ))
              : !isSearching && (
                  <div className="m-2 text-center">
                    <h6 className="mt-4">Произошла ошибка</h6>
                    <p className="text-muted">Не удалось загрузить данные.</p>
                  </div>
                ))}
        </div>
      </div>
    </div>
  );
};

export default HomeworkList;
