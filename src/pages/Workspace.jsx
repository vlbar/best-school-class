import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { IoCalendarClearOutline, IoEnterOutline, IoCaretForwardOutline, IoCalendarNumberOutline } from "react-icons/io5";

import "./workspace.less";

function Workspace() {
    return (
        <Container>
            <div className="workspace">
                <Row>
                    <Col md={8}>
                        <Row>
                            <Col md={12}>
                                <div className="button-block">
                                    <div className="block-line">
                                        <div className="budge-icon danger">
                                            <IoCalendarClearOutline size={48} />
                                        </div>
                                        <h3>Нет запланированных занятий</h3>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="button-block">
                                    <div className="block-line">
                                        <div className="budge-icon primary">
                                            <IoCaretForwardOutline size={48} />
                                        </div>
                                        <h3>Начать сейчас</h3>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="button-block">
                                    <div className="block-line">
                                        <div className="budge-icon">
                                            <IoEnterOutline size={48} />
                                        </div>
                                        <h3>Подключиться</h3>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col md={4}>
                        <div className="button-block full-height">
                            <div className="block-line">
                                <div className="budge-icon">
                                    <IoCalendarNumberOutline size={48} />
                                </div>
                                <h3>Запланировать</h3>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </Container>
    );
}

export default Workspace;
