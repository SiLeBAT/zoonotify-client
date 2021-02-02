import React from "react";
import { ErrorPagePageNotFoundComponent } from "../ErrorPage/ErrorPage-PageNotFound.component";
import { QueryPageComponent } from "./QueryPage.component";
import { LoadingProcessComponent } from "../../../Shared/LoadingProcess.component";

export function ChooseComponent(props: {
    status: {
        isolateStatus: number;
        filterStatus: number;
    } | undefined;
    dataIsSet: boolean;
}): JSX.Element {
    if (props.status !== undefined) {
        if (props.status.isolateStatus === 404 || props.status.filterStatus === 404) {
            return <ErrorPagePageNotFoundComponent />;
        }
        if (
            props.dataIsSet === true &&
            props.status.isolateStatus === 200 &&
            props.status.filterStatus === 200
        ) {
            return <QueryPageComponent />;
        }
    }

    return <LoadingProcessComponent />;
}
