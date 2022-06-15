import React, { useState } from "react";
import { Button, Modal, Form, Card, InputGroup } from "react-bootstrap";
import { ErrorMessage, FastField, Formik } from "formik";
import * as yup from "yup";
import { CirclePicker } from "react-color";
import ColorPicker from "./ColorPicker";
import ProcessBar from "../../process-bar/ProcessBar";
import { createError } from "../../notifications/notifications";
import "./group-add-modal.less";
import InputField from "../../common/InputField";

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
});

export const GroupAddModal = ({ link, onClose, onSubmit, values }) => {
  const [loading, setLoading] = useState(false);

  function post(values) {
    link
      .post(values, setLoading)
      .then((group) => {
        onSubmit(group);
        onClose();
      })
      .catch((err) => {
        createError("Не удалось добавить группу.", err);
      });
  }

  function put(newValues) {
    link
      .put(newValues, setLoading)
      .then(() => {
        onSubmit(newValues);
        onClose();
      })
      .catch((err) => {
        createError("Не удалось обновить данные группы.", err);
      });
  }

  function handleSubmit(newValues) {
    if (values) put(newValues);
    else post(newValues);
  }

  return (
    <Modal show={true} onHide={onClose} className="header-hidden">
      <Formik
        initialValues={{
          name: values?.name ?? "",
          subject: values?.subject ?? "",
          color: values?.color ?? "#2196f3",
        }}
        validationSchema={groupSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, isValid, dirty, handleChange }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Header
              className="pt-4 pb-3 flex-column"
              style={{ backgroundColor: values.color }}
            >
              <div className="d-flex w-100 justify-content-between align-items-center">
                <FastField
                  autoFocus
                  name="name"
                  className="w-100"
                  placeholder="Название"
                  component={InputField}
                />
                <div className="mx-2 mb-2">
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
              <ErrorMessage
                component="small"
                name="name"
                className="text-danger mt-n3"
              />
            </Modal.Header>
            <ProcessBar height="2px" active={loading} />
            <Modal.Body>
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
                  {values ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
