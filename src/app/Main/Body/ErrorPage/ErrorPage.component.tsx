import React from "react";
import { useTranslation } from "react-i18next";
import { LogoCardComponent } from "../../../Shared/LogoCard.component";

/**
 * @desc Return an ErrorPage card with the current error status
 * @param {number} errorStatus - status of the api fetch
 * @returns {JSX.Element} - card with ErrorPage content
 */
export function ErrorPageComponent(props: {
    errorStatus: number;
}): JSX.Element {
    const { t } = useTranslation(["ErrorPage"]);

    const errorString = props.errorStatus.toString();

    return (
        <LogoCardComponent
            title={errorString}
            subtitle={t("Subtitle")}
            text={t("MainText")}
        />
    );
}
