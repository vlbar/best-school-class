import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import './navigation-bar.less';

function NavigationBar() {
    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand>Best School Class</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
                <Nav.Link as={NavLink} exact to="/">Главная</Nav.Link>
                <Nav.Link as={NavLink} to="/shedule">Расписание</Nav.Link>
                <Nav.Link as={NavLink} to="/answers">Ответы</Nav.Link>
                <Nav.Link as={NavLink} to="/courses">Курс</Nav.Link>
                <Nav.Link as={NavLink} to="/groups">Группы</Nav.Link>
            </Nav>
            <Nav>
                <Button variant="secondary" as={NavLink} to="/login">Вход</Button>
            </Nav>
        </Navbar.Collapse>
        </Navbar>
    );
}

export default NavigationBar;