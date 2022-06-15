import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Dropdown,
} from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { useRef } from "react";
import { useSelector } from "react-redux";

import "../components/groups/GroupList.less";
import Assistant from "../components/routing/PrivateContentAliases/Assistant";
import GroupList from "../components/groups/GroupList";
import Link from "../util/Hateoas/Link";
import ModalTrigger from "../components/common/ModalTrigger";
import Page from './../components/common/Page';
import ProcessBar from "../components/process-bar/ProcessBar";
import Resource from "../util/Hateoas/Resource";
import SearchBar from './../components/search/SearchBar';
import Student from "../components/routing/PrivateContentAliases/Student";
import Teacher from "../components/routing/PrivateContentAliases/Teacher";
import { GroupAddModal } from "../components/groups/create/GroupAddModal";
import { InviteCodeInputModal } from "../components/groups/join/InviteCodeInputModal";
import { createError } from "../components/notifications/notifications";
import { selectState } from "../redux/state/stateSelector";
import { selectUser } from "../redux/user/userSelectors";

function Groups() {
  const pageSize = 12;
  const { state } = useSelector(selectState);
  const history = useHistory();
  const user = useSelector(selectUser);
  const { ref, inView } = useInView({ threshold: 1, rootMargin: "10%" });
  const lastSearchRef = useRef("");
  const didMountRef = useRef(0);

  const firstPage = Resource.based(new Link("/groups").fill("size", pageSize));

  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function loadGroups(link) {
    link
      ?.fetch(setLoading)
      .then((page) => {
        if (page.list("groups")) {
          setGroups([...groups, ...page.list("groups")]);

          lastSearchRef.current = search;
        }
        setError(false);
        setNext(page.link("next"));
      })
      .catch((err) => {
        createError("Не удалось загрузить список групп.", err);
        setError(true);
      });
  }

  useEffect(() => {
    //died from cringe
    if (didMountRef.current > 0) {
      if (groups.length === 0) {
        setNext(null);
        loadGroups(firstPage.link().fill("name", search).fill("roles", state));
      }
    } else didMountRef.current++;
  }, [groups]);

  useEffect(() => {
    setGroups([]);
  }, [state]);

  useEffect(() => {
    if (
      groups.length === 0 &&
      search != lastSearchRef.current &&
      search.startsWith(lastSearchRef.current)
    )
      return;

    setGroups([]);
  }, [search]);

  useEffect(() => {
    if (inView && !loading && !error) loadGroups(next);
  }, [inView]);

  function onCreateSubmit(group) {
    history.push(`/groups/${group.id}`);
  }

  function onRetry() {
    setError(false);
    if (next) loadGroups(next);
    else loadGroups(firstPage.link().fill("name", search).fill("roles", state));
  }

  function emptyMessage() {
    return (
      <>
        <div>
          Здесь будут отображаться группы, в которых вы являетесь{" "}
          <Teacher>преподавателем.</Teacher>
          <Student>учеником.</Student>
          <Assistant>помощником.</Assistant>
        </div>
        <div>
          Eсли у вас есть код приглашения от <Teacher>другого </Teacher>
          <Student>вашего </Student>
          преподавателя, вы можете{" "}
        </div>
        <div>
          <ModalTrigger modal={<InviteCodeInputModal />}>
            <a role="button" className="alert-link">
              Присоединиться
            </a>
          </ModalTrigger>{" "}
          к его группе.
        </div>
        <Teacher>
          или
          <div>
            <ModalTrigger
              modal={
                <GroupAddModal
                  onSubmit={onCreateSubmit}
                  link={firstPage.link()}
                />
              }
            >
              <a role="button" className="alert-link">
                Cоздать
              </a>
            </ModalTrigger>{" "}
            свою собственную группу.
          </div>
        </Teacher>
      </>
    );
  }

  function notFoundMessage() {
    return (
      <>
        Группы с таким названием не найдено.
        <br />
        Проверьте условия поиска, возможно, необходимо сменить роль.
      </>
    );
  }

  function errorMessage() {
    return (
      <div className="text-center my-3 py-3">
        <Alert variant="light">
          <h5 className="text-dark">Произошла ошибка.</h5>
          <p>
            Не удалось загрузить список групп. Попробуйте снова позже.
            <br />
            <a
              role="button"
              className="alert-link stretched-link"
              onClick={onRetry}
            >
              Попробовать снова
            </a>
          </p>
        </Alert>
      </div>
    );
  }

  return (
    <Page name="Группы">
      <div className="d-flex flex-wrap w-100">
        <SearchBar
          onSubmit={setSearch}
          placeholder="Поиск группы..."
          className="flex-grow-1 mr-2 mb-3"
        />
        <div className="mb-3">
          <Dropdown as={ButtonGroup}>
            <ModalTrigger modal={<InviteCodeInputModal />}>
              <Button variant="primary">Присоединиться</Button>
            </ModalTrigger>
            <Teacher>
              <Dropdown.Toggle variant="primary" />
              <Dropdown.Menu>
                <ModalTrigger
                  modal={
                    <GroupAddModal
                      onSubmit={onCreateSubmit}
                      link={firstPage.link()}
                    />
                  }
                >
                  <Dropdown.Item>Создать</Dropdown.Item>
                </ModalTrigger>
              </Dropdown.Menu>
            </Teacher>
          </Dropdown>
        </div>
      </div>

      <GroupList groups={groups} user={user} />
      <ProcessBar height="2px" active={loading} className="mb-2" />

      {!loading &&
        (next ? (
          <Button
            ref={ref}
            onClick={() => loadGroups(next)}
            variant="link mx-auto w-100"
          >
            Загрузить ещё...
          </Button>
        ) : (
          groups.length === 0 && (
            <Alert variant="light" className="text-center my-5 py-5">
              {error
                ? errorMessage()
                : search
                ? notFoundMessage()
                : emptyMessage()}
            </Alert>
          )
        ))}
    </Page>
  );
}

export default Groups;
