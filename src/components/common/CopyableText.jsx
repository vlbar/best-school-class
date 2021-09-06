import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";

function CopyableText({
  text,
  onCopy,
  disabled = false,
  copyMessage = "Скопировано в буфер обмена!",
  messageClasses = "text-success",
  messageTimeout = 2000,
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef();

  useEffect(() => {
    setCopied(false);
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [text]);

  function refreshTimeout() {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), messageTimeout);
  }

  function handleCopy() {
    onCopy && onCopy();
    navigator.clipboard.writeText(text);
    setCopied(true);

    refreshTimeout();
  }

  return (
    <>
      {copied ? (
        <div className={messageClasses}>{copyMessage}</div>
      ) : (
        <div
          onClick={disabled ? null : handleCopy}
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        >
          {text}
        </div>
      )}
    </>
  );
}

export default CopyableText;
