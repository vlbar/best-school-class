import React from "react";
import { Navbar, Nav, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Shedule from "./Shedule";

function Answers({ match }) {
  return (
    <>
      <div>Here's answers</div>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand>Best School Class</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={NavLink} to={`${match.url}/home`}>
              Главная
            </Nav.Link>

            <Nav.Link as={NavLink} to={`${match.url}/schedule`}>
              Расписание
            </Nav.Link>

            <Nav.Link as={NavLink} to={`${match.url}/answers`}>
              Ответы
            </Nav.Link>

            <Nav.Link as={NavLink} to={`${match.url}/courses`}>
              Курс
            </Nav.Link>

            <Nav.Link as={NavLink} to={`${match.url}/groups`}>
              Группы
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Route
        path={`${match.url}/schedule`}
        component={Shedule}
      />
    </>
  );
}

export default Answers;
