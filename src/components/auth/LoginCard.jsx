import React from "react";
import { Col, Row } from "react-bootstrap";

import "./login-card.less";

const LoginCard = ({ children }) => {
    return (
        <div className="login-card">
            <Row>
                <Col md={6} className="card-image-side d-none d-md-block">
                    <div className="side-background">
                        <img src="./src/static/images/svg/login-cumwave.svg" />
                    </div>
                    <div className="card-image">
                        <img src="./src/static/images/app_logo_512.png" className="bsc-logo" /> <h4>Best School Class</h4>
                        <p>Обеспечиваем равные условия единого качественного образования учащихся вне зависимости от места их нахождения</p>
                    </div>
                </Col>
                <Col md={6} className="d-flex">
                    <div className="card-content">{children}</div>
                </Col>
            </Row>
        </div>
    );
};

export default LoginCard;
