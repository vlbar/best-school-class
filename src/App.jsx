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
import ErrorHandler from "./components/auth/authorize/ErrorHandler";
import axios from "axios";
import Register from "./pages/Register";
import { store } from "./redux/rootReducer";

const BASE_PATH = "http://localhost:8080/bestschoolclass/api/v1";
axios.defaults.baseURL = BASE_PATH;
/*axios.interceptors.response.use(
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
*/
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
        <UnauthenticatedRoute path={"/register"} component={Register} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
