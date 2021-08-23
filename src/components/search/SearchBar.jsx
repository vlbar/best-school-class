import React from "react";
import { useState } from "react";
import { Button, Form, InputGroup, FormControl } from "react-bootstrap";

function SearchBar({
  onChange,
  onSubmit,
  onEmpty,
  buttonVariant,
  borderColor,
  placeholder,
  ...props
}) {
  const [query, setQuery] = useState("");

  function handleChange(e) {
    setQuery(e.target.value);
    if (onChange) onChange(e.target.value);
    if (e.target.value.trim().length === 0 && onEmpty) onEmpty();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (onSubmit) onSubmit(query);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group {...props}>
        <InputGroup>
          <FormControl
            placeholder={placeholder ?? ""}
            onChange={handleChange}
            value={query}
            style={{ borderColor: borderColor ?? "" }}
            type="search"
          />
          <InputGroup.Append>
            <Button variant={buttonVariant ?? "primary"} type="submit">
              <i className="fas fa-search"></i>
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </Form>
  );
}

export default SearchBar;
