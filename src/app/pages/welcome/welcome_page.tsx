import React from "react";
import { useTranslation } from "react-i18next";
import { LogoCardComponent } from "../../shared/components/logo_card/LogoCard.component";

export function WelcomePage(): JSX.Element {
    const { t } = useTranslation(["HomePage"]);

    return (
        <LogoCardComponent
            title="ZooNotify"
            subtitle={t("Subtitle")}
            text={t("MainText")}
        />
    );
}
