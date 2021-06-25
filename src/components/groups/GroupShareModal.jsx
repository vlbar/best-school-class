import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import ProcessBar from "../process-bar/ProcessBar";
import InviteForm from "./InviteForm";

async function closeGroup(groupId) {
  return axios.delete(`/groups/${groupId}/invite`).then((response) => {
    return response.data;
  });
}

async function fetchInvite(groupId) {
  return axios.get(`/groups/${groupId}/invite`).then((response) => {
    return response.data;
  });
}

async function generateInvite(groupId) {
  return axios.post(`/groups/${groupId}/invite`).then((response) => {
    return response.data;
  });
}

function GroupShareModal({ groupId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchInvite(groupId)
      .then((data) => {
        data.isClosed = data.isClosed == "true";
        setInvite(data);
      })
      .finally(setLoading(false));
  }, [groupId]);

  function onGroupClose() {
    setLoading(true);
    closeGroup(groupId)
      .then(() => setInvite({ isClosed: true }))
      .finally(() => setLoading(false));
  }

  function handleGenerate() {
    setLoading(true);
    generateInvite(groupId)
      .then((data) => {
        data.isClosed = data.isClosed == "true";
        setInvite(data);
      })
      .finally(() => setLoading(false));
  }

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Настройка доступа</Modal.Title>
      </Modal.Header>
      {loading && <ProcessBar height="2px" />}
      <Modal.Body>
        {invite && !invite.isClosed && (
          <InviteForm
            code={invite.joinCode}
            onGenerate={handleGenerate}
            loading={loading}
          />
        )}
        {invite && invite.isClosed && (
          <div>
            Группа закрыта. Участники не могут теперь присоединяться. Для того,
            чтобы исправить это, вам необходимо открыть к ней доступ.
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        {invite && !invite.isClosed && (
          <Button variant="danger" onClick={onGroupClose}>
            Закрыть класс
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
        {invite && invite.isClosed && (
          <Button variant="success" onClick={handleGenerate}>
            Открыть доступ
          </Button>
        )}
      </Modal.Footer>
    </>
  );
}

export default GroupShareModal;
