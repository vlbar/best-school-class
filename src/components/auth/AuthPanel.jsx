import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectLoggedIn } from "../../redux/auth/authSelectors";
import { Nav, Button, Row, Col } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import { logouted } from "../../redux/auth/authReducer";
import { useEffect } from "react";
import MD5 from "md5";
import { me, restore } from "../../redux/user/userActions";
import { selectUser } from "../../redux/user/userSelectors";
import User from "../user/User";

function AuthPanel() {
  const isLoggedIn = useSelector(selectLoggedIn);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const location = useLocation();

  useEffect(() => {
    if (isLoggedIn) dispatch(me());
    else dispatch(restore());
  }, [isLoggedIn]);

  const handleLogoutSumbit = () => {
    dispatch(logouted());
  };

  if (!isLoggedIn) {
    return (
      <Nav>
        <Nav.Link
          as={NavLink}
          to={{
            pathname: "/login",
            state: { from: location.state?.from },
          }}
        >
          Вход
        </Nav.Link>
        <Nav.Link
          as={NavLink}
          to={{
            pathname: "/register",
            state: { from: location.state?.from },
          }}
        >
          Регистрация
        </Nav.Link>
      </Nav>
    );
  } else {
    return (
      <Row>
        {user && (
          <Col className="text-light my-auto">
            <User
              user={user}
              iconSize="36"
              iconPlacement="right"
              short
              className="ml-2"
            />
          </Col>
        )}
        <Col className="my-auto" sm="auto">
          <Button
            variant="secondary"
            className="w-100 text-light"
            onClick={handleLogoutSumbit}
          >
            Выйти
          </Button>
        </Col>
      </Row>
    );
  }
}

export default AuthPanel;
