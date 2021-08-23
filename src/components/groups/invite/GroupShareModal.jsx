import React from "react";
import { Modal } from "react-bootstrap";
import InviteFormContainer from "./InviteFormContainer";

function GroupShareModal({ invitesLink, roles, onClose }) {
  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header className="border-bottom-0" closeButton>
        <Modal.Title>Настройка доступа</Modal.Title>
      </Modal.Header>
      <div className="mt-0 pt-0">
        <InviteFormContainer invitesLink={invitesLink} roles={roles} />
      </div>
    </Modal>
  );
}

export default GroupShareModal;
