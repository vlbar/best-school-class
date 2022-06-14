import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import "react-notifications-component/dist/theme.css";
import ReactNotification from "react-notifications-component";
import axios from "axios";
import { IoEaselOutline, IoCalendarOutline, IoDocumentOutline, IoFolderOpenOutline, IoPeopleOutline } from "react-icons/io5";
import { LastLocationProvider } from "react-router-last-location";

import Index from "./pages/Index";
import Workspace from "./pages/Workspace";
import Shedule from "./pages/Shedule";
import Answers from "./pages/Answers";
import Courses from "./pages/Courses";
import Task from "./pages/Task";
import Groups from "./pages/Groups";
import Login from "./pages/Login";

import "./static/style/bscstrap.less";
import Footer from "./components/navbar/Footer";
import Group from "./pages/Group";
import Homeworks from "./pages/Homeworks";
import NavigationBar from "./components/navbar/NavigationBar";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/routing/PrivateRoute";
import PublicRoute from "./components/routing/PublicRoute";
import Register from "./pages/Register";
import TaskAnswer from "./pages/TaskAnswer";
import configureAxios from "./config/axios-config";
import { ASSISTANT, STUDENT, TEACHER } from "./redux/state/stateActions";
import { GroupJoinDetails } from "./components/groups/join/GroupJoinDetails";

configureAxios(axios);

function App() {
    return (
        <BrowserRouter>
            <LastLocationProvider>
                <ReactNotification />
                <NavigationBar
                    tabs={[
                        { name: "Главная", icon: IoEaselOutline, to: "/" },
                        { name: "Расписание", icon: IoCalendarOutline, to: "/shedule" },
                        { name: "Задания", icon: IoDocumentOutline, to: "/homeworks" },
                        { name: "Курс", icon: IoFolderOpenOutline, to: "/courses" },
                        { name: "Группы", icon: IoPeopleOutline, to: "/groups" },
                    ]}
                />
                <Switch>
                    <Route path={"/"} exact component={Index} />
                    <PublicRoute path={"/login"} component={Login} />
                    <PublicRoute path={"/register"} component={Register} />
                    <PrivateRoute exact path={"/answers"} component={Answers} allowedStates={[ASSISTANT, TEACHER]} />

                    <PrivateRoute exact path={"/homeworks/"} component={Homeworks} />
                    <PrivateRoute path={"/homeworks/:homeworkId"} component={Homeworks} />
                    <Route exact path={"/homeworks/"} component={Homeworks} />
                    <Route exact path={"/homeworks/:homeworkId"} component={Homeworks} />
                    <PrivateRoute path={"/homeworks/:homeworkId/tasks/:taskId"} component={TaskAnswer} allowedStates={[STUDENT]} />
                    <PrivateRoute exact path={"/courses"} component={Courses} allowedStates={[ASSISTANT, TEACHER]} />
                    <PrivateRoute path={"/courses/:courseId/tasks/:taskId"} component={Task} allowedStates={[ASSISTANT, TEACHER]} />
                    <PrivateRoute path={"/shedule"} component={Shedule} allowedStates={[STUDENT, TEACHER]} />
                    <PrivateRoute path={"/answers"} component={Answers} />
                    <PrivateRoute path={"/courses"} component={Courses} allowedStates={[ASSISTANT, TEACHER]} />
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
                <Footer />
            </LastLocationProvider>
        </BrowserRouter>
    );
}

export default App;
