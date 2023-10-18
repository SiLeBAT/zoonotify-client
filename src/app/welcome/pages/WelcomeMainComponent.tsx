import React from "react";
import { LogoCardComponent } from "../../shared/components/logo_card/LogoCard.component";
import { useWelcomePageComponent } from "./welcomeUseCase";
import Markdown from "markdown-to-jsx"; // Import the Markdown component

export function WelcomeMainComponent(): JSX.Element {
    const { model } = useWelcomePageComponent(null);

    return (
        <LogoCardComponent
            title="ZooNotify"
            subtitle={model.subtitle}
            // Render Markdown content using the Markdown component
            text={<Markdown>{model.content}</Markdown>}
        />
    );
}
