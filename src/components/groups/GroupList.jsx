import React from "react";
import { Button, Col, Row, OverlayTrigger, Tooltip } from "react-bootstrap";
import { IoKeyOutline, IoListOutline, IoBookOutline } from "react-icons/io5";
import { useHistory } from "react-router-dom";

import "./GroupList.less";
import getContrastColor from "../../util/ContrastColor";

function GroupList({ groups, user, ...props }) {
    const history = useHistory();

    const onClickPropaginatedLink = (e, to) => {
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();

        history.push(to);
    };

    return (
        <Row {...props}>
            {groups.map((group, index) => {
                return (
                    <Col md={4} xs={12} className="mb-4" key={index}>
                        <div className="group-card" onClick={event => onClickPropaginatedLink(event, `/groups/${group.id}`)}>
                            <div
                                className="group-icon"
                                style={{
                                    backgroundColor: group.color ?? "#343a40",
                                    color: getContrastColor(group.color ?? "#343a40"),
                                }}>
                                {group.name[0]}
                            </div>
                            <div className="group-info">
                                <div className="d-flex justify-content-between">
                                    <span className="group-name">{group.name}</span>
                                    {user && (
                                        <div>
                                            {group.creatorId === user.id && (
                                                <OverlayTrigger
                                                    placement="top"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={props => <Tooltip {...props}>Вы являетесь создателем группы</Tooltip>}>
                                                    <IoKeyOutline size={16} />
                                                </OverlayTrigger>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex justify-content-between align-items-center text-muted">
                                    <div>
                                        <small>{group.studentsLimit} участников</small>
                                    </div>
                                    <div>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="px-2"
                                            onClick={event => onClickPropaginatedLink(event, `/groups/${group.id}/tasks`)}>
                                            <IoListOutline size={16} />
                                        </Button>
                                        <Button variant="light" size="sm" className="px-2">
                                            <IoBookOutline size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                );
            })}
        </Row>
    );
}

export default GroupList;