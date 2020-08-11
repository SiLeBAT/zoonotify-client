import React, { Suspense } from "react";
import * as ReactDOM from "react-dom";
import { StylesProvider } from "@material-ui/core/styles";
import { MainContainerComponent } from "./Main/Main-Container.component";
import "../i18n";

ReactDOM.render(
    <Suspense fallback={<div>Loading</div>}>
        <StylesProvider injectFirst>
            <MainContainerComponent />
        </StylesProvider>
    </Suspense>,
    document.querySelector("#application")
);
