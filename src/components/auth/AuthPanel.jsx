import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth } from "../../redux/auth/authSelectors";
import { Nav, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { logouted } from "../../redux/auth/authReducer";

function AuthPanel() {
  const auth = useSelector(selectAuth);
  const dispatch = useDispatch();

  const handleLogoutSumbit = () => {
    dispatch(logouted());
  };

  if (!auth.isLoggedIn) {
    return (
      <Nav>
        <Button variant="secondary" as={NavLink} to="/login">
          Вход
        </Button>
        <Button variant="secondary" as={NavLink} to="/register">
          Регистрация
        </Button>
      </Nav>
    );
  } else {
    return (
      <Nav>
        <span className="text-light mt-1 mr-2">{auth.username}</span>
        <Button variant="secondary" onClick={handleLogoutSumbit}>
          Выход
        </Button>
      </Nav>
    );
  }
}

export default AuthPanel;
