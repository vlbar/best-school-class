import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectLoggedIn } from "../../redux/auth/authSelectors";
import { Nav, Button, ButtonGroup } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { logouted } from "../../redux/auth/authReducer";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import MD5 from "md5";

async function fetchUser() {
  return await axios.get(`/users/me`).then((response) => {
    return response.data;
  });
}

function AuthPanel() {
  const isLoggedIn = useSelector(selectLoggedIn);
  const dispatch = useDispatch();
  const [userName, setUserName] = useState(null);
  const [emailHash, setEmailHash] = useState(null);

  useEffect(() => {
    if (isLoggedIn)
      fetchUser().then((data) => {
        const name = `${data.secondName} ${data.firstName[0]}.${data?.middleName[0]}.`;
        setUserName(name);
        setEmailHash(MD5(data.email));
      });
    else {
      setUserName(null);
      setEmailHash(null);
    }
  }, [isLoggedIn]);

  const handleLogoutSumbit = () => {
    dispatch(logouted());
  };

  if (!isLoggedIn) {
    return (
      <Nav>
          <Nav.Link as={NavLink} to="/login">
          Вход
            </Nav.Link>
            <Nav.Link as={NavLink} to="/register">
            Регистрация
            </Nav.Link>
      </Nav>
    );
  } else {
    return (
      <div className="flex flex-baseline">
        <span className="text-light">{userName}</span>
        <img
          className="rounded-circle ml-2 mr-3"
          src={`https://www.gravatar.com/avatar/${emailHash}?s=100&&d=${
            emailHash ? "identicon" : "transparent"
          }&&r=g`}
          style={{ height: "36px" }}
        />
        <Button variant="secondary" onClick={handleLogoutSumbit}>
          Выход
        </Button>
      </div>
    );
  }
}

export default AuthPanel;
