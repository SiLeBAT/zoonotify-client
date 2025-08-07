import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";
import {
    Typography,
    Dialog,
    DialogTitle,
    DialogActions,
    Button,
} from "@mui/material";
import { TrendDetails } from "./TrendDetails";
import i18next from "i18next";
import { SubstanceDetail } from "./SubstanceDetail";

// --- These constants stay the same ---
const ORGANISMS = [
    "E. coli",
    "Campylobacter spp.",
    "Salmonella spp.",
    "MRSA",
    "STEC",
    "Enterococcus spp.",
];

const italicWords: string[] = [
    "Salmonella",
    "coli",
    "jejuni",
    "faecalis",
    "faecium",
    "coli",
    "E.",
    "C.",
    "Enterococcus",
    "Campylobacter",
];

interface WordObject {
    text: string;
    italic: boolean;
}

const formatMicroorganismNameArray = (
    microName: string | null | undefined
): WordObject[] => {
    if (!microName) {
        console.warn("Received null or undefined microorganism name");
        return [];
    }
    const words = microName
        .split(/([-\s])/)
        .filter((part: string) => part.length > 0);

    return words.map((word: string) => {
        if (word.trim() === "" || word === "-") {
            return { text: word, italic: false };
        }
        const italic = italicWords.some((italicWord: string) =>
            word.toLowerCase().includes(italicWord.toLowerCase())
        );
        return { text: word, italic };
    });
};

export interface FormattedMicroorganismNameProps {
    microName: string | null | undefined;
    isBreadcrumb?: boolean;
    fontSize?: string | number;
    fontWeight?: "normal" | "bold" | number;
}

export const FormattedMicroorganismName: React.FC<
    FormattedMicroorganismNameProps
> = ({
    microName,
    isBreadcrumb = false,
    fontWeight,
    fontSize, // <--- accept prop
}) => {
    const words = formatMicroorganismNameArray(microName);
    return (
        <Typography
            component="span"
            style={{
                fontWeight: fontWeight ?? (isBreadcrumb ? "normal" : "bold"),
                fontSize: fontSize ?? (isBreadcrumb ? "1.4rem" : undefined),
            }}
        >
            {words.map((wordObj: WordObject, index: number) => (
                <React.Fragment key={index}>
                    {wordObj.italic ? <i>{wordObj.text}</i> : wordObj.text}{" "}
                </React.Fragment>
            ))}
        </Typography>
    );
};

// --- URL Deep Linking helpers ---

function updateUrl(
    selectedOrg: string,
    view: "main" | "trend" | "substance"
): void {
    const params = new URLSearchParams(window.location.search);
    params.set("microorganism", selectedOrg);
    params.set("view", view);
    params.set("lang", i18next.language);
    window.history.replaceState(null, "", `?${params.toString()}`);
}

function readStateFromUrl(): {
    selectedOrg: string;
    view: "main" | "trend" | "substance";
} {
    const params = new URLSearchParams(window.location.search);
    const orgParam = params.get("microorganism");
    const selectedOrg =
        typeof orgParam === "string" && ORGANISMS.includes(orgParam)
            ? orgParam
            : ORGANISMS[0];
    const view =
        (params.get("view") as "main" | "trend" | "substance") || "main";
    return { selectedOrg, view };
}

// --- Breadcrumb component ---
function Breadcrumb({
    t,
    selectedOrg,
    view,
    handleShowMain,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: any;
    selectedOrg: string;
    view: "main" | "trend" | "substance";
    handleShowMain: () => void;
}): JSX.Element {
    return (
        <div className="abx-breadcrumb">
            <span
                style={{
                    textDecoration: "underline",
                    cursor: "pointer",
                }}
                onClick={handleShowMain}
            >
                {t("AntibioticResistance")}
            </span>
            {" / "}
            <span
                style={{
                    textDecoration: "underline",
                    cursor: "pointer",
                }}
                onClick={handleShowMain}
            >
                <FormattedMicroorganismName
                    microName={selectedOrg}
                    isBreadcrumb={true}
                />
            </span>
            {view === "trend" && <> / {t("Trend")}</>}
            {view === "substance" && <> / {t("Substans")}</>}
        </div>
    );
}

