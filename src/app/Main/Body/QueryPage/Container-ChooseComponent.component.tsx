import React from "react";
import { ContainerPageNotFoundComponent } from "../ErrorPage/Container-PageNotFound.component";
import { ContainerLoadingProcessComponent } from "./Container-LoadingProcess.component";
import { QueryPageComponent } from "./QueryPage.component";

export function ChooseComponent(props: {
    status: {
        isolateStatus: number;
        filterStatus: number;
    } | undefined;
    dataIsSet: boolean;
}): JSX.Element {
    if (props.status !== undefined) {
        if (props.status.isolateStatus === 404 || props.status.filterStatus === 404) {
            return <ContainerPageNotFoundComponent />;
        }
        if (
            props.dataIsSet === true &&
            props.status.isolateStatus === 200 &&
            props.status.filterStatus === 200
        ) {
            return <QueryPageComponent />;
        }
    }

    return <ContainerLoadingProcessComponent />;
}
