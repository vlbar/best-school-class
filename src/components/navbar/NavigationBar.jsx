import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";

import "./navigation-bar.less";
import AuthPanel from "../auth/AuthPanel";
import PrivateContent from "../routing/PrivateContent";
import useWindowDimensions from "./../../util/useWindowDimensions";

function NavigationBar({ tabs }) {
    const { width } = useWindowDimensions();
    const isLarge = width > 992;

    return (
        <React.Fragment>
            <Navbar collapseOnSelect expand="lg" bg="trans" variant="light">
                <Link to="/">
                    <Navbar.Brand>
                        <img alt="" src="./src/static/images/app_logo_64.png" width="40" height="40" className="d-inline-block align-top" />
                        <span className="d-none d-sm-inline-block">Best School Class</span>
                    </Navbar.Brand>
                </Link>
                {isLarge && (
                    <Nav className="mr-auto">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <PrivateContent key={tab.name}>
                                    <Nav.Link as={NavLink} exact to={tab.to}>
                                        <div className="icon">
                                            <Icon size={20} />
                                        </div>
                                        <div className="label">{tab.name}</div>
                                    </Nav.Link>
                                </PrivateContent>
                            );
                        })}
                    </Nav>
                )}
                <AuthPanel />
            </Navbar>
            {!isLarge && (
                <div className="navbar-bottom">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <PrivateContent key={tab.name}>
                                <Nav.Link as={NavLink} exact to={tab.to}>
                                    <div className="icon">
                                        <Icon size={30} />
                                    </div>
                                    <div className="label">{tab.name}</div>
                                </Nav.Link>
                            </PrivateContent>
                        );
                    })}
                </div>
            )}
        </React.Fragment>
    );
}

export default NavigationBar;
