import React from "react";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { changed } from "../../redux/state/stateReduser";
import { selectState } from "../../redux/state/stateSelector";
import { fromStateToName, types } from "../../redux/state/stateActions";

function StatePicker() {
  const { state } = useSelector(selectState);
  const dispatch = useDispatch();

  function onSelect(eventKey) {
    dispatch(changed(eventKey));
  }

  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-light">
        {fromStateToName(state)}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {Object.keys(types).map((key, index) => {
          return (
            <Dropdown.Item
              onSelect={onSelect}
              key={index}
              eventKey={types[key]}
            >
              {fromStateToName(types[key])}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default StatePicker;
