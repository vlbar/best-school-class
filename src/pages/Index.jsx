import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import { IoChevronForwardOutline, IoLockClosedOutline } from "react-icons/io5";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import "./index.less";
import Workspace from "./Workspace";
import { selectAuth } from './../redux/auth/authSelectors';

function Index() {
    const history = useHistory();
    const { isLoggedIn } = useSelector(selectAuth);

    if (isLoggedIn) return <Workspace />
    return (
        <React.Fragment>
            <div className="background">
                <img src="./src/static/images/svg/cumwave3.svg" style={{ bottom: "8vw" }} />
                <img src="./src/static/images/svg/cumwave2.svg" style={{ bottom: "4vw" }} />
                <img src="./src/static/images/svg/cumwave1.svg" />
            </div>
            <div className="container">
                <Row className="header">
                    <Col md={6} className="d-flex justify-content-center">
                        <div>
                            <img src="./src/static/images/bsc-on-laptop-and-phone.png" />
                        </div>
                    </Col>
                    <Col md={6}>
                        <h5>BESH SCHOOL CLASS</h5>
                        <h3>Мы поможем сделать Ваш класс Лучшим!</h3>
                        <p>
                            Целью проекта является предоставление единой платформы дистанционного обучения, обеспечивающей более тесное взаимодействие
                            между участниками образовательного процесса.
                        </p>
                        <Button className="mr-2 pr-3 mb-2">
                            Создать временное занятие <IoChevronForwardOutline size={18} />
                        </Button>
                        <Button variant="secondary" className="mb-2" onClick={() => history.push("/register")}>
                            Регистрация
                        </Button>
                        <p className="other-way" onClick={() => history.push("/login")}>
                            Уже есть аккаунт? <span className="text-primary">Войти</span>
                        </p>
                    </Col>
                </Row>
                <div className="main-features">
                    <h3>Что поможет Вам сделать класс лучшим?</h3>
                    <Row>
                        <Col md={4}>
                            <div className="image-holder">
                                <img src="./src/static/images/svg/chat.svg" />
                            </div>

                            <h4>Трансляции</h4>
                            <p>
                                Ведите онлайн-занятие или присоединяйтесь к ним с любого устройства, также просто будто все находятся в одном кабинете
                            </p>
                        </Col>
                        <Col md={4}>
                            <div className="image-holder">
                                <img src="./src/static/images/svg/management.svg" />
                            </div>
                            <h4>База знаний</h4>
                            <p>Погрузитесь в мир удобного и эффективного ведения учебного плана и создания заданий с совместным доступом</p>
                        </Col>
                        <Col md={4}>
                            <div className="image-holder">
                                <img src="./src/static/images/svg/conversation.svg" />
                            </div>
                            <h4>Интервью</h4>
                            <p>Мгновенно отвечайте, задавайте обсуждайте или отслеживайте вопросы по домашнему заданию в индивидуальном чате</p>
                        </Col>
                    </Row>
                </div>
            </div>
            <div className="feature-line">
                <div className="container">
                    <h3>Ощутите себя на одном уроке с Вашим лучшим классом</h3>
                    <p>Вам сложно собраться вместе? Ваши ученики запутались в постоянных ссылках на конференции? Мы решим Ваши проблемы</p>
                </div>
            </div>
            <div className="container">
                <div className="other-features">
                    <h3>Почему с нами так легко?</h3>
                    <p>
                        Для начала работы нужно просто перенести Ваши материалы на платформу, пригласить учников и вы сразу ощутите их прогресс в
                        обучении
                    </p>
                    <Row>
                        <Col md={6}>
                            <div className="feature-block">
                                <h4>Формируйте класс</h4>
                                <p>Создавайте класс и приглайшайте участников на различные роли</p>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="feature-block">
                                <h4>Планируйте</h4>
                                <p>Планируйте и легко обновляйте расписание занятий, чтобы вовремя собраться вместе</p>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="feature-block">
                                <h4>Контролируйте</h4>
                                <p>Создвайте задания различных форматов, назначайте баллы и управляйте ответами на них</p>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="feature-block">
                                <h4>Отслеживайте</h4>
                                <p>В реальном времени оценивайте успешность подготовки и формируйте удобную отченость</p>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="feature-block">
                                <h4>Руководите</h4>
                                <p>Вызывайте учеников, запускайте таймер, управляйте их микрофонами и экраном</p>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="feature-block">
                                <h4>Делитесь идеями</h4>
                                <p>Обменивайтесь с учатниками занятия документами, фото, презентациями и файлами без ограничений</p>
                            </div>
                        </Col>
                    </Row>
                    <h5>И не стоит забывать, что</h5>
                </div>
                <div className="best-block">
                    <Row>
                        <Col md={3}>
                            <div className="d-flex justify-content-center">
                                <IoLockClosedOutline size={150} />
                            </div>
                        </Col>
                        <Col md={9}>
                            <div>
                                <h4>
                                    Best School Class <br />
                                    заботится о Вашей безопасности
                                </h4>
                                <p>
                                    Трафик между клиентом и сервером зашифрован. Преподватель сам определяет список учеников группы, и присоединиться
                                    к группе или занятию могут только те, кто имеет приглашение.
                                </p>
                            </div>
                        </Col>
                    </Row>
                </div>
                <center>
                    <Button className="mt-3 mb-5" onClick={() => history.push("/register")}>
                        Узнать все возможности <IoChevronForwardOutline size={18} />
                    </Button>
                </center>
            </div>
            <div className="feature-line">
                <div className="container">
                    <h3>Обучайте активно. Интерактивно.</h3>
                    <p>Откройте для себя новые способы подачи учебного материала и возможности коммуникации с Вашим классом </p>
                </div>
            </div>
            <div className="container">
                <Row className="mobile-block">
                    <Col md={6}>
                        <h4>Оставайтесь всегда на связи</h4>
                        <p>
                            Вы можите открывать платформу с любых устройств: ноутбуков, планшетов и смартфонов. А с приложением для смартофонов можно
                            всегда иметь все материалы под рукой.
                        </p>
                        <div className="stores">
                            <a href="https://github.com/vlbar/best-school-class-mobile/releases" target="_blank">
                                <img src="./src/static/images/google-play.png" alt="gugol-ple" />
                            </a>
                            <a href="https://github.com/vlbar/best-school-class-mobile/releases" target="_blank">
                                <img src="./src/static/images/app-store.png" alt="app-store" />
                            </a>
                        </div>
                    </Col>
                    <Col md={6} className="d-flex justify-content-center">
                        <div>
                            <img src="./src/static/images/bsc-mobile-version.png" />
                        </div>
                    </Col>
                </Row>
            </div>
        </React.Fragment>
    );
}

export default Index;
