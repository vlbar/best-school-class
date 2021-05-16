import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import './navigation-bar.less';
import Auth from '../auth/Auth';
import PrivateLink from '../routing/PrivateLink';

function NavigationBar() {
    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand>Best School Class</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
                <Nav.Link as={NavLink} exact to="/">Главная</Nav.Link>
                <PrivateLink as={NavLink} to="/shedule">Расписание</PrivateLink> 
                <PrivateLink as={NavLink} to="/answers">Ответы</PrivateLink> 
                <PrivateLink as={NavLink} to="/courses">Курс</PrivateLink> 
                <PrivateLink as={NavLink} to="/groups">Группы</PrivateLink> 
            </Nav>
            <Auth/>
        </Navbar.Collapse>
        </Navbar>
    );
}

export default NavigationBar;