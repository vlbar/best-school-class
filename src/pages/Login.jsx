import React from "react";
import { Container } from "react-bootstrap";

import LoginCard from "../components/auth/LoginCard";
import LoginForm from "../components/auth/login/LoginForm";

function Login() {
    return (
        <Container>
            <LoginCard>
                <LoginForm />
            </LoginCard>
        </Container>
    );
}

export default Login;
