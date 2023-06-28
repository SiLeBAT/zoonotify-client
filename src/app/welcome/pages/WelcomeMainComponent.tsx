import React from "react";
import { LogoCardComponent } from "../../shared/components/logo_card/LogoCard.component";
import { useWelcomePageComponent } from "./welcomeUseCase";

export function WelcomeMainComponent(): JSX.Element {
    const { model } = useWelcomePageComponent(null);

    return (
        <LogoCardComponent
            title="ZooNotify"
            subtitle={model.subtitle}
            text={model.content}
        />
    );
}
