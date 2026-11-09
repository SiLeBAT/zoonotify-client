import React from "react";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";
import { primaryColor } from "../../shared/style/Style-MainTheme";
import {
    MICROORGANISM_PARAM,
    TYPING_ORGANISMS,
    TypingOrganism,
    resolveTypingOrganism,
} from "./typingOrganisms";

// MUI's styled rather than the emotion css prop: the css prop needs the
// @jsxImportSource pragma, which jest's classic-runtime babel cannot compile.
// Sidebar styling mirrors the AMR page's microorganism selection
// (`.abx-nav-item` in AntibioticResistancePage) so the two pages read alike.
const Page = styled("div")`
    display: flex;
    min-height: 100%;

    @media (max-width: 900px) {
        flex-direction: column;
    }
`;

const Sidebar = styled("nav")`
    width: 450px;
    padding: 2rem;
    box-sizing: border-box;
    background: #fff;

    @media (max-width: 900px) {
        width: 100%;
        padding: 1.25rem;
    }
`;

const NavList = styled("ul")`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const NavItem = styled("button", {
    shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(
    ({ active }) => `
    display: block;
    width: 100%;
    margin-bottom: 1.25rem;
    padding: 1.5rem 2rem 1.5rem 3rem;
    border: 0;
    clip-path: polygon(
        0 0,
        calc(100% - 40px) 0,
        100% 50%,
        calc(100% - 40px) 100%,
        0 100%
    );
    background: ${active ? "#BFE1F2" : "#003663"};
    color: ${active ? "#003663" : "#fff"};
    font-family: inherit;
    font-size: 1.3rem;
    font-weight: bold;
    text-align: left;
    cursor: pointer;

    /* clip-path cuts off an outer outline, so draw the ring inside */
    &:focus-visible {
        outline: 3px solid ${active ? "#003663" : "#fff"};
        outline-offset: -6px;
    }
`
);

const Content = styled("section")`
    flex: 1;
    padding: 3rem;
    box-sizing: border-box;
    color: ${primaryColor};

    @media (max-width: 900px) {
        padding: 1.25rem;
    }
`;

const Title = styled("h1")`
    margin-top: 0;
    font-size: 1.6rem;
`;

function OrganismName({ organism }: { organism: TypingOrganism }): JSX.Element {
    return (
        <>
            {organism.segments.map((segment, index) =>
                segment.italic ? (
                    <i key={index}>{segment.text}</i>
                ) : (
                    <span key={index}>{segment.text}</span>
                )
            )}
        </>
    );
}

export function MicrobialTypingPageComponent(): JSX.Element {
    const { t } = useTranslation(["MicrobialTyping"]);
    const location = useLocation();
    const history = useHistory();

    // The URL is the single source of truth for the selection, so a shared
    // link opens on the same microorganism.
    const selected = resolveTypingOrganism(
        new URLSearchParams(location.search).get(MICROORGANISM_PARAM)
    );

    const handleSelect = (organism: TypingOrganism): void => {
        // Start from the live query so the `lang` parameter is preserved.
        const params = new URLSearchParams(location.search);
        params.set(MICROORGANISM_PARAM, organism.id);
        history.replace({ search: `?${params.toString()}` });
    };

    return (
        <PageLayoutComponent>
            <Page>
                <Sidebar aria-label={t("SelectMicroorganism")}>
                    <NavList>
                        {TYPING_ORGANISMS.map((organism) => {
                            const active = organism.id === selected.id;
                            return (
                                <li key={organism.id}>
                                    <NavItem
                                        type="button"
                                        active={active}
                                        aria-current={active || undefined}
                                        onClick={() => handleSelect(organism)}
                                    >
                                        <OrganismName organism={organism} />
                                    </NavItem>
                                </li>
                            );
                        })}
                    </NavList>
                </Sidebar>

                <Content>
                    <Title>
                        {t("Title")}: <OrganismName organism={selected} />
                    </Title>
                </Content>
            </Page>
        </PageLayoutComponent>
    );
}
