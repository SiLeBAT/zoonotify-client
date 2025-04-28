// src/app/antimicrobial/pages/AntimicrobialPageComponent.tsx
import React from "react";
import Markdown from "markdown-to-jsx";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";
import { useAntimicrobialPageComponent } from "./antimicrobialUseCase";
import { LogoCardComponent } from "../../shared/components/logo_card/LogoCard.component";

export function AntimicrobialPageComponent(): JSX.Element {
    const { model } = useAntimicrobialPageComponent(null);

    return (
        <PageLayoutComponent>
            <div
                style={{
                    maxHeight: "95vh",
                    overflowY: "auto",
                    padding: "1rem",
                }}
            >
                <LogoCardComponent
                    // your CMS title
                    title={model.title}
                    // if you don’t have a subtitle, just pass an empty string
                    subtitle=""
                    // render the CMS description as Markdown inside the card
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
                            {model.description}
                        </Markdown>
                    }
                />
            </div>
        </PageLayoutComponent>
    );
}
