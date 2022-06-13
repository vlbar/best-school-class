import React from "react";

import "./page.less";

const Page = ({ name, children }) => {
    return (
        <div className="page container">
            <h4 className="my-4">{name}</h4>
            {children}
        </div>
    );
};

export default Page;
