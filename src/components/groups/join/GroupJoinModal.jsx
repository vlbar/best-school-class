import React, { useState } from "react";
import { Button, Modal, Form, Card, Badge, InputGroup } from "react-bootstrap";
import { ErrorMessage, FastField, Formik } from "formik";
import * as yup from "yup";
import ProcessBar from "../../process-bar/ProcessBar";
import axios from "axios";

async function fetchInvite(joinCode) {
  return axios.get(`/invites/${joinCode}`).then((response) => {
    return response.data;
  });
}

const joinCodeSchema = yup.object().shape({
  joinCode: yup.string().trim().required("Не введен код для присоединения"),
});

export const GroupJoinModal = ({ onClose, onJoin, onNext }) => {
  const [loading, setLoading] = useState(false);
  const submitHandle = (values) => {
    setLoading(true);
    fetchInvite(values.joinCode)
      .then((data) => {
        data.isClosed = data.isClosed == "true"
        if (onNext) onNext({ data, onJoin });
      })
  };

  return (
    <Formik
      initialValues={{
        joinCode: "",
      }}
      validationSchema={joinCodeSchema}
      onSubmit={submitHandle}
    >
      {({ handleSubmit, isValid, dirty }) => (
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Присоединение к группе</Modal.Title>
          </Modal.Header>
          {loading && <ProcessBar height="2px" />}
          <Modal.Body>
            <Form.Label>Код для присоединения</Form.Label>
            <FastField
              name="joinCode"
              className="form-control"
              placeholder="Код"
            />
            <Form.Text muted>
              <ErrorMessage
                component="div"
                name="joinCode"
                className="text-danger"
              />
            </Form.Text>
          </Modal.Body>
          <Modal.Footer>
            <div className="float-right">
              <Button variant="secondary" onClick={onClose}>
                Закрыть
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!(isValid && dirty)}
                className="ml-2"
              >
                Найти
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      )}
    </Formik>
  );
};
