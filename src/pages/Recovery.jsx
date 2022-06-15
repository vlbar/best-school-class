import React, { useState } from "react";
import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import ConfirmationForm from "../components/auth/confirmation/ConfirmationForm";

import LoginCard from "../components/auth/LoginCard";
import PasswordResetForm from "../components/auth/password-reset/PasswordResetForm";
import RecoveryForm from "../components/auth/recovery/RecoveryForm";
import useQuery from "../components/common/useQuery";
import { addInfoNotification } from "../components/notifications/notifications";

function Recovery() {
  const query = useQuery();
  const history = useHistory();

  const [step, setStep] = useState({
    name: "recovery",
    data: {
      onSuccess: onRecovery,
    },
  });

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

  function onRecovery(token) {
    setStep({
      name: "confirm",
      data: {
        email: token.email,
        onSuccess: onConfirmation,
      },
    });
  }

  function onConfirmation(authentication) {
    setTimeout(
      () =>
        setStep({
          name: "reset",
          data: {
            token: authentication.token,
            onSuccess: onReset,
          },
        }),
      0
    );
  }

  function onReset() {
    addInfoNotification(
      "Теперь вы можете войти в свой аккаунт, введя ранее указанные данные.",
      "Пароль был успешно сброшен!"
    );
    history.replace("/login");
  }

  return (
    <Container>
      <LoginCard>
        {step.name === "recovery" && <RecoveryForm {...step.data} />}
        {step.name === "confirm" && <ConfirmationForm {...step.data} />}
        {step.name === "reset" && <PasswordResetForm {...step.data} />}
      </LoginCard>
    </Container>
  );
}

export default Recovery;
