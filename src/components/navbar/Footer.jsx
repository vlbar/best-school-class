import React from "react";

import "./footer.less";

const Footer = () => {
    return (
        <div className="footer">
            <div className="container">
                <div className="w-100 d-flex justify-content-between">
                    <span>©2020-2022 Baranov Solodov Command. Все права защищены.</span>
                    <a href="#">Правовая информация</a>
                </div>
            </div>
        </div>
    );
};

export default Footer;
