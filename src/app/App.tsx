import React, { Suspense } from 'react';
import * as ReactDOM from 'react-dom';
import { StylesProvider } from '@material-ui/core/styles';
import { MainLayoutComponent } from "./Main/Main-Layout.component";
import '../i18n';




ReactDOM.render(
    <Suspense fallback={(<div>Loading</div>)}>
        <StylesProvider injectFirst>
            <MainLayoutComponent />
        </StylesProvider>       
    </Suspense>,
    document.querySelector("#application")
);