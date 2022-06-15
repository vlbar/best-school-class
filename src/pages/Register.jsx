import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import ConfirmationForm from "../components/auth/confirmation/ConfirmationForm";
import RegisterForm from "../components/auth/register/RegisterForm";
import useQuery from "../components/common/useQuery";
import { addInfoNotification } from "../components/notifications/notifications";
import LoginCard from "./../components/auth/LoginCard";

function Register() {
  const query = useQuery();
  const history = useHistory();

  useEffect(() => {
    const confirmData = query.get("code");
    if (confirmData) {
      let parsedData = atob(confirmData).split(",");
      setStep({
        name: "confirm",
        data: {
          email: parsedData[0],
          confirmCode: parsedData[1],
          onSuccess: onConfirmation,
        },
      });
    }
  }, [query]);

  const [step, setStep] = useState({
    name: "register",
    data: {
      onSuccess: onRegister,
    },
  });

  function onRegister(account) {
    setStep({
      name: "confirm",
      data: {
        email: account.email,
        onSuccess: onConfirmation,
      },
    });
  }

  function onConfirmation() {
    addInfoNotification(
      "Теперь вы можете войти в свой аккаунт, введя ранее указанные данные.",
      "Вы были успешно зарегистрированы!"
    );
    history.replace("/login");
  }

  return (
    <Container>
      <LoginCard>
        {step.name === "register" && <RegisterForm {...step.data} />}
        {step.name === "confirm" && <ConfirmationForm {...step.data} />}
      </LoginCard>
    </Container>
  );
}

export default Register;
