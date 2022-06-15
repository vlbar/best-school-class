import React, { useState } from "react";
import axios from "axios";
import InputField from "../../common/InputField";
import { Button, Container, Form } from "react-bootstrap";
import "./recovery-form.less";
import Spinner from "react-spinner-material";

const tokens_url =
  "https://dss-course-work.herokuapp.com/api/v2/confirmation-tokens";

function send(email) {
  return axios
    .post(tokens_url, {
      email,
      confirmLink: `${window.location.href}?code={code}`,
    })
    .then((response) => response.data);
}

export default function RecoveryForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function onRecovery() {
    setError(null);
    setLoading(true);
    send(email)
      .then((data) => onSuccess?.({ ...data, email }))
      .catch((err) => {
        if (err.response?.status == 404)
          setError(
            "Пользователь с таким именем пользователя или почтой не зарегистрирован в системе"
          );
      })
      .finally(() => setLoading(false));
  }

  return (
    <Container>
      <h4>Восстановление пароля</h4>
      <p className="recovery-info">
        Пожалуйста, введите свое имя пользователя или почту, связанные с
        аккаунтом, и мы отправим вам код для сброса пароля.
      </p>
      <div className="form-wrapper">
        {error && <p className="alert alert-danger text-center">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onRecovery();
          }}
        >
          <InputField
            label="Электронная почта"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="Введите электронную почту..."
          />
          <Form.Group>
            <Button
              variant="primary"
              className="btn-block"
              type="submit"
              disabled={loading || !email}
            >
              <div className="w-100 d-flex justify-content-center">
                {loading ? (
                  <Spinner radius={21} color="#ECF0F6" stroke={2} />
                ) : (
                  "Продолжить"
                )}
              </div>
            </Button>
          </Form.Group>
        </form>
      </div>
    </Container>
  );
}
