import React from "react";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { changed } from "../../redux/state/stateReduser";
import { selectState } from "../../redux/state/stateSelector";
import {
  fromStateToName,
  HELPER,
  STUDENT,
  TEACHER,
} from "../../redux/state/stateActions";

function StatePicker() {
  const { state } = useSelector(selectState);
  const dispatch = useDispatch();

  function onSelect(eventKey) {
    dispatch(changed(eventKey));
  }

  return (
    <Dropdown className="mr-5">
      <Dropdown.Toggle
        variant="secondary"
        style={{ backgroundColor: "#00000000" }}
      >
        {fromStateToName(state)}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onSelect={onSelect} eventKey={TEACHER}>
          {fromStateToName(TEACHER)}
        </Dropdown.Item>
        <Dropdown.Item onSelect={onSelect} eventKey={STUDENT}>
          {fromStateToName(STUDENT)}
        </Dropdown.Item>
        <Dropdown.Item onSelect={onSelect} eventKey={HELPER}>
          {fromStateToName(HELPER)}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default StatePicker;
