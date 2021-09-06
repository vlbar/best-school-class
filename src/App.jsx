import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import NavigationBar from "./components/navbar/NavigationBar";
import ReactNotification from "react-notifications-component";
import { LastLocationProvider } from "react-router-last-location";
import "react-notifications-component/dist/theme.css";

import Index from "./pages/Index";
import Workspace from "./pages/Workspace";
import Shedule from "./pages/Shedule";
import Answers from "./pages/Answers";
import Courses from "./pages/Courses";
import Task from "./pages/Task";
import Groups from "./pages/Groups";
import Login from "./pages/Login";

import axios from "axios";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/routing/PrivateRoute";
import PublicRoute from "./components/routing/PublicRoute";
import { ASSISTANT, STUDENT, TEACHER } from "./redux/state/stateActions";
import configureAxios from "./config/axios-config";
import Register from "./pages/Register";
import Homeworks from "./pages/Homeworks";
import Group from "./pages/Group";
import { GroupJoinDetails } from "./components/groups/join/GroupJoinDetails";

configureAxios(axios);

function App() {
  return (
    <BrowserRouter>
      <LastLocationProvider>
        <ReactNotification />
        <NavigationBar />
        <Switch>
          <Route path={"/"} exact component={Index}/>
          <PublicRoute path={"/login"} component={Login}/>
          <PublicRoute path={"/register"} component={Register} />
          <PrivateRoute path={"/home"} component={Workspace} />
          <PrivateRoute
          exact
          path={"/answers"}
          component={Answers}
          allowedStates={[ASSISTANT, TEACHER]}
        />
          <PrivateRoute
          exact
          path={"/homeworks/"}
          component={Homeworks}
          allowedStates={[STUDENT]}
        />
        <PrivateRoute
          path={"/homeworks/:homeworkId"}
          component={Homeworks}
          allowedStates={[STUDENT]}
        />
          <PrivateRoute
          path={"/courses/:courseId/tasks/:taskId"}
          component={Task}
          allowedStates={[ASSISTANT, TEACHER]}
        />
          <PrivateRoute
            path={"/shedule"}
            component={Shedule}
            allowedStates={[STUDENT, TEACHER]}
          />
          <PrivateRoute path={"/answers"} component={Answers} />
          <PrivateRoute
            path={"/courses"}
            component={Courses}
            allowedStates={[ASSISTANT, TEACHER]}
          />
          <PrivateRoute exact path={"/groups"} component={Groups} />
          <PrivateRoute path={"/groups/:id"} component={Group} />
          <PrivateRoute
            path={"/invites/:code"}
            children={
              <>
                <Groups />
                <GroupJoinDetails />
              </>
            }
          />
          <Route component={NotFound} />
        </Switch>
      </LastLocationProvider>
    </BrowserRouter>
  );
}

export default App;
