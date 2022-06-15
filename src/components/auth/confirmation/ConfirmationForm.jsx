import React, { useEffect, useState, useRef } from "react";
import ReactInputVerificationCode from "react-input-verification-code";
import { Button, Container } from "react-bootstrap";
import axios from "axios";
import moment from "moment";
import "./confirmation-form.less";
import { IoTimerOutline } from "react-icons/io5";
import Spinner from "react-spinner-material";

const tokens_url =
  "https://dss-course-work.herokuapp.com/api/v2/confirmation-tokens";
const authorize_url =
  "https://dss-course-work.herokuapp.com/api/v2/auth/tokens?confirmationToken";

function send(email) {
  return axios
    .post(tokens_url, {
      email,
      confirmLink: `${window.location.origin}${window.location.pathname}?code={code}`,
    })
    .then((response) => response.data);
}

function authorize(email, code) {
  return axios
    .post(
      authorize_url,
      { email, code },
      {
        skipAuthRefresh: true,
      }
    )
    .then((response) => response.data);
}

const CELL_COUNT = 6;
const RESEND_TIMEOUT = 120;

export default function ConfirmationForm({ email, confirmCode, onSuccess }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(confirmCode ?? "");

  const [resendTime, setResendTime] = useState(
    moment()
      .add(RESEND_TIMEOUT, "second")
      .subtract(new Date())
      .format("mm:ss")
  );
  const sendTime = useRef(new Date());
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (
        sendTime.current.getTime() +
          RESEND_TIMEOUT * 1000 -
          new Date().getTime() <
        0
      )
        setResendTime(null);
      else
        setResendTime(
          moment(sendTime.current)
            .add(RESEND_TIMEOUT, "second")
            .subtract(new Date())
            .format("mm:ss")
        );
    }, 500);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (code.length == CELL_COUNT && code[CELL_COUNT - 1] != "·")
      onConfirm(code);
  }, [code]);

  function onResend() {
    if (resendTime) return;

    setLoading(true);
    send(email)
      .then(() => {
        sendTime.current = new Date();
      })
      .catch((err) => {
        if (err.response?.status == 404)
          setError(
            "Пользователь с таким именем пользователя или почтой не зарегистрирован в системе"
          );
        console(err);
      })
      .finally(() => setLoading(false));
  }

  function onConfirm(code) {
    setLoading(true);
    authorize(email, code)
      .then(onSuccess)
      .catch((err) => {
        if (err.response?.status == 401) setError("Неверный код");
        else if (err.response?.status == 404) {
          setError("Код подтверждения истёк. Запросите код повторно");
          sendTime.current = new Date().getTime() - RESEND_TIMEOUT * 1000;
        }

        setCode("");
      })
      .finally(() => setLoading(false));
  }

  return (
    <Container className="confirmation-form">
      <h4>Подтверждение</h4>
      <p className="confirmation-info">
        Для продолжения, пожалуйста, введите код подтверждения, отправленный на
        указанный адрес электронной почты: {email}
      </p>
      {error && <p className="alert alert-danger text-center">{error}</p>}
      <div className="custom-styles d-flex justify-content-center form-group">
        <ReactInputVerificationCode
          length={CELL_COUNT}
          autoFocus
          value={code}
          onChange={setCode}
        />
      </div>
      <div onClick={onResend} disabled={resendTime}>
        <p className="text-muted text-center my-4">
          {resendTime && (
            <span className="align-center">
              <IoTimerOutline size={17} />
              <span className="align-middle">
                {" "}
                {resendTime}
                {"  "}
              </span>
            </span>
          )}
          <span
            className={
              resendTime ? "text-muted align-middle" : "text-link text-primary"
            }
          >
            Отправить код повторно
          </span>
        </p>
      </div>
      <div className="btn-block">
        <Button
          variant="primary"
          className="btn-block"
          type="submit"
          disabled={loading || code.length < 6}
        >
          <div className="w-100 d-flex justify-content-center">
            {loading ? (
              <Spinner radius={21} color="#ECF0F6" stroke={2} />
            ) : (
              "Продолжить"
            )}
          </div>
        </Button>
      </div>
    </Container>
  );
}
