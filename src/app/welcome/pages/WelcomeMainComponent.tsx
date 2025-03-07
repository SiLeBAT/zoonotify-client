import React from "react";
import { LogoCardComponent } from "../../shared/components/logo_card/LogoCard.component";
import { useWelcomePageComponent } from "./welcomeUseCase";
import Markdown from "markdown-to-jsx"; // Import the Markdown component
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";

export function WelcomeMainComponent(): JSX.Element {
    const { model } = useWelcomePageComponent(null);

    return (
        <PageLayoutComponent>
            {/* Add a scrollable container */}
            <div
                style={{
                    maxHeight: "95vh",
                    overflowY: "auto",
                    padding: "1rem",
                }}
            >
                <LogoCardComponent
                    title="ZooNotify"
                    subtitle={model.subtitle}
                    text={
                        <Markdown
                            options={{
                                overrides: {
                                    a: {
                                        props: {
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                        },
                                    },
                                },
                            }}
                        >
                            {model.content}
                        </Markdown>
                    }
                />
            </div>
        </PageLayoutComponent>
    );
}
