import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MainPageLayoutComponent } from "./components/MainPage/MainPage-Layout.component";
import {environment} from '../environment';

ReactDOM.render(
    <MainPageLayoutComponent name={environment.appName} />,
    document.querySelector("#application")
);
