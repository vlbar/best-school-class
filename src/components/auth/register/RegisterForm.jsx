import React, { useEffect, useState } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { ErrorMessage, FastField, Field, Formik } from "formik";
import ProcessBar from "../../process-bar/ProcessBar";
import "./register-form.less";
import axios from "axios";
import { login } from "../../../redux/auth/authActions";
import { useRef } from "react";

function cacheTest(asyncValidate) {
  let _valid = false;
  let _value = "";

  return function (value) {
    if (value !== _value) {
      const response = asyncValidate(value);
      _value = value;
      _valid = response;
      return response;
    }
    return _valid;
  };
}

async function fetchAvailability(email) {
  return await axios.get(`/availability/email/${email}`).then((response) => {
    return response.data;
  });
}

async function register(values) {
  return await axios.post(`/auth/register`, values).then((response) => {
    return response.data;
  });
}

const registerSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email("Неверный email")
    .required("Вы не ввели email!"),
  secondName: yup
    .string()
    .trim()
    .min(3, "Фамилия должна содержать минимум 3 буквы")
    .max(50, "Фамилия не может содержать больше 50 символов")
    .required("Вы не ввели фамилию!"),
  firstName: yup
    .string()
    .trim()
    .min(2, "Имя должно содержать минимум 2 буквы")
    .max(30, "Имя не может содержать больше 30 символов")
    .required("Вы не ввели имя!"),
  middleName: yup
    .string()
    .trim()
    .nullable(true)
    .min(3, "Отчество должно содержать минимум 3 буквы")
    .max(30, "Отчество не может содержать больше 50 символов"),
  password: yup
    .string()
    .min(8, "Пароль должен быть не короче 8 символов!")
    .max(20, "Пароль не может превышать 20 символов!")
    .required("Вы не ввели пароль!"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Пароли должны совпадать!")
    .required("Вы не ввели подтверждение пароля!"),
});

function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [status, setStatus] = useState("idle");
  const emailUniqueTest = useRef(cacheTest(check));
  const dispatch = useDispatch();

  async function check(email) {
    setStatus("loading");
    return fetchAvailability(email)
      .then((data) => {
        setStatus(data.available ? "success" : "error");
        return data.available;
      })
      .catch(() => {
        setStatus("error");
        return false;
      });
  }

  const submit = (values, { setSubmitting }) => {
    if(values.middleName === "") values.middleName = null
    setErrorMessage(null);
    setSubmitting(true);
    register(values)
      .then(() => {
        dispatch(login({ username: values.email, password: values.password }));
      })
      .catch((e) => {
        if (e.response.status === 409)
          setErrorMessage("Email уже используется!");
        else setErrorMessage(e.response.data.message);
        setSubmitting(false);
      });
  };

  return (
    <Container className="register-form">
      <Card>
        <Card.Body>
          <Card.Title>
            <h4 className="text-center mb-4 mt-1">Регистрация</h4>
          </Card.Title>

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
            validateOnChange={false}
            validationSchema={registerSchema}
            onSubmit={(values, { setSubmitting }) => {
              const castedValues = registerSchema.cast(values);
              submit(castedValues, { setSubmitting });
            }}
          >
            {({
              dirty,
              isValid,
              touched,
              isSubmitting,
              submitForm,
              setFieldError,
              errors
            }) => (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isSubmitting) submitForm();
                }}
              >
                <div
                  className="mt-3 mb-3 bg-secondary register-progress"
                >
                  {isSubmitting && <ProcessBar />}
                </div>
                <Form.Group as={Row}>
                  <Form.Label column sm="3">
                    Фамилия
                  </Form.Label>
                  <Col sm="9">
                    <FastField
                      className={
                        "form-control border rounded " +
                        (errors.secondName && touched.secondName
                          ? "border-danger"
                          : touched.secondName
                          ? "border-success"
                          : "")
                      }
                      name="secondName"
                      type="text"
                      placeholder="Введите фамилию"
                      autoComplete="family-name"
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
                      className={
                        "form-control input " +
                        (errors.firstName && touched.firstName
                          ? "border-danger"
                          : touched.firstName
                          ? "border-success"
                          : "")
                      }
                      name="firstName"
                      type="text"
                      placeholder="Введите имя"
                      autoComplete="given-name"
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
                      className={
                        "form-control input " +
                        (errors.middleName && touched.middleName
                          ? "border-danger"
                          : touched.middleName
                          ? "border-success"
                          : "")
                      }
                      name="middleName"
                      type="text"
                      placeholder="Введите отчество"
                      autoComplete="additional-name"
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
                    <div
                      className={
                        "overflow-hidden border rounded email-field " +
                        (status === "error" || (errors.email && touched.email)
                          ? "border-danger"
                          : status === "success"
                          ? "border-success"
                          : "")
                      }
                    >
                      <Field
                        className="form-control"
                        name="email"
                        type="email"
                        placeholder="Введите email"
                        autoComplete="email"
                        disabled={status == "loading"}
                        validate={(email) => {
                          registerSchema
                            .validateAt("email", { email })
                            .then(async () => {
                              emailUniqueTest.current(email).then((result) => {
                                setTimeout(
                                  () =>
                                    setFieldError(
                                      "email",
                                      result ? undefined : "Email занят!"
                                    ),
                                  0
                                );
                              });
                            })
                            .catch(() => {});
                        }}
                      />
                      {status == "loading" && (
                        <div className="register-progress">
                          {" "}
                          <ProcessBar />{" "}
                        </div>
                      )}
                    </div>
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
                      className={
                        "form-control input " +
                        (errors.password && touched.password
                          ? "border-danger"
                          : touched.password
                          ? "border-success"
                          : "")
                      }
                      name="password"
                      type="password"
                      autoComplete="new-password"
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
                  <Col md={{ span: 9, offset: 3 }}>
                    <FastField
                      className={
                        "form-control input " +
                        (errors.passwordConfirmation &&
                        touched.passwordConfirmation
                          ? "border-danger"
                          : touched.passwordConfirmation
                          ? "border-success"
                          : "")
                      }
                      name="passwordConfirmation"
                      type="password"
                      autoComplete="new-password"
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
                    disabled={!(dirty && isValid && status === "success")}
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
