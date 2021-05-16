import React, { useEffect, useState } from "react";
import { Form, Button, Card, InputGroup, Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import login from "../redux/auth/authActions";
import * as yup from "yup";
import { ErrorMessage, FastField, Formik } from "formik";
import ProcessBar from "../components/process-bar/ProcessBar";
import { unwrapResult } from "@reduxjs/toolkit";

const loginSchema = yup.object().shape({
  username: yup.string().required("Вы не ввели имя пользователя!"),
  password: yup.string().required("Вы не ввели пароль!"),
});

function Login() {
  const [errorMessage, setErrorMessage] = useState(null);
  const { status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const submit = ({ username, password }) => {
    dispatch(login({ username, password }))
      .then(unwrapResult)
      .catch((e) => setErrorMessage(e.message));
  };

  return (
    <Container className="w-25">
      <Card>
        <Card.Body>
          <Card.Title>
            <h4 className="text-center mb-4 mt-1">Вход</h4>
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
              username: "",
              password: "",
            }}
            validationSchema={loginSchema}
            onSubmit={submit}
          >
            {({ dirty, isValid, errors, submitForm }) => (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitForm();
                }}
              >
                <Form.Group>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>
                        <i className="fa fa-user"></i>
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <FastField
                      className="form-control"
                      name="username"
                      type="text"
                      placeholder="Введите имя пользователя"
                    />
                    <InputGroup>
                      <ErrorMessage
                        component="div"
                        name="username"
                        className="text-danger"
                      />
                    </InputGroup>
                  </InputGroup>
                </Form.Group>
                <Form.Group>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>
                        <i className="fa fa-lock"></i>
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <FastField
                      name="password"
                      type="password"
                      placeholder="Введите пароль"
                      autoComplete="password"
                      className="form-control"
                    />
                    <InputGroup>
                      <ErrorMessage
                        component="div"
                        name="password"
                        className=" text-danger"
                      />
                    </InputGroup>
                  </InputGroup>
                </Form.Group>
                <Form.Group>
                  <Button
                    variant="secondary"
                    className="btn-block"
                    type="submit"
                    disabled={!(dirty && isValid)}
                  >
                    Войти
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

export default Login;
