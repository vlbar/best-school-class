import React, { useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { IoTodayOutline, IoAddOutline } from "react-icons/io5";

import "./shedule.less";
import useOutsideClick from "../../util/useOutsideClick";

const SheduleButton = ({ className, ...props }) => {
    const [isPanelShow, setIsPanelShow] = useState(false);
    const menuRef = useRef(null);
    useOutsideClick(menuRef, () => setIsPanelShow(false));

    return (
        <div className={"shedule-container" + (className ? " " + className : "")}>
            <Button variant="light" size="sm" className="mx-1 my-2" onClick={() => setIsPanelShow(!isPanelShow)} {...props}>
                <IoTodayOutline size={21} />
            </Button>
            {isPanelShow && (
                <div className="shedule-menu" ref={menuRef}>
                    <div className="d-flex justify-content-between align-items-center">
                        <span>Расписание на сегодня</span>
                        <IoAddOutline size={18} />
                    </div>
                    <div className="shedule-list">
                        <p className="text-center mt-4 text-muted">
                            <small>Занятия не запланированы</small>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SheduleButton;
