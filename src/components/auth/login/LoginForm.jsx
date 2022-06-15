import React, { useEffect, useState } from "react";
import * as yup from "yup";
import Spinner from "react-spinner-material";
import { Button, Container, Form } from "react-bootstrap";
import { ErrorMessage, FastField, Formik } from "formik";
import { unwrapResult } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import "./login-form.less";
import InputField from "../../common/InputField";
import { login } from "../../../redux/auth/authActions";

const loginSchema = yup.object().shape({
    username: yup.string().required("Вы не ввели имя пользователя!"),
    password: yup.string().required("Вы не ввели пароль!"),
});

function LoginForm() {
    const history = useHistory();
    const [errorMessage, setErrorMessage] = useState(null);
    const { status } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (status == "success") setErrorMessage(null);
    }, [status]);

    const submit = ({ username, password }, { setSubmitting }) => {
        setErrorMessage(null);
        setSubmitting(true);
        dispatch(login({ username, password }))
            .then(unwrapResult)
            .catch(e => {
                if (e.status !== 401) setErrorMessage(e.message);
                else setErrorMessage("Неверное имя пользователя или пароль");
                setSubmitting(false);
            });
    };

    return (
      <Container className="login-form">
        <h4>Войти</h4>
        <p className="text-muted" onClick={() => history.push("/register")}>
          Нет аккаунта? <span className="text-primary text-link">Зарегистрироваться</span>
        </p>
        <div className="form-wrapper">
          {errorMessage && (
            <p className="alert alert-danger text-center">{errorMessage}</p>
          )}
          <Formik
            initialValues={{
              username: "",
              password: "",
            }}
            validationSchema={loginSchema}
            validateOnChange={false}
            onSubmit={submit}
          >
            {({ dirty, isValid, isSubmitting, submitForm }) => (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isSubmitting) submitForm();
                }}
              >
                <Form.Group>
                  <FastField
                    name="username"
                    type="text"
                    label="Имя пользователя"
                    errorMessage={
                      <ErrorMessage name="username" />
                    }
                    component={InputField}
                  />
                </Form.Group>
                <Form.Group>
                  <FastField
                    name="password"
                    type="password"
                    placeholder="Введите пароль"
                    autoComplete="password"
                    label="Пароль"
                    errorMessage={
                      <ErrorMessage name="password" />
                    }
                    component={InputField}
                  />
                </Form.Group>
                <p
                  className="text-right text-muted"
                  onClick={() => history.push("/recovery")}
                >
                  Забыли пароль?{" "}
                  <span className="text-link text-primary">Восстановить</span>
                </p>
                <Form.Group>
                  <Button
                    variant="primary"
                    className="btn-block"
                    type="submit"
                    disabled={isSubmitting || !(dirty && isValid)}
                  >
                    <div className="w-100 d-flex justify-content-center">
                      {status === "loading" ? (
                        <Spinner radius={21} color="#ECF0F6" stroke={2} />
                      ) : (
                        "Войти"
                      )}
                    </div>
                  </Button>
                </Form.Group>
              </Form>
            )}
          </Formik>
        </div>
      </Container>
    );
}

export default LoginForm;
