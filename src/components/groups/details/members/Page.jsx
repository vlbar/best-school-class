import React from "react";
import { Button, ListGroup } from "react-bootstrap";

function Page({
  hasNext,
  hasPrev,
  onNext,
  onPrev,
  disabled,
  children,
  emptyMessage,
}) {
  if (children)
    return (
      <>
        <ListGroup horizontal className="w-100">
          {hasPrev && (
            <ListGroup.Item
              className="p-0"
              style={{ width: "40px" }}
              disabled={disabled}
            >
              <Button
                className="page-link w-100 h-100 m-0 border-0"
                variant="transparent"
                onClick={onPrev}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-chevron-compact-left"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.224 1.553a.5.5 0 0 1 .223.67L6.56 8l2.888 5.776a.5.5 0 1 1-.894.448l-3-6a.5.5 0 0 1 0-.448l3-6a.5.5 0 0 1 .67-.223z"
                  />
                </svg>
              </Button>
            </ListGroup.Item>
          )}

          {children && (
            <ListGroup.Item className="p-0 flex-fill">
              {children}
            </ListGroup.Item>
          )}

          {hasNext && (
            <ListGroup.Item
              className="p-0"
              style={{ width: "40px" }}
              disabled={disabled}
            >
              <Button
                className="page-link w-100 h-100 m-0 border-0"
                variant="transparent"
                onClick={onNext}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-chevron-compact-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.776 1.553a.5.5 0 0 1 .671.223l3 6a.5.5 0 0 1 0 .448l-3 6a.5.5 0 1 1-.894-.448L9.44 8 6.553 2.224a.5.5 0 0 1 .223-.671z"
                  />
                </svg>
              </Button>
            </ListGroup.Item>
          )}
        </ListGroup>
      </>
    );
  else
    return (
      <div className="text-center">
        {emptyMessage ?? "Похоже, тут пока никого нет :("}
      </div>
    );
}

export default Page;
