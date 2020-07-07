import React, { Suspense } from 'react';
import * as ReactDOM from 'react-dom';
import { MainLayoutComponent } from "./Main/Main-Layout.component";
import '../i18n';


ReactDOM.render(
    <Suspense fallback={(<div>Loading</div>)}>
        <MainLayoutComponent />
    </Suspense>,
    document.querySelector("#application")
);