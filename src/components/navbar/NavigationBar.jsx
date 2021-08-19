import React from "react";
import { Navbar, Nav, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./navigation-bar.less";
import AuthPanel from "../auth/AuthPanel";
import PrivateContent from "../routing/PrivateContent";
import StatePicker from "../state/StatePicker";
import { ASSISTANT, STUDENT, TEACHER } from "../../redux/state/stateActions";
import PublicContent from "../routing/PublicContent";

function NavigationBar() {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Navbar.Brand>Best School Class</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          <PublicContent>
            <Nav.Link as={NavLink} exact to="/">
              Главная
            </Nav.Link>
          </PublicContent>
          <PrivateContent>
            <Nav.Link as={NavLink} to="/home">
              Главная
            </Nav.Link>
          </PrivateContent>
          <PrivateContent allowedStates={[STUDENT, TEACHER]}>
            <Nav.Link as={NavLink} to="/shedule">
              Расписание
            </Nav.Link>
          </PrivateContent>
          <PrivateContent>
            <Nav.Link as={NavLink} to="/answers">
              Ответы
            </Nav.Link>
          </PrivateContent>
          <PrivateContent allowedStates={[ASSISTANT, TEACHER]}>
            <Nav.Link as={NavLink} to="/courses">
              Курс
            </Nav.Link>
          </PrivateContent>
          <PrivateContent>
            <Nav.Link as={NavLink} to="/groups">
              Группы
            </Nav.Link>
          </PrivateContent>
        </Nav>
        <PrivateContent>
          <div className="mr-5">
            <StatePicker />
          </div>
        </PrivateContent>
        <AuthPanel />
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavigationBar;
