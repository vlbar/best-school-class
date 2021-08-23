import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
  Button,
  Col,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { createError } from "../../../notifications/notifications";
import ProcessBar from "../../../process-bar/ProcessBar";
import "./MemberSettings.less";

function MemberSettingsModal({ group, onGroupEdit, onClose }) {
  const [closed, setClosed] = useState(group.closed);
  const [limit, setLimit] = useState(group.studentsLimit);

  const didMountRef = useRef(false);

  const [closedLoading, setClosedLoading] = useState(false);
  const [limitLoading, setLimitLoading] = useState(false);

  function updateClosed(closed) {
    group
      .link("groupClosed")
      .put({ closed: closed }, setClosedLoading)
      .catch((err) =>
        createError("Не удалось обновить состояние группы.", err)
      );
  }

  function updateLimit(limit) {
    group
      .link("groupLimit")
      .put({ studentsLimit: limit }, setLimitLoading)
      .catch((err) =>
        createError("Не удалось обновить лимит студентов группы.", err)
      );
  }

  function onLimitChange(newLimit) {
    if (newLimit >= group.studentsCount) setLimit(newLimit);
  }

  function onApply() {
    if (group.closed != closed) updateClosed(closed);
    if (group.studentsLimit != limit) updateLimit(limit);
    if (group.closed === closed && group.studentsLimit === limit) onClose();
  }

  useEffect(() => {
    if (didMountRef.current) {
      if (!closedLoading && !limitLoading) {
        onGroupEdit({ ...group, studentsLimit: limit, closed: closed });
        onClose();
      }
    } else didMountRef.current = true;
  }, [closedLoading, limitLoading]);

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Настройки участников</Modal.Title>
      </Modal.Header>
      <ProcessBar height={2} active={closedLoading || limitLoading} />
      <Modal.Body>
        <div>
          <div className="text-center">
            <label className="switch">
              <input type="checkbox" checked={!closed} readOnly />
              <span
                className="slider round"
                onClick={() => setClosed(!closed)}
              ></span>
            </label>

            <div className="my-auto">
              Группа{" "}
              <OverlayTrigger
                placement="left"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => (
                  <Tooltip {...props}>
                    {closed
                      ? "Группа закрыта, теперь в неё не может никто вступать."
                      : "Группа открыта и в неё могут вступить все, кто имеет приглашения."}
                  </Tooltip>
                )}
              >
                <u>{closed ? "закрыта" : "открыта"}</u>
              </OverlayTrigger>
            </div>
          </div>

          <div className="w-100 mb-3">
            <div>
              <div className="d-flex justify-content-between align-items-center">
                <Form.Text>Лимит учеников: {limit}</Form.Text>
                <OverlayTrigger
                  placement="auto"
                  delay={{ show: 250, hide: 400 }}
                  overlay={(props) => (
                    <Tooltip {...props}>
                      Если вам заранее известно итоговое количество учеников
                      группы, вы можете ограничить их количество, чтобы в неё не
                      вступило больше людей, чем планировалось.
                    </Tooltip>
                  )}
                >
                  <i className="fas fa-question p-1"></i>
                </OverlayTrigger>
              </div>
              <Form.Control
                type="range"
                name="studentsLimit"
                min={1}
                max={50}
                onChange={(e) => onLimitChange(e.target.value)}
                value={limit}
                custom
                disabled={closed}
              />
            </div>
          </div>
        </div>

        <Button
          className="w-100"
          onClick={onApply}
          disabled={closedLoading || limitLoading}
        >
          Применить
        </Button>
      </Modal.Body>
    </Modal>
  );
}

export default MemberSettingsModal;
