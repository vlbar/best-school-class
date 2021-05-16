import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import NavigationBar from "./components/navbar/NavigationBar";

import Workspace from "./pages/Workspace";
import Shedule from "./pages/Shedule";
import Answers from "./pages/Answers";
import Courses from "./pages/Courses";
import Groups from "./pages/Groups";
import Login from "./pages/Login";

import NotFound from "./pages/NotFound";
import AuthenticatedRoute from "./components/routing/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/routing/UnauthenticatedRoute";
import axios from "axios";

const BASE_PATH = "https://dss-course-work.herokuapp.com/api/v1";
axios.defaults.baseURL = BASE_PATH;

function App() {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Switch>
        <Route path={"/"} exact component={Workspace} />
        <AuthenticatedRoute path={"/shedule"} component={Shedule} />
        <AuthenticatedRoute path={"/answers"} component={Answers} />
        <AuthenticatedRoute path={"/courses"} component={Courses} />
        <AuthenticatedRoute path={"/groups"} component={Groups} />
        <UnauthenticatedRoute path={"/login"} component={Login} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
