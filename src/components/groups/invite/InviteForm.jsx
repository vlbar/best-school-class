import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
  Form,
  InputGroup,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { createError } from "../../notifications/notifications";
import ProcessBar from "../../process-bar/ProcessBar";
import CopyableText from "../../common/CopyableText";

function InviteForm({ invitesLink, role, isCurrent }) {
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState(undefined);

  useEffect(() => {
    if (isCurrent && invite === undefined) {
      invitesLink
        ?.withPathTale(role)
        .fetch(setLoading)
        .then((data) => {
          setInvite(data);
        })
        .catch((err) => {
          if (err.response.status === 404) setInvite(null);
          else createError("Не удалось загрузить приглашение.", err);
        });
    }
  }, [invitesLink, isCurrent]);

  function handleGenerate() {
    invitesLink
      ?.post({ role }, setLoading)
      .then((data) => {
        setInvite(data);
      })
      .catch((err) =>
        createError("Не удалось создать новое приглашение.", err)
      );
  }

  function handleRemove() {
    invite
      .link()
      ?.remove(setLoading)
      .then(() => {
        setInvite(null);
      })
      .catch((err) => createError("Не удалось удалить приглашение.", err));
  }

  return (
    <>
      {loading && <ProcessBar className="position-absolute" height="2px" />}
      {invite !== undefined && (
        <div className="p-3 h-100">
          {invite !== null && (
            <Form.Group style={{ marginBottom: 0 }}>
              <Form.Label>Код для присоединения: </Form.Label>
              <OverlayTrigger
                placement="auto"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => (
                  <Tooltip {...props}>
                    Распространите этот код или ссылку ниже среди участников,
                    чтобы они могли присоединиться.
                  </Tooltip>
                )}
              >
                <i className="fas fa-question p-1 float-right"></i>
              </OverlayTrigger>
              <InputGroup>
                <div className="form-control bg-light overflow-hidden text-break">
                  <CopyableText text={invite.code} disabled={loading} />
                </div>
                <InputGroup.Append>
                  <Button
                    onClick={handleRemove}
                    variant="danger"
                    disabled={loading}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </InputGroup.Append>
              </InputGroup>

              <Form.Text muted>
                <i>
                  <CopyableText
                    text={`${location.hostname}/invites/${invite.code}`}
                    disabled={loading}
                  />
                </i>
              </Form.Text>

              <Button
                onClick={handleGenerate}
                className="w-100 mt-3"
                disabled={loading}
              >
                <i className="fas fa-redo"></i> Перегенерировать
              </Button>
            </Form.Group>
          )}
          {invite === null && (
            <div className="d-flex flex-column justify-content-between h-100">
              <span className="text-center">
                Похоже, сейчас нет ни одного действующего приглашения для данной
                роли. :(
              </span>
              <br />
              <Button
                className="w-100"
                onClick={handleGenerate}
                disabled={loading}
              >
                <i className="fas fa-plus-circle"></i> Создать
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default InviteForm;
