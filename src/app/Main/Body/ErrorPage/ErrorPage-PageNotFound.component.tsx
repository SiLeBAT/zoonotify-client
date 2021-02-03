import React from "react";
import { useTranslation } from "react-i18next";
import { LogoCardComponent } from "../../../Shared/LogoCard.component";

/**
 * @desc Return an ErrorPage card with the current error status
 * @param {number} errorStatus - status of the api fetch
 * @returns {JSX.Element} - card with ErrorPage content
 */
export function ErrorPagePageNotFoundComponent(props: {
    errorStatus: number;
}): JSX.Element {
    const { t } = useTranslation(["ErrorPage"]);

    const errorSting = props.errorStatus.toString();

    return (
        <LogoCardComponent
            title={errorSting}
            subtitle={t("Subtitle")}
            text={t("MainText")}
        />
    );
}
