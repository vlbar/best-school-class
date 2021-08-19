import React, { useState } from "react";
import { useEffect } from "react";
import { Alert, Button, Modal } from "react-bootstrap";
import { useHistory, useParams } from "react-router-dom";
import { RedirectWithoutLastLocation } from "react-router-last-location";
import {
  fromStateToIcon,
  fromStateToName,
} from "../../../redux/state/stateActions";
import Resource from "../../../util/Hateoas/Resource";
import { createError } from "../../notifications/notifications";
import ProcessBar from "../../process-bar/ProcessBar";
import GroupInfo from "../details/GroupInfo";
import GroupMembersPreview from "./GroupMembersPreview";

export const GroupJoinDetails = ({ onClose, onJoin }) => {
  const history = useHistory();
  const { code } = useParams();

  const [accepted, setAccepted] = useState(false);

  const [errorMessage, setErrorMessage] = useState(null);
  const [invite, setInvite] = useState(null);
  const [group, setGroup] = useState(null);
  const [creator, setCreator] = useState(null);
  const [memberPage, setMemberPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [creatorLoading, setCreatorLoading] = useState(false);
  const [memberPageLoading, setMemberPageLoading] = useState(false);

  useEffect(() => {
    Resource.basedOnHref(`/invites/${code}`)
      .link()
      .fetch(setLoading)
      .then((data) => {
        setInvite(data);
      })
      .catch((err) => {
        if (err.response?.status === 404)
          setErrorMessage(
            "Не удалось загрузить приглашение. Приглашение по данному коду не найдено."
          );
        else if (err.response?.status === 422)
          setErrorMessage(err.response.data.message);
        else
          setErrorMessage(
            "Не удалось загрузить приглашение. Повторите попытку позже."
          );
      });
  }, []);

  useEffect(() => {
    if (invite)
      invite
        .link("group")
        .fetch(setGroupLoading)
        .then((data) => {
          setGroup(data);
        })
        .catch((err) =>
          createError("Не удалось загрузить данные группы.", err)
        );
  }, [invite]);

  useEffect(() => {
    if (group)
      group
        .link("creator")
        .fetch(setCreatorLoading)
        .then((data) => {
          setCreator(data);
        })
        .catch((err) =>
          createError("Не удалось загрузить создателя группы.", err)
        );
  }, [group]);

  useEffect(() => {
    if (group)
      group
        .link("groupMembers")
        .fill("size", 5)
        .fetch(setMemberPageLoading)
        .then((data) => {
          setMemberPage(data);
        })
        .catch((err) =>
          createError("Не удалось загрузить участников группы.", err)
        );
  }, [group]);

  function onJoin() {
    invite
      .link("accept")
      .post({}, setLoading)
      .then(() => {
        setAccepted(true);
      })
      .catch((err) => {
        if (err.response?.status === 422)
          setErrorMessage(err.response.data.message);
        else createError("Не удалось принять приглашение.", err);
      });
  }

  function handleClose() {
    if (onClose) onClose();
    else history.replace("/groups");
  }

  if (accepted)
    return <RedirectWithoutLastLocation to={`/groups/${invite.groupId}`} />;
  else
    return (
      <Modal show={true} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Приглашение</Modal.Title>
        </Modal.Header>
        <ProcessBar
          active={
            loading || groupLoading || creatorLoading || memberPageLoading
          }
          height="2px"
        />
        <Modal.Body>
          {errorMessage && (
            <div>
              <Alert className="text-center" variant="light">
                {errorMessage}
              </Alert>
              <Button
                onClick={handleClose}
                variant="secondary"
                className="w-100"
              >
                Закрыть
              </Button>
            </div>
          )}
          {!errorMessage && invite && (
            <div>
              <div>
                {group && creator && (
                  <div className="text-center">
                    <i>
                      {creator.secondName} {creator.firstName}{" "}
                      {creator.middleName ?? ""}
                    </i>{" "}
                    приглашает <i>Вас</i> в группу{" "}
                    <div
                      className="d-flex flex-column align-items-center mx-auto"
                      style={{ width: "80%" }}
                    >
                      <div className="my-1">
                        <GroupInfo
                          initGroup={group}
                          isCreator={false}
                          showYear={false}
                        />
                      </div>
                      {memberPage && (
                        <div className="my-1">
                          <GroupMembersPreview
                            previewedMembers={memberPage.list("members")}
                            total={memberPage.page.totalElements}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="my-2">
                <div className="text-center">Приглашение на роль: </div>
                <div className="text-center text-info">
                  <i className={fromStateToIcon(invite.role.toLowerCase())}></i>{" "}
                  {fromStateToName(invite.role.toLowerCase())}
                </div>
              </div>
              <Button className="w-100" onClick={onJoin} disabled={loading}>
                Принять
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    );
};
