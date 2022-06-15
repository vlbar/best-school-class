import React, { useRef, useState } from "react";
import * as yup from "yup";
import Spinner from "react-spinner-material";
import axios from "axios";
import { ErrorMessage, FastField, Field, Formik } from "formik";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import "./register-form.less";
import InputField from "./../../common/InputField";

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
  return await axios
    .post(`/auth/register`, {
      ...values,
      confirmLink: `${window.location.href}?code={code}`,
    })
    .then((response) => {
      return response.data;
    });
}

function InputFieldWithSpin({ spinned, ...props }) {
  return (
    <InputField
      {...props}
      right={
        <div className="field-spinner">
          <Spinner radius={21} color="#298AE5" stroke={2} visible={spinned} />
        </div>
      }
    />
  );
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

function RegisterForm({ onSuccess }) {
  const history = useHistory();
  const [errorMessage, setErrorMessage] = useState(null);
  const [status, setStatus] = useState("idle");
  const emailUniqueTest = useRef(cacheTest(check));

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
    if (values.middleName === "") values.middleName = null;
    setErrorMessage(null);
    setSubmitting(true);
    register(values)
      .then(onSuccess)
      .catch((e) => {
        if (e.response.status === 409)
          setErrorMessage("Email уже используется!");
        else setErrorMessage(e.response.data.message);
        setSubmitting(false);
      });
  };

  return (
    <Container className="register-form">
      <h4>Регистрация</h4>
      <p className="text-muted" onClick={() => history.push("/login")}>
        Уже есть аккаунт? <span className="text-primary text-link">Войти</span>
      </p>
      <div className="form-wrapper">
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
          validateOnBlur={true}
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
            errors,
          }) => (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isSubmitting) submitForm();
              }}
            >
              <Row>
                <Col md={6}>
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
                    autoComplete="given-name"
                    label="Имя"
                    errorMessage={
                      <ErrorMessage name="firstName" />
                    }
                    component={InputField}
                  />
                </Col>
                <Col md={6}>
                  <FastField
                    className={
                      "form-control input " +
                      (errors.secondName && touched.secondName
                        ? "border-danger"
                        : touched.secondName
                        ? "border-success"
                        : "")
                    }
                    name="secondName"
                    type="text"
                    autoComplete="family-name"
                    label="Фамилия"
                    errorMessage={
                      <ErrorMessage name="secondName" />
                    }
                    component={InputField}
                  />
                </Col>
              </Row>
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
                autoComplete="additional-name"
                label="Отчество"
                errorMessage={
                  <ErrorMessage name="middleName" />
                }
                component={InputField}
              />
              <Field
                className="form-control"
                name="email"
                type="email"
                placeholder="Введите электронную почту..."
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
                label="Электроная почта"
                spinned={status === "loading"}
                errorMessage={<ErrorMessage name="email" />}
                component={InputFieldWithSpin}
              />
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
                label="Пароль"
                errorMessage={<ErrorMessage name="password" />}
                component={InputField}
              />
              <FastField
                className={
                  "form-control input " +
                  (errors.passwordConfirmation && touched.passwordConfirmation
                    ? "border-danger"
                    : touched.passwordConfirmation
                    ? "border-success"
                    : "")
                }
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                label="Подтверждение пароля"
                errorMessage={
                  <ErrorMessage name="passwordConfirmation" />
                }
                component={InputField}
              />
              <Form.Group>
                <Button
                  variant="primary"
                  className="btn-block"
                  type="submit"
                  disabled={!(dirty && isValid && status === "success")}
                >
                  <div className="w-100 d-flex justify-content-center">
                    {isSubmitting ? (
                      <Spinner radius={21} color="#ECF0F6" stroke={2} />
                    ) : (
                      "Зарегистрироваться"
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

export default RegisterForm;
