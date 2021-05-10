import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import NavigationBar from './components/navbar/NavigationBar';

import Workspace from './pages/Workspace';
import Shedule from './pages/Shedule';
import Answers from './pages/Answers';
import Courses from './pages/Courses';
import Groups from './pages/Groups';
import Login from './pages/Login';

import NotFound from './pages/NotFound';

function App() {  
    return (
        <BrowserRouter>
            <NavigationBar/>
            <Switch>
                <Route path={'/'} exact component={Workspace}/>
                <Route path={'/shedule'} component={Shedule}/>
                <Route path={'/answers'} component={Answers}/>
                <Route path={'/courses'} component={Courses}/>
                <Route path={'/groups'} component={Groups}/>
                <Route path={'/login'} component={Login}/>
                <Route component={NotFound}/>
            </Switch>
        </BrowserRouter>
    );
}

export default App; 