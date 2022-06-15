import React, { useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { IoNotificationsOutline } from "react-icons/io5";

import "./notification.less";
import useOutsideClick from "../../util/useOutsideClick";

const NotificationButton = ({ className, ...props }) => {
    const [isPanelShow, setIsPanelShow] = useState(false);
    const menuRef = useRef(null);
    useOutsideClick(menuRef, () => setIsPanelShow(false));

    return (
        <div className={"notification-container" + (className ? " " + className : "")}>
            <Button variant="trans" size="sm" className="mx-1 my-2" onClick={() => setIsPanelShow(!isPanelShow)} {...props}>
                <IoNotificationsOutline size={21} />
            </Button>
            {isPanelShow && (
                <div className="notification-menu" ref={menuRef}>
                    <div className="notification-header">Уведомления</div>
                    <div className="notification-list">
                        <p className="text-center mt-4 text-muted">
                            <small>Список уведомлений пуст</small>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationButton;
