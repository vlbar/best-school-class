import React from "react";
import { Button, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import PopupSearchBar from "../../../search/PopupSearchBar";
import WaitingListener from "../../../common/WaitingListener";
import Teacher from "../../../routing/PrivateContentAliases/Teacher";

function MembersHeader({
  title,
  isCreator,
  limit = null,
  current = null,
  onInvite,
  disabled = false,
  internalState = null,
  onQueryChange,
}) {
  return (
    <>
      <Row>
        <Col className="d-flex my-auto">
          <h5 className="my-auto">
            {title}{" "}
            {limit != null && current != null && (
              <span>
                ({current}/{limit})
              </span>
            )}
          </h5>

          {isCreator && (
            <Teacher>
              <div className="py-0 mx-2 my-auto">
                {disabled ? (
                  <OverlayTrigger
                    placement="right"
                    delay={{ show: 250, hide: 400 }}
                    overlay={(props) => (
                      <Tooltip {...props}>
                        Сначала необходимо <u>открыть</u> группу
                      </Tooltip>
                    )}
                  >
                    <Button
                      className="py-0"
                      variant="transparent"
                      style={{ cursor: "not-allowed" }}
                    >
                      <i className="fas fa-link text-muted"></i>
                    </Button>
                  </OverlayTrigger>
                ) : (
                  <Button
                    className="py-0"
                    variant="transparent"
                    onClick={onInvite}
                  >
                    <i className="fas fa-link"></i>
                  </Button>
                )}
              </div>
            </Teacher>
          )}
        </Col>
        <Col sm={5} lg={4} className="my-2">
          <WaitingListener delay={500} onChange={onQueryChange}>
            {({ value: query, onChange }) => {
              return (
                <PopupSearchBar
                  value={query}
                  onChange={onChange}
                  onSubmit={onChange}
                  placeholder="Введите имя.."
                />
              );
            }}
          </WaitingListener>
        </Col>
      </Row>
    </>
  );
}

export default MembersHeader;
