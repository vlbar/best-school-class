import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import GroupList from "../components/groups/GroupList";
import {
  fromStateToParameter,
  STUDENT,
  TEACHER,
} from "../redux/state/stateActions";
import "../components/groups/GroupList.less";
import { GroupAddModal } from "../components/groups/create/GroupAddModal";
import { GroupInviteModal } from "../components/groups/create/GroupInviteModal";
import MasterForm from "../components/groups/MasterForm";
import PrivateContent from "../components/routing/PrivateContent";
import { store } from "react-notifications-component";
import ProcessBar from "../components/process-bar/ProcessBar";
import InfiniteScroll from "react-infinite-scroller";
import SortOrder from "../components/search/SortOrder";
import SearchBar from "../components/search/SearchBar";
import errorNotification from "../components/notifications/error";
import { useDispatch, useSelector } from "react-redux";
import { selectState } from "../redux/state/stateSelector";
import { GroupJoinModal } from "../components/groups/join/GroupJoinModal";
import { GroupJoinDetails } from "../components/groups/join/GroupJoinDetails";
import { useParams } from "react-router-dom";
import { changed } from "../redux/state/stateReduser";

async function fetchGroups(page, size, order, search, state) {
  return axios
    .get(
      `/groups?page=${page}&size=${size}&order=${order}${
        search && `&name=${encodeURIComponent(search)}`
      }&${fromStateToParameter(state)}`
    )
    .then((response) => {
      return response.data;
    });
}

async function createGroup(data) {
  return axios.post("/groups", data).then((response) => {
    return response.data;
  });
}

async function joinGroup(joinCode) {
  return axios.post(`/invites/${joinCode}/admissions`).then((response) => {
    return response.data;
  });
}


const orders = {
  "name-asc": "По алфавиту",
  "createdAt-desc": "По дате создания",
};

function Groups() {
  const { code } = useParams();
  const [joinCode, setJoinCode] = useState(code)
  const [groups, setGroups] = useState([]);
  const [isCreateModalShow, setIsCreateModalShow] = useState(false);
  const [isJoinModalShow, setIsJoinModalShow] = useState(false);
  const [currentOrder, setCurrentOrder] = useState("createdAt-desc");
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [value, setValue] = useState(true);
  const { state } = useSelector(selectState);
  const dispatch = useDispatch()

  function loadGroups(page) {
    fetchGroups(page, 12, currentOrder, search, state)
      .then((data) => {
        setGroups([...groups, ...data.items]);
        if (data.currentPage >= data.totalPages) setHasMore(false);
        else setHasMore(true);
      })
      .catch((e) => {
        setValue(false);
        store.addNotification({
          ...errorNotification,
          message: "Не удалось загрузить список групп. \n" + e.message,
        });
      });
  }

  useEffect(() => {
    if(joinCode) {
      dispatch(changed(STUDENT))
      setIsJoinModalShow(true)
    }
  }, [joinCode])

  useEffect(() => {
    setHasMore(true);
    setValue(false);
    setTimeout(() => setValue(true), 50);
    setGroups([]);
  }, [currentOrder, search, state]);

  function onOrderChange(key) {
    setCurrentOrder(key);
  }

  function onSearchChange(query) {
    console.log(query)
    setSearch(query);
  }

  async function onCreateSubmit(data) {
    return createGroup(data).then((data) => {
      setGroups([data, ...groups]);
      return data;
    });
  }

  function onGroupEdit(values, id) {
    let group = groups.find((item) => item.id == id);
    const newGroup = { ...group, ...values };
    const newGroups = groups.map((item) => (item.id == id ? newGroup : item));
    setGroups(newGroups);
  }

  function onClose() {
    setIsCreateModalShow(false);
    setIsJoinModalShow(false);
  }

  function onJoinSubmit(joinCode) {
      joinGroup(joinCode).then(onClose);
  }

  return (
    <Container>
      {isCreateModalShow && (
        <Modal show={isCreateModalShow} onHide={onClose}>
          <MasterForm
            onSubmit={onCreateSubmit}
            steps={[GroupAddModal, GroupInviteModal]}
            onClose={onClose}
          />
        </Modal>
      )}
      {isJoinModalShow && (
        <Modal show={isJoinModalShow} onHide={onClose}>
          <MasterForm
            onJoin={onJoinSubmit}
            steps={joinCode? [GroupJoinDetails] : [GroupJoinModal, GroupJoinDetails]}
            onClose={onClose}
            data={{joinCode: joinCode, isClosed: false}}
          />
        </Modal>
      )}
      <h4 className="mt-3">Группы</h4>
      <div className="my-2">Учебные классы</div>
      <Row className="mb-0">
        <Col md={4} xs={12} className="mb-2">
          <PrivateContent allowedStates={[TEACHER]}>
            <Button
              variant="outline-dark"
              onClick={() => setIsCreateModalShow(true)}
              className="w-100"
            >
              Добавить
            </Button>
          </PrivateContent>
          <PrivateContent allowedStates={[STUDENT]}>
            <Button
              variant="outline-dark"
              onClick={() => setIsJoinModalShow(true)}
              className="w-100"
            >
              Присоединиться
            </Button>
          </PrivateContent>
        </Col>
        <Col md={4} xs={12}>
          <div className="mb-2 d-flex justify-content-end align-items-baseline">
            <div className="mr-3">Сортировка</div>
            <SortOrder
              orders={orders}
              initialOrder={currentOrder}
              onSelect={onOrderChange}
              variant="outline-secondary"
              className="w-100"
            />
          </div>
        </Col>
        <Col md={4} xs={12}>
          <SearchBar
            onSubmit={onSearchChange}
            onEmpty={() => onSearchChange("")}
            buttonVariant="outline-secondary"
            placeholder="Название"
            borderColor="#6c757d"
          />
        </Col>
      </Row>

      {value && (
        <InfiniteScroll
          pageStart={0}
          loadMore={loadGroups}
          hasMore={hasMore}
          loader={<ProcessBar height="2px" className="mb-2" key="1" />}
        >
          <GroupList groups={groups} onGroupEdit={onGroupEdit} />
        </InfiniteScroll>
      )}
    </Container>
  );
}

export default Groups;
