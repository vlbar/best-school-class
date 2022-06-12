import React from "react";
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import PrivateContent from './../routing/PrivateContent';

const NavbarTab = ({name, icon, ...props}) => {
    return (
        <PrivateContent>
            <Nav.Link as={NavLink} {...props}>
                <div className="icon">{icon}</div>
                <div className="label">{name}</div>
            </Nav.Link>
        </PrivateContent>
    );
};

export default NavbarTab;
