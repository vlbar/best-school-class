import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Alert } from "react-bootstrap";
import { useHistory } from "react-router";
import { createError } from "../../../notifications/notifications";
import ProcessBar from "../../../process-bar/ProcessBar";
import GroupShareModal from "../../invite/GroupShareModal";
import MembersHeader from "./MembersHeader";
import MemberList from "./MembersList";
import Page from "./Page";

function MemberContainer({
  title,
  membersLink,
  invitesLink,
  roles,
  currentUser,
  isCreator,
  closed = false,
  withRoles,
  withLimit,
  pageSize = 10,
  onSettingsCall,
  internalState = null,
}) {
  const history = useHistory();
  const didMountRef = useRef(false);

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTotal, setCurrentTotal] = useState(null);
  const [inviteModalShow, setInviteModalShow] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(false);

  function fetchPage(link) {
    return link
      .fetch(setLoading)
      .then((page) => {
        setPage(page);
        return page;
      })
      .catch((err) => {
        createError(
          `Не удалось загрузить страницу участников "${title}" группы.`,
          err
        );
        if (!page) setError(true);
      });
  }

  function firstFetch() {
    setError(false);
    fetchPage(
      membersLink?.withTParam("roles", roles.toString()).fill("size", pageSize)
    ).then((page) => setCurrentTotal(page.page.totalElements));
  }

  useEffect(() => {
    if (!didMountRef.current) {
      firstFetch();
      didMountRef.current = true;
    }
  }, [membersLink, roles]);

  function onPrev() {
    fetchPage(page.link("prev"));
  }

  function onNext() {
    fetchPage(page.link("next"));
  }

  function onQuery(query) {
    setSearch(query);
    if (
      page.page.totalElements === 0 &&
      (encodeURIComponent(query).startsWith(page.link("first").param("name")) ||
        !page.link("first").param("name"))
    )
      return;
    fetchPage(page.link("first").fill("name", query));
  }

  function onLeave() {
    page
      .link("me")
      ?.remove()
      .then(() => {
        history.push("/groups");
      })
      .catch((err) => createError("Не удалось покинуть группу.", err));
  }

  function onKick(member) {
    member
      .link()
      ?.remove()
      .then(() => {
        if (page.list("members").length === 1 && page.link("prev")) onPrev();
        else fetchPage(page.link());
      })
      .catch((err) => createError("Не удалось выгнать участника.", err));
  }

  function emptyMessage() {
    if (isCreator)
      return (
        <>
          Похоже, тут пока никого нет{!isCreator && <> :(</>}
          {isCreator &&
            (closed ? (
              <>
                , и никто не может вступить, потому что группа закрыта. Сначала
                необходимо
                <br />
                <a
                  role="button"
                  className="alert-link stretched-link"
                  onClick={onSettingsCall}
                >
                  Открыть
                </a>{" "}
                группу.
              </>
            ) : (
              <>
                , но вы можете
                <br />
                <a
                  role="button"
                  className="alert-link stretched-link"
                  onClick={() => setInviteModalShow(true)}
                >
                  Пригласить
                </a>{" "}
                новых участников.
              </>
            ))}
        </>
      );
    else return <>Похоже, тут пока никого нет :(</>;
  }

  function notFoundMessage() {
    return <>Никого с таким именем здесь пока нет :(</>;
  }

  function errorMessage() {
    return (
      <Alert variant="light" className="text-center">
        <h5 className="text-dark">Произошла ошибка.</h5>
        <p>
          Не удалось загрузить список участников. Перезагрузите страницу или
          попробуйте снова позже.
          <br />
          <a
            role="button"
            className="alert-link stretched-link"
            onClick={firstFetch}
          >
            Попробовать снова
          </a>
        </p>
      </Alert>
    );
  }

  return (
    <>
      <div>
        {inviteModalShow && (
          <GroupShareModal
            onClose={() => setInviteModalShow(false)}
            invitesLink={invitesLink}
            roles={roles}
          />
        )}
      </div>
      <div className="p-1">
        <MembersHeader
          title={title}
          isCreator={isCreator}
          limit={withLimit}
          current={currentTotal}
          internalState={internalState}
          onInvite={() => setInviteModalShow(true)}
          onQueryChange={onQuery}
          disabled={closed}
        />
        <ProcessBar height="2px" active={loading} className="mb-0" />
        {error
          ? errorMessage()
          : page && (
              <Page
                hasPrev={!!page._links.prev}
                hasNext={!!page._links.next}
                onPrev={onPrev}
                onNext={onNext}
                disabled={loading}
                emptyMessage={
                  <Alert variant="light">
                    {search ? notFoundMessage() : emptyMessage()}
                  </Alert>
                }
              >
                {page.list("members") && (
                  <MemberList
                    members={page.list("members")}
                    showRoles={withRoles ?? roles.length > 1}
                    user={currentUser}
                    isCreator={isCreator}
                    internalState={internalState}
                    onLeave={onLeave}
                    onKick={onKick}
                  />
                )}
              </Page>
            )}
      </div>
    </>
  );
}

export default MemberContainer;
