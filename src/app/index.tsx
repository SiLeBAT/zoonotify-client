import React, { Suspense } from 'react';
import * as ReactDOM from 'react-dom';
import { MainPageLayoutComponent } from "./components/MainPage/MainPage-Layout.component";
import {environment} from '../environment';
import '../i18n';


ReactDOM.render(
    <Suspense fallback={(<div>Loading</div>)}>
        <MainPageLayoutComponent name={environment.appName} />
    </Suspense>,
    document.querySelector("#application")
);