import React from "react";
import { ErrorPageComponent } from "./ErrorPage.component";
import { LoadingProcessComponent } from "./LoadingProcess.component";

/**
 * @desc Choose which content should be rendered on the query page
 * @param {status: {isolateStatus: number; filterStatus: number;} | undefined } status - object with api fetch status (e.g. 200, 404)
 * @param {boolean} dataIsSet - true if data is set
 * @returns {JSX.Element} - ErrorPage / Loading sign / QueryPage
 */
export function LoadingOrErrorComponent(props: {
    status:
        | {
              isolateStatus: number | undefined;
              isolateCountStatus: number | undefined;
              filterStatus: number | undefined;
          }
    dataIsSet: boolean;
    componentToDisplay: JSX.Element;
}): JSX.Element {
    if (props.status !== undefined) {
        if (props.status.isolateStatus !== 200 && props.status.isolateStatus) {
            return (
                <ErrorPageComponent errorStatus={props.status.isolateStatus} />
            );
        }
        if (props.status.isolateCountStatus !== 200 && props.status.isolateCountStatus !== undefined) {
            return (
                <ErrorPageComponent errorStatus={props.status.isolateCountStatus} />
            );
        }
        if (props.status.filterStatus !== 200 && props.status.filterStatus) {
            return (
                <ErrorPageComponent errorStatus={props.status.filterStatus} />
            );
        }
        if (props.dataIsSet) {
            return props.componentToDisplay;
        }
    }

    return <LoadingProcessComponent />;
}