// --- Main component ---
export function AntibioticResistancePageComponent(): JSX.Element {
    const { t } = useTranslation(["Antibiotic"]);
    const [state, setState] = useState<{
        selectedOrg: string;
        view: "main" | "trend" | "substance";
    }>(() => readStateFromUrl());
    const { selectedOrg, view } = state;

    // State for "Coming soon" modal
    const [comingSoonOpen, setComingSoonOpen] = useState(false);

    // On mount: sync state from URL (deep link support)
    useEffect((): void => {
        const parsed = readStateFromUrl();
        setState(parsed);
    }, []);

    // Whenever selectedOrg or view changes, update URL
    useEffect((): void => {
        updateUrl(selectedOrg, view);
    }, [selectedOrg, view]);

    // Whenever language changes, update URL as well!
    useEffect((): void => {
        updateUrl(selectedOrg, view);
    }, [selectedOrg, view, i18next.language]);

    // Handle org selection from sidebar
    const handleOrgSelect = (org: string): void => {
        setState({ selectedOrg: org, view: "main" });
    };

    // Go to trend view
    const handleTrendClick = (): void => {
        setState((prev) => ({
            ...prev,
            view: "trend",
        }));
    };

    // Go to substance detail view
    const handleSubstanceClick = (): void => {
        setState((prev) => ({
            ...prev,
            view: "substance",
        }));
    };

    // Go back to organism selection view (breadcrumb)
    const handleShowMain = (): void => {
        setState((prev) => ({
            ...prev,
            view: "main",
        }));
    };

    // Handle coming soon click
    const handleComingSoon = (): void => {
        setComingSoonOpen(true);
    };

    // Handle closing the modal
    const handleCloseComingSoon = (): void => {
        setComingSoonOpen(false);
    };

    return (
        <>
            <style>{`
        .abx-page {
          display: flex;
          min-height: 120vh;
        }

        .abx-sidebar {
          width: 450px;
          padding: 2rem;
          background: #fff;
          box-sizing: border-box;
        }

        .abx-nav {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .abx-nav-item {
          position: relative;
          clip-path: polygon(
            0 0,
            calc(100% - 40px) 0,
            100% 50%,
            calc(100% - 40px) 100%,
            0 100%
          );
          background: #003663;
          color: #fff;
          font-size: 1.3rem;
          font-weight: bold;
          padding: 1.5rem 2rem 1.5rem 3rem;
          margin-bottom: 1.25rem;
          cursor: pointer;
        }

        .abx-active {
          background: #BFE1F2;
          color: #003663;
        }

        .abx-content {
          flex: 1;
          padding: 3rem;
          box-sizing: border-box;
        }

        .abx-breadcrumb {
          font-size: 1.4rem;
          color: #003663;
          text-align: center;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }

      .image-box {
        box-shadow: 0 9px 56px rgba(48,56,96,0.20), 0 5px 20px rgba(40,40,60,0.19);
        padding: 0.4rem;
        display: inline-block;
        margin-right: 1.2rem;
        margin-bottom: 1.2rem;
        box-sizing: border-box;
        cursor: pointer;
        border-radius: 20px;
        background: #fff;
        transition: transform 0.18s, box-shadow 0.18s;
      }

      .image-box:hover {
        transform: scale(1.04);
        box-shadow: 0 10px 75px rgba(48,56,96,0.32), 0 8px 30px rgba(40,40,60,0.19);
      }

      .image-box img {
        width: 350px;
        height: 250px;
        object-fit: contain;
        display: block;
        border-radius: 25px;
        margin: 0 auto;
      }

      .image-box.bottom {
        display: block;
        margin-top: 2rem;
        width: 365px;
        max-width: 90vw;
        margin-right: 0;
        margin-left: 0;
      }

      .image-label {
        font-size: 1.2rem;
        color: #003663;
        margin-top: 0.6rem;
        margin-bottom: 0.2rem;
        text-align: center;
        width: 100%;
        display: block;
      }
      `}</style>
            <PageLayoutComponent>
                <Breadcrumb
                    t={t}
                    selectedOrg={selectedOrg}
                    view={view}
                    handleShowMain={handleShowMain}
                />
                {view === "trend" ? (
                    <TrendDetails microorganism={selectedOrg} />
                ) : view === "substance" ? (
                    <SubstanceDetail
                        microorganism={selectedOrg}
                        onShowMain={handleShowMain}
                    />
                ) : (
                    <div className="abx-page">
                        <aside className="abx-sidebar">
                            <ul className="abx-nav">
                                {ORGANISMS.map((org) => (
                                    <li
                                        key={org}
                                        className={`abx-nav-item${
                                            org === selectedOrg
                                                ? " abx-active"
                                                : ""
                                        }`}
                                        onClick={() => handleOrgSelect(org)}
                                    >
                                        <FormattedMicroorganismName
                                            microName={org}
                                            fontWeight="bold"
                                            fontSize="1.3rem"
                                        />
                                    </li>
                                ))}
                            </ul>
                        </aside>
                        <section className="abx-content">
                            <div
                                className="image-box"
                                onClick={handleTrendClick}
                            >
                                <div className="image-label">{t("Trend")}</div>
                                <img src="/assets/trend.png" alt="Trend" />
                            </div>
                            <div
                                className="image-box"
                                onClick={handleSubstanceClick}
                            >
                                <div className="image-label">
                                    {t("Substans")}
                                </div>
                                <img
                                    src="/assets/substans.png"
                                    alt="Substans"
                                />
                            </div>
                            <div
                                className="image-box bottom"
                                onClick={handleComingSoon}
                            >
                                <div className="image-label">{t("Multi")}</div>
                                <img src="/assets/multi.png" alt="Multi" />
                            </div>
                        </section>
                    </div>
                )}
                <Dialog open={comingSoonOpen} onClose={handleCloseComingSoon}>
                    <DialogTitle>{t("ComingSoon")}</DialogTitle>
                    <DialogActions sx={{ justifyContent: "center" }}>
                        <Button onClick={handleCloseComingSoon} autoFocus>
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </PageLayoutComponent>
        </>
    );
}
