import axios from "axios";
import React from "react";
import { useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  Row,
  Modal,
} from "react-bootstrap";
import Moment from "react-moment";
import { TEACHER } from "../../redux/state/stateActions";
import getContrastColor from "../../util/ContrastColor";
import PrivateContent from "../routing/PrivateContent";
import { GroupAddModal } from "./create/GroupAddModal";
import "./GroupList.less";
import GroupShareModal from "./GroupShareModal";

async function updateGroup(data, groupId) {
  return axios.put(`/groups/${groupId}`, data).then((response) => {
    return response.data;
  });
}

function GroupList({ groups, onGroupEdit, ...props }) {
  const [isUpdateModalShow, setIsUpdateModalShow] = useState(false);
  const [isShareModalShow, setIsShareModalShow] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);

  function onClose() {
    setIsUpdateModalShow(false);
    setIsShareModalShow(false);
  }

  function onSubmit(values) {
    updateGroup(values, currentGroup.id)
      .then(() => onGroupEdit(values, currentGroup.id))
      .finally(() => setIsUpdateModalShow(false));
  }

  function handleGroupEdit(group) {
    setCurrentGroup(group);
    setIsUpdateModalShow(true);
  }

  function onShareClick(group) {
    setCurrentGroup(group);
    setIsShareModalShow(true);
  }

  return (
    <>
      {isUpdateModalShow && (
        <Modal show={isUpdateModalShow} onHide={onClose}>
          <GroupAddModal
            onClose={onClose}
            onSubmit={onSubmit}
            values={currentGroup}
          />
        </Modal>
      )}
      {isShareModalShow && (
        <Modal show={isShareModalShow} onHide={onClose}>
          <GroupShareModal
            onClose={onClose}
            code={currentGroup.joinCode}
            groupId={currentGroup.id}
          />
        </Modal>
      )}
      <Row {...props}>
        {groups.map((group, index) => {
          return (
            <Col md={4} xs={12} className="mb-4" key={index}>
              <Card>
                <Card.Header
                  className="p-4"
                  style={{
                    backgroundColor: group.color ?? "#343a40",
                    color: getContrastColor(group.color ?? "#343a40"),
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>{group.name} {group.subject && <small>({group.subject})</small>}</div>
                    <PrivateContent allowedStates={[TEACHER]}>
                      <Button
                        className="mx-2 bg-transparent border-0 p-0"
                        onClick={() => handleGroupEdit(group)}
                      >
                        <i
                          className="fas fa-pen"
                          style={{
                            color: getContrastColor(group.color ?? "#343a40"),
                          }}
                        ></i>
                      </Button>
                    </PrivateContent>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Card.Text>
                    <small>Ничего нового :(</small>{" "}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white d-flex justify-content-between">
                  <Form.Text muted>
                    <Moment locale="ru" fromNow>
                      {group.createdAt}
                    </Moment>
                  </Form.Text>
                  <ButtonGroup>
                    <PrivateContent allowedStates={[TEACHER]}>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => {
                          onShareClick(group);
                        }}
                      >
                        <i className="fas fa-link"></i>
                      </Button>
                    </PrivateContent>
                    <Button variant="outline-dark" size="sm">
                      <i className="fas fa-tasks"></i>
                    </Button>
                    <Button variant="outline-dark" size="sm">
                      <i className="fas fa-book"></i>
                    </Button>
                  </ButtonGroup>
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
}

export default GroupList;
