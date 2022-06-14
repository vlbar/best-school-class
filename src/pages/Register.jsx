import React from "react";
import { Container } from "react-bootstrap";
import RegisterForm from "../components/auth/register/RegisterForm";
import LoginCard from "./../components/auth/LoginCard";

function Register() {
    return (
        <Container>
            <LoginCard>
                <RegisterForm />
            </LoginCard>
        </Container>
    );
}

export default Register;
