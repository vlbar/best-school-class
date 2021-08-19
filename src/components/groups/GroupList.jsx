import React from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  Row,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Moment from "react-moment";
import { Link } from "react-router-dom";
import getContrastColor from "../../util/ContrastColor";
import "./GroupList.less";

function GroupList({ groups, user, ...props }) {
  return (
    <Row {...props}>
      {groups.map((group, index) => {
        return (
          <Col md={4} xs={12} className="mb-4" key={index}>
            <Card key={index} className="h-100">
              <Link
                to={`/groups/${group.id}`}
                className="text-break"
                style={{
                  color: getContrastColor(group.color ?? "#343a40"),
                }}
              >
                <Card.Header
                  className="p-4 d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor: group.color ?? "#343a40",
                  }}
                >
                  <div>{group.name}</div>
                  {user && (
                    <div>
                      {group.creatorId === user.id && (
                        <OverlayTrigger
                          placement="top"
                          delay={{ show: 250, hide: 400 }}
                          overlay={(props) => (
                            <Tooltip {...props}>
                              Вы являетесь создателем группы
                            </Tooltip>
                          )}
                        >
                          <i className="fas fa-key p-1"></i>
                        </OverlayTrigger>
                      )}
                    </div>
                  )}
                </Card.Header>
              </Link>
              <Card.Body>
                <Card.Text>
                  <small>Ничего нового :(</small>{" "}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white d-flex justify-content-between">
                <Form.Text muted>
                  <Moment locale="ru" fromNow>
                    {group.membership.joinDate}
                  </Moment>
                </Form.Text>
                <ButtonGroup>
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
  );
}

export default GroupList;
