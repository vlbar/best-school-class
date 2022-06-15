import React from "react";
import { useState } from "react";
import { Dropdown } from "react-bootstrap";

function SortOrder({ orders, variant, initialOrder, onSelect, ...props }) {
  const [currentOrder, setCurrentOrder] = useState(initialOrder ?? Object.keys(orders)[0]);

  function handleSelect(eventKey) {
    onSelect(eventKey);
    setCurrentOrder(eventKey)
  }

  return (
    <Dropdown {...props}>
      <Dropdown.Toggle variant={variant ?? "outline-ligth"} className="w-100 p-0">
        {orders[currentOrder]}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {Object.keys(orders).map((order, index) => {
          return (
            <Dropdown.Item
              onSelect={handleSelect}
              eventKey={order}
              key={index}
            >
              {orders[order]}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default SortOrder;