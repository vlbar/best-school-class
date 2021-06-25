import React, { useState } from "react";
import { Button, Modal, Form, Card, Badge, InputGroup } from "react-bootstrap";
import { ErrorMessage, FastField, Formik } from "formik";
import * as yup from "yup";
import { CirclePicker } from "react-color";
import axios from "axios";
import ColorPicker from "./ColorPicker";

const groupSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Слишком короткое название")
    .max(50, "Слишком длинное название")
    .required("Не введено название группы"),
  subject: yup
    .string()
    .trim()
    .min(2, "Слишком короткое название предмета")
    .max(30, "Слишком длинное название предмета"),
  studentsLimit: yup
    .number()
    .min(1, "Лимит группы не может быть меньше 1")
    .max(50, "Лимит группы не может превышать 50"),
});

export const GroupAddModal = ({ onClose, onSubmit, values, onNext }) => {
  const submitHandle = (values) => {
    onSubmit(values).then((data) => {
      if (onNext) onNext({ code: data.joinCode, groupId: data.id });
    });
  };

  return (
    <>
      <Modal.Body className="p-0">
        <Formik
          initialValues={{
            name: values?.name ?? "",
            subject: values?.subject ?? "",
            studentsLimit: values?.studentsLimit ?? 50,
            color: values?.color ?? "#343a40",
          }}
          validationSchema={groupSchema}
          onSubmit={submitHandle}
        >
          {({ handleSubmit, values, isValid, dirty, handleChange }) => (
            <Form onSubmit={handleSubmit}>
              <Card className="h-100">
                <Card.Header
                  className="p-4"
                  style={{ backgroundColor: values.color }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <InputGroup>
                      <FastField
                        name="name"
                        className="form-control"
                        placeholder="Название"
                      />
                      <FastField
                        name="subject"
                        className="form-control"
                        placeholder="Предмет"
                      />
                    </InputGroup>
                    <div className="mx-2">
                      <ColorPicker
                        onColorChange={(e) => {
                          handleChange({
                            target: { name: "color", value: e.hex },
                          });
                        }}
                        initialColor={values.color}
                        name="color"
                      />
                    </div>
                  </div>
                  <Form.Text muted>
                    <ErrorMessage
                      component="div"
                      name="name"
                      className="text-danger"
                    />
                    <ErrorMessage
                      component="div"
                      name="subject"
                      className="text-danger"
                    />
                  </Form.Text>
                </Card.Header>
                <Card.Body>
                  <CirclePicker
                    color={values.color}
                    onChange={(e) => {
                      handleChange({ target: { name: "color", value: e.hex } });
                    }}
                    className="m-auto w-100"
                    circleSize={32}
                    circleSpacing={18}
                    name="color"
                  />
                  <Form.Text className="float-left" muted>
                    Ограничение количества учеников: {values.studentsLimit}
                  </Form.Text>
                  <FastField
                    type="range"
                    name="studentsLimit"
                    min="1"
                    max="50"
                    as={Form.Control}
                    custom 
                  />
                  <Form.Text muted>
                    <ErrorMessage
                      component="div"
                      name="studentsLimit"
                      className="text-danger"
                    />
                  </Form.Text>
                </Card.Body>
                <Card.Footer>
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
                      {values ? "Сохранить" : "Добавить"}
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </>
  );
};
