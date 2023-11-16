import React from "react";
import { useTranslation } from "react-i18next";
import { LogoCardComponent } from "../../shared/components/logo_card/LogoCard.component";

/**
 * @desc Return an ErrorPage card with the current error status
 * @param errorStatus - status of the api fetch
 * @returns {JSX.Element} - card with ErrorPage content
 */
export function ErrorPageComponent(props: {
    errorStatus: number;
}): JSX.Element {
    const { t } = useTranslation(["ErrorPage"]);

    const errorString = props.errorStatus.toString();

    let errorText = "GeneralErrorText";
    let errorTitle = "GeneralErrorTitle";

    if (props.errorStatus === 404) {
        errorText = "PageNotFoundText";
        errorTitle = "PageNotFoundTitle";
    }

    return (
        <LogoCardComponent
            title={errorString}
            subtitle={t(errorTitle)}
            text={t(errorText)}
        />
    );
}
