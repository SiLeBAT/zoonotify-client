// src/app/microbial_counts/pages/MicrobialCountsPage.component.tsx
import React from "react";
import Markdown from "markdown-to-jsx";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";
import { useMicrobialCountsPageComponent } from "./microbialCountsUseCase";
import { LogoCardComponent } from "../../shared/components/logo_card/LogoCard.component";

export function MicrobialCountsPageComponent(): JSX.Element {
    const { model } = useMicrobialCountsPageComponent(null);

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
                    title={model.title}
                    subtitle=""
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
