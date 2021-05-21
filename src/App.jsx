import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import NavigationBar from "./components/navbar/NavigationBar";

import Index from "./pages/Index";
import Workspace from "./pages/Workspace";
import Shedule from "./pages/Shedule";
import Answers from "./pages/Answers";
import Courses from "./pages/Courses";
import Groups from "./pages/Groups";
import Login from "./pages/Login";

import NotFound from "./pages/NotFound";
import ErrorHandler from "./components/auth/authorize/ErrorHandler";
import axios from "axios";
import Register from "./pages/Register";
import { store } from "./redux/rootReducer";
import PrivateRoute from "./components/routing/PrivateRoute";
import PublicRoute from "./components/routing/PublicRoute";
import { HELPER, STUDENT, TEACHER } from "./redux/state/stateActions";

const BASE_PATH = "https://dss-course-work.herokuapp.com/api/v1";
axios.defaults.baseURL = BASE_PATH;
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(
      ErrorHandler(store, error)
    );
  }
);
axios.defaults.headers.common['Authorization'] = `Bearer ${JSON.parse(localStorage.getItem("auth"))?.user.token }`;

function App() {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Switch>
        <Route path={"/"} exact component={Index} />
        <PublicRoute path={"/login"} component={Login} />
        <PrivateRoute path={"/home"} component={Workspace} />
        <PrivateRoute path={"/shedule"} component={Shedule} allowedStates={[STUDENT, TEACHER]}/>
        <PrivateRoute path={"/answers"} component={Answers}/>
        <PrivateRoute path={"/courses"} component={Courses} allowedStates={[HELPER, TEACHER]}/>
        <Route path={"/groups"} component={Groups} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
