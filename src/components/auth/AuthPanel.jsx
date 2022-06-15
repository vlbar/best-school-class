import React, { useRef, useState, useEffect } from "react";
import { IoChevronDown, IoSettingsOutline, IoExitOutline, IoHelpOutline, IoChevronForwardOutline, IoTodayOutline } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { Nav, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import "./auth-panel.less";
import NotificationButton from "./../profile/Notification";
import SheduleButton from "./../profile/Shedule";
import StatePicker from "../state/StatePicker";
import UserIcon from "../user/UserIcon";
import UserName from "../user/UserName";
import useOutsideClick from "../../util/useOutsideClick";
import { logouted } from "../../redux/auth/authReducer";
import { me, restore } from "../../redux/user/userActions";
import { selectLoggedIn } from "../../redux/auth/authSelectors";
import { selectUser } from "../../redux/user/userSelectors";

function AuthPanel() {
    const isLoggedIn = useSelector(selectLoggedIn);
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const location = useLocation();

    const [isMenuShow, setIsMenuShow] = useState(false);
    const profileMenuRef = useRef(null);
    useOutsideClick(profileMenuRef, closeMenu);

    useEffect(() => {
        if (isLoggedIn) dispatch(me());
        else dispatch(restore());
    }, [isLoggedIn]);

    const handleLogoutSumbit = () => {
        dispatch(logouted());
    };

    function toggleMenu() {
        setIsMenuShow(!isMenuShow);
    }

    function closeMenu() {
        setIsMenuShow(false);
    }

    const onMenuButtonClick = callback => {
        setIsMenuShow(false);
        callback?.();
    };

    if (!isLoggedIn) {
        return (
            <Nav>
                <Link
                    to={{
                        pathname: "/login",
                        state: { from: location.state?.from },
                    }}>
                    <Button className="d-flex align-items-center pr-3">
                        Начать <IoChevronForwardOutline size={18} className="ml-2" />
                    </Button>
                </Link>
            </Nav>
        );
    } else {
        return (
            <div className="profile-panel">
                <div className="d-none d-sm-block">
                    <SheduleButton />
                    <NotificationButton className="mr-2" />
                </div>

                <div className="profile">
                    <div className="mr-3">
                        <div className="username">{user && <UserName user={user} short />}</div>
                        <StatePicker />
                    </div>
                    <div className={"user" + (isMenuShow ? " hover" : "")} onClick={toggleMenu}>
                        <UserIcon email={user?.email} iconSize={40} />
                        <IoChevronDown size={12} />
                    </div>
                    {isMenuShow && (
                        <div className="profile-menu" ref={profileMenuRef}>
                            <div className="m-2">
                                <Button variant="trans" onClick={() => onMenuButtonClick()}>
                                    <IoSettingsOutline size={21} className="mr-2" />
                                    Настройки
                                </Button>
                                <Button variant="trans" onClick={() => onMenuButtonClick()}>
                                    <IoHelpOutline size={21} className="mr-2" />
                                    Помощь
                                </Button>
                                <Button variant="trans" onClick={() => onMenuButtonClick(handleLogoutSumbit)}>
                                    <IoExitOutline size={21} className="mr-2" />
                                    Выйти
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default AuthPanel;
