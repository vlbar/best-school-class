import React from "react";
import axios from "axios";
import * as yup from "yup";
import { ErrorMessage, FastField, Formik } from "formik";
import { Button, Container, Form } from "react-bootstrap";
import InputField from "../../common/InputField";
import Spinner from "react-spinner-material";

const change_url =
  "https://dss-course-work.herokuapp.com/api/v2/accounts/my/password";

function resetPassword(password, token) {
  return axios.put(
    change_url,
    { password },
    { headers: { Authorization: `Bearer ${token}` }, skipAuthRefresh: true }
  );
}

const passwordResetSchema = yup.object().shape({
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

export default function PasswordResetForm({ onSuccess, token }) {
  function onReset(password, { setSubmitting }) {
    setSubmitting(true);
    resetPassword(password, token)
      .then(onSuccess)
      .finally(() => setSubmitting(false));
  }

  return (
    <Container>
      <h4>Сброс пароля</h4>
      <p className="password-reset-info">
        Введите новый пароль аккаунта. Старый будет сброшен.
      </p>
      <div className="form-wrapper">
        <Formik
          initialValues={{
            password: "",
            passwordConfirmation: "",
          }}
          validateOnChange={false}
          validateOnBlur={true}
          validationSchema={passwordResetSchema}
          onSubmit={(values, { setSubmitting }) => {
            const castedValues = passwordResetSchema.cast(values);
            onReset(castedValues.password, { setSubmitting });
          }}
        >
          {({ dirty, isValid, touched, isSubmitting, submitForm, errors }) => (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isSubmitting) submitForm();
              }}
            >
              <FastField
                className={
                  "input " +
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
                  "input " +
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
                errorMessage={<ErrorMessage name="passwordConfirmation" />}
                component={InputField}
              />
              <Form.Group>
                <Button
                  variant="primary"
                  className="btn-block"
                  type="submit"
                  disabled={!(dirty && isValid)}
                >
                  <div className="w-100 d-flex justify-content-center">
                    {isSubmitting ? (
                      <Spinner radius={21} color="#ECF0F6" stroke={2} />
                    ) : (
                      "Сбросить пароль"
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
