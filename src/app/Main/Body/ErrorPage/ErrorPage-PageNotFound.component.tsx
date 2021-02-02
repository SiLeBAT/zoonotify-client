import React from "react";
import { useTranslation } from "react-i18next";
import { LogoCardComponent } from "../../../Shared/LogoCard.component";

export function ErrorPagePageNotFoundComponent(): JSX.Element {
    const { t } = useTranslation(["ErrorPage"]);

    return (
        <LogoCardComponent
            title="404"
            subtitle={t("Subtitle")}
            text={t("MainText")}
        />
    );
}
