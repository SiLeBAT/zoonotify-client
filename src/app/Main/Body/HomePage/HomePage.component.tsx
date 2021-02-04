import React from "react";
import { useTranslation } from "react-i18next";
import { LogoCardComponent } from "../../../Shared/LogoCard.component";

export function HomePageComponent(): JSX.Element {
    const { t } = useTranslation(["HomePage"]);

    return (
        <LogoCardComponent
            title="ZooNotify"
            subtitle={t("Subtitle")}
            text={t("MainText")}
        />
    );
}
