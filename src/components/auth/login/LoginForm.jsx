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
            <p className="other-way" onClick={() => history.push("/register")}>
                Нет аккаунта? <span className="text-primary">Зарегистрироваться</span>
            </p>
            <div className="form-wrapper">
                {errorMessage && <p className="alert alert-danger text-center">{errorMessage}</p>}
                <Formik
                    initialValues={{
                        username: "",
                        password: "",
                    }}
                    validationSchema={loginSchema}
                    onSubmit={submit}>
                    {({ dirty, isValid, isSubmitting, submitForm }) => (
                        <Form
                            onSubmit={e => {
                                e.preventDefault();
                                if (!isSubmitting) submitForm();
                            }}>
                            <Form.Group>
                                <FastField className="form-control" name="username" type="text" label="Имя пользователя" component={InputField} />
                                <Form.Text muted>
                                    <ErrorMessage component="div" name="username" className="text-danger" />
                                </Form.Text>
                            </Form.Group>
                            <Form.Group>
                                <FastField
                                    name="password"
                                    type="password"
                                    placeholder="Введите пароль"
                                    autoComplete="password"
                                    className="form-control"
                                    label="Пароль"
                                    component={InputField}
                                />
                                <Form.Text muted>
                                    <ErrorMessage component="div" name="password" className=" text-danger" />
                                </Form.Text>
                            </Form.Group>
                            <Form.Group>
                                <Button variant="primary" className="btn-block" type="submit" disabled={isSubmitting || !(dirty && isValid)}>
                                    <div className="w-100 d-flex justify-content-center">
                                        {status === "loading" ? <Spinner radius={21} color="#ECF0F6" stroke={2} /> : "Войти"}
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
