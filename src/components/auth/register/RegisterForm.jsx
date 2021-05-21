import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Card,
  InputGroup,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import login from "../../../redux/auth/authActions";
import * as yup from "yup";
import { ErrorMessage, FastField, Formik } from "formik";
import ProcessBar from "../../process-bar/ProcessBar";
import { unwrapResult } from "@reduxjs/toolkit";
import "./register-form.less";

const registerSchema = yup.object().shape({
  email: yup.string().email("Неверный email").required("Вы не ввели email!"),
  secondName: yup
    .string()
    .min(3, "Фамилия должна содержать минимум 3 буквы")
    .max(50, "Фамилия не может содержать больше 50 символов")
    .required("Вы не ввели фамилию!"),
  firstName: yup
    .string()
    .min(2, "Имя должно содержать минимум 3 буквы")
    .max(30, "Имя не может содержать больше 30 символов")
    .required("Вы не ввели имя!"),
  middleName: yup
    .string()
    .min(3, "Отчество должно содержать минимум 3 буквы")
    .max(50, "Отчество не может содержать больше 50 символов"),
  password: yup.string().required("Вы не ввели пароль!"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Пароли должны совпадать!")
    .required("Вы не ввели подтверждение пароля!"),
});

function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState(null);
  const { status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status == "success") setErrorMessage(null);
  }, [status]);

  const submit = (values, { setSubmitting }) => {
    /*setErrorMessage(null);
    setSubmitting(true);
    dispatch(login({ username, password }))
      .then(unwrapResult)
      .catch((e) => {
        if (e.status !== 401) setErrorMessage(e.message);
        else setErrorMessage("Неверное имя пользователя или пароль");
        setSubmitting(false);
      });*/
  };

  return (
    <Container className="register-form">
      <Card>
        <Card.Body>
          <Card.Title>
            <h4 className="text-center mb-4 mt-1">Регистрация</h4>
          </Card.Title>
          <div
            className="mt-3 mb-3 bg-secondary"
            style={{ height: 1.5 + "px" }}
          >
            {status == "loading" && <ProcessBar />}
          </div>

          {errorMessage && (
            <p className="alert alert-danger text-center">{errorMessage}</p>
          )}
          <Formik
            initialValues={{
              email: "",
              secondName: "",
              firstName: "",
              middleName: "",
              password: "",
              passwordConfirmation: "",
            }}
            validationSchema={registerSchema}
            onSubmit={submit}
          >
            {({ dirty, isValid, isSubmitting, submitForm }) => (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isSubmitting) submitForm();
                }}
              >
                <Form.Group as={Row}>
                  <Form.Label column sm="3">
                    Фамилия
                  </Form.Label>
                  <Col sm="9">
                    <FastField
                      className="form-control"
                      name="secondName"
                      type="text"
                      placeholder="Введите фамилию"
                      autocomplete="family-name"
                    />
                    <Form.Text muted>
                      <ErrorMessage
                        component="span"
                        name="secondName"
                        className="text-danger"
                      />
                    </Form.Text>
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label column sm="3">
                    Имя
                  </Form.Label>
                  <Col sm="9">
                    <FastField
                      className="form-control"
                      name="firstName"
                      type="text"
                      placeholder="Введите имя"
                      autocomplete="given-name"
                    />
                    <Form.Text id="firstNameHelp" muted>
                      <ErrorMessage
                        component="div"
                        name="firstName"
                        className="text-danger"
                      />
                    </Form.Text>
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label column sm="3">
                    Отчество
                  </Form.Label>
                  <Col sm="9">
                    <FastField
                      className="form-control"
                      name="middleName"
                      type="text"
                      placeholder="Введите отвество"
                      autocomplete="additional-name"
                    />
                    <Form.Text id="middleNameHelp" muted>
                      <ErrorMessage
                        component="div"
                        name="middleName"
                        className="text-danger"
                      />
                    </Form.Text>
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label column sm="3">
                    Email
                  </Form.Label>
                  <Col sm="9">
                    <FastField
                      className="form-control"
                      name="email"
                      type="email"
                      placeholder="Введите email"
                      autocomplete="email" 
                    />
                    <Form.Text id="emailHelp" muted>
                      <ErrorMessage
                        component="div"
                        name="email"
                        className="text-danger"
                      />
                    </Form.Text>
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label column sm="3">
                    Пароль
                  </Form.Label>
                  <Col sm="9">
                    <FastField
                      className="form-control"
                      name="password"
                      type="password"
                      autocomplete="new-password"
                      placeholder="Введите пароль"
                    />
                    <Form.Text id="passwordHelp" muted>
                      <ErrorMessage
                        component="div"
                        name="password"
                        className="text-danger"
                      />
                    </Form.Text>
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Col md={{ span: 9, offset: 3 }} >
                    <FastField
                      className="form-control"
                      name="passwordConfirmation"
                      type="password"
                      autocomplete="new-password"
                      placeholder="Введите подтверждение пароля"
                    />
                    <Form.Text id="passwordHelp" muted>
                      <ErrorMessage
                        component="div"
                        name="passwordConfirmation"
                        className="text-danger"
                      />
                    </Form.Text>
                  </Col>
                </Form.Group>
                <Form.Group>
                  <Button
                    variant="secondary"
                    className="btn-block"
                    type="submit"
                    disabled={!(dirty && isValid)}
                  >
                    Зарегистрироваться
                  </Button>
                </Form.Group>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RegisterForm;
