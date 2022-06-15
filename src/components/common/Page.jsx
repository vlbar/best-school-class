import React from "react";

import "./page.less";
import usePageTitle from './../feedback/usePageTitle';

const Page = ({ name, children }) => {
    usePageTitle({ title: name });

    return (
        <div className="page container">
            <h4 className="my-4">{name}</h4>
            {children}
        </div>
    );
};

export default Page;
