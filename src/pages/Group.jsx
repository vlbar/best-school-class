import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useHistory, useParams } from "react-router-dom";
import { useLastLocation } from "react-router-last-location";
import GroupCreator from "../components/groups/details/GroupCreator";
import GroupInfo from "../components/groups/details/GroupInfo";
import GroupMemberList from "../components/groups/details/members/GroupMemberList";
import ProcessBar from "../components/process-bar/ProcessBar";
import ActiveContent from "../components/routing/VaryLink/ActiveContent";
import PrivateRoute from "../components/routing/PrivateRoute";
import VaryLink from "../components/routing/VaryLink/VaryLink";
import { selectState } from "../redux/state/stateSelector";
import { selectUser } from "../redux/user/userSelectors";
import Hateoas from "../util/Hateoas/Hateoas";
import { createContext } from "react";
import ModalTrigger from "../components/common/ModalTrigger";
import MemberSettingsModal from "../components/groups/details/members/MemberSettingsModal";
import { createError } from "../components/notifications/notifications";
import { changed } from "../redux/state/stateReduser";
import { types } from "../redux/state/stateActions";

export const GroupContext = createContext({
  group: null,
  creator: null,
  member: null,
  onGroupEdit: null,
});

function Group({ match, baseHref = "/groups", fetchHref }) {
  const { id } = useParams();
  const href = fetchHref ?? baseHref + `/${id}`;
  const { state } = useSelector(selectState);
  const didMountRef = useRef(false);
  const lastLocationRef = useRef(useLastLocation());
  const history = useHistory();
  const dispatch = useDispatch();

  const [group, setGroup] = useState(null);
  const [creator, setCreator] = useState(null);
  const [member, setMember] = useState(null);
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);

  function getBack() {
    return lastLocationRef.current
      ? lastLocationRef.current.pathname
      : "/groups";
  }

  useEffect(() => {
    Hateoas.fetch(href, setLoading)
      .then((data) => {
        setGroup(data);
      })
      .catch((err) => {
        if (err.response.status !== 403)
          createError("Не удалось загрузить группу.", err);
        else history.push("/denied");
      });
  }, []);

  useEffect(() => {
    if (didMountRef.current && state != member?.role.toLowerCase())
      history.push(getBack());
    else didMountRef.current = true;
  }, [state]);

  useEffect(() => {
    if (group) {
      if (!creator || creator.id != group.creatorId)
        group
          .link("creator")
          ?.fetch()
          .then((data) => setCreator(data))
          .catch((err) => {
            createError("Не удалось загрузить создателя группы.", err);
          });
    }
  }, [group]);

  useEffect(() => {
    if (group && user)
      if (!member || (member && member.user.id != user.id))
        group
          .link("me")
          .fetch()
          .then((data) => {
            setMember(data);
            dispatch(changed(types[data.role]));
          })
          .catch((err) => {
            createError(
              "Не удалось загрузить ваше участие в группе. Ваши возможности могут быть ограничены.",
              err
            );
          });
  }, [group, user]);

  return (
    <Container className="mt-3">
      <GroupContext.Provider
        value={{ group, creator, member, onGroupEdit: setGroup }}
      >
        <NavLink to={getBack()} className="text-secondary text-decoration-none">
          <i className="fas fa-chevron-left"></i> Вернуться
        </NavLink>
        {loading && <ProcessBar height="2px" className="mb-2" />}
        {!loading && group && user && (
          <div>
            <Row>
              <Col md={6} lg={8}>
                <GroupInfo
                  initGroup={group}
                  isCreator={user.id === group.creatorId}
                />
              </Col>
              <Col md={6} lg={4}>
                <div className="float-right">
                  {creator && (
                    <GroupCreator
                      creator={creator}
                      isCurrent={creator.id === user.id}
                    />
                  )}
                </div>
              </Col>
            </Row>

            <Navbar expand="lg" className="p-0 mt-3">
              <Nav fill className="w-100" variant="tabs">
                <Nav.Link as={NavLink} to={`${match.url}`} exact>
                  <i className="far fa-newspaper"></i> Новости
                </Nav.Link>

                <VaryLink
                  as={NavLink}
                  to={`${match.url}/members`}
                  className="position-relative"
                >
                  <span>
                    <i className="fas fa-users"></i> Участники
                  </span>
                  {group.creatorId === user.id && (
                    <ActiveContent>
                      <ModalTrigger
                        modal={
                          <MemberSettingsModal
                            group={group}
                            onGroupEdit={setGroup}
                          />
                        }
                      >
                        <Button
                          variant="transparent"
                          className="py-0 mx-2 position-absolute"
                          style={{ right: 0 }}
                        >
                          <i className="fas fa-cog"></i>
                        </Button>
                      </ModalTrigger>
                    </ActiveContent>
                  )}
                </VaryLink>

                <Nav.Link as={NavLink} to={`${match.url}/schedule`}>
                  <i className="far fa-calendar-alt"></i> Расписание
                </Nav.Link>

                <Nav.Link as={NavLink} to={`${match.url}/tasks`}>
                  <i className="fas fa-tasks"></i> Задания
                </Nav.Link>

                <Nav.Link as={NavLink} to={`${match.url}/marks`}>
                  <i className="fas fa-book"></i> Оценки
                </Nav.Link>
              </Nav>
            </Navbar>

            <PrivateRoute
              path={`/groups/:id/`}
              exact
              component={() => {
                return "Стена Дурова..";
              }}
            />
            {group && creator && member && (
              <PrivateRoute
                path={`/groups/:id/members`}
                exact
                component={GroupMemberList}
              />
            )}
            <PrivateRoute
              path={`/groups/:id/schedule`}
              component={() => {
                return "schedule...";
              }}
            />
            <PrivateRoute
              path={`/groups/:id/tasks`}
              component={() => {
                return "tasks...";
              }}
            />
            <PrivateRoute
              path={`/groups/:id/marks`}
              component={() => {
                return "marks...";
              }}
            />
          </div>
        )}
      </GroupContext.Provider>
    </Container>
  );
}

export default Group;
