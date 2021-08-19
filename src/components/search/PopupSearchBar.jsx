import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { Form } from "react-bootstrap";
import "./PopupSearch.less";

function PopupSearchBar({ value, onChange, onSubmit, placeholder, ...props }) {
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (focus) {
      inputRef.current.focus();
    }
  }, [focus]);

  function handleChange(e) {
    setQuery(e.target.value);
    onChange && onChange(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit && onSubmit(query);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="w-100 d-flex justify-content-end align-items-center">
        <input
          ref={inputRef}
          className={`popup ${(focus || value) && "visible"}`}
          onChange={handleChange}
          value={value}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={placeholder}
          type="search"
          {...props}
        />
        <i
          className={`fas fa-search popup-button ${
            (focus || value) && "hidden"
          }`}
          onClick={() => setFocus(true)}
        ></i>
      </div>
    </Form>
  );
}

export default PopupSearchBar;
