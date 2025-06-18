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
    fontWeight?: "normal" | "bold" | number; // add this
}

export const FormattedMicroorganismName: React.FC<
    FormattedMicroorganismNameProps
> = ({ microName, isBreadcrumb = false, fontWeight }) => {
    const words = formatMicroorganismNameArray(microName);
    return (
        <Typography
            component="span"
            style={{
                fontWeight: fontWeight ?? (isBreadcrumb ? "normal" : "bold"),
                fontSize: "1.4rem",
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
function updateUrl(selectedOrg: string, showTrendDetails: boolean): void {
    const params = new URLSearchParams(window.location.search);
    params.set("microorganism", selectedOrg);
    params.set("view", showTrendDetails ? "trend" : "main");
    // Always sync lang!
    params.set("lang", i18next.language); // Always set, even if present
    window.history.replaceState(null, "", `?${params.toString()}`);
}

function readStateFromUrl(): {
    selectedOrg: string;
    showTrendDetails: boolean;
} {
    const params = new URLSearchParams(window.location.search);
    const orgParam = params.get("microorganism");
    // Type-safe, no non-null assertion
    const selectedOrg =
        typeof orgParam === "string" && ORGANISMS.includes(orgParam)
            ? orgParam
            : ORGANISMS[0];
    const showTrendDetails = params.get("view") === "trend";
    return { selectedOrg, showTrendDetails };
}

// --- Breadcrumb component ---
function Breadcrumb({
    t,
    selectedOrg,
    showTrendDetails,
    handleShowMain,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: any;
    selectedOrg: string;
    showTrendDetails: boolean;
    handleShowMain: () => void;
}): JSX.Element {
    return (
        <div className="abx-breadcrumb">
            {t("AntibioticResistance")} /{" "}
            {showTrendDetails ? (
                <>
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
                    {" / "}
                    {t("Trend")}
                </>
            ) : (
                <FormattedMicroorganismName
                    microName={selectedOrg}
                    isBreadcrumb={true}
                />
            )}
        </div>
    );
}

// --- Main component ---
export function AntibioticResistancePageComponent(): JSX.Element {
    const { t } = useTranslation(["Antibiotic"]);
    const [state, setState] = useState<{
        selectedOrg: string;
        showTrendDetails: boolean;
    }>(() => readStateFromUrl());
    const { selectedOrg, showTrendDetails } = state;

    // State for "Coming soon" modal
    const [comingSoonOpen, setComingSoonOpen] = useState(false);

    // On mount: sync state from URL (deep link support)
    useEffect((): void => {
        const parsed = readStateFromUrl();
        setState(parsed);
    }, []);

    // Whenever selectedOrg or showTrendDetails change, update URL
    useEffect((): void => {
        updateUrl(selectedOrg, showTrendDetails);
    }, [selectedOrg, showTrendDetails]);

    // Whenever language changes, update URL as well!
    useEffect((): void => {
        updateUrl(selectedOrg, showTrendDetails);
    }, [selectedOrg, showTrendDetails, i18next.language]);

    // Handle org selection from sidebar
    const handleOrgSelect = (org: string): void => {
        setState({ selectedOrg: org, showTrendDetails: false });
    };

    // Go to trend view
    const handleTrendClick = (): void => {
        setState((prev) => ({ ...prev, showTrendDetails: true }));
    };

    // Go back to organism selection view (now from breadcrumb only)
    const handleShowMain = (): void => {
        setState((prev) => ({ ...prev, showTrendDetails: false }));
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
          margin-bottom: 0.5 rem;
        }

        .image-box {
          border: 4px solid #003663;
          padding: 1rem;
          display: inline-block;
          margin-right: 1rem;
          margin-bottom: 1rem;
          box-sizing: border-box;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .image-box:hover {
          transform: scale(1.05);
        }

        .image-box.bottom {
          display: block;
          margin-top: 2rem;
          width: 100%;
          max-width: 490px;
        }

        .image-box img {
          width: 450px;
          height: 400px;
          object-fit: contain;
          display: block;
        }

        .image-label {
          font-size: 1.2rem;
          color: #003663;
          margin-bottom: 0.5rem;
        }
      `}</style>
            <PageLayoutComponent>
                <Breadcrumb
                    t={t}
                    selectedOrg={selectedOrg}
                    showTrendDetails={showTrendDetails}
                    handleShowMain={handleShowMain}
                />
                {showTrendDetails ? (
                    <TrendDetails microorganism={selectedOrg} />
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
                                        />
                                    </li>
                                ))}
                            </ul>
                        </aside>
                        <section className="abx-content">
                            {/* Breadcrumb is now at the top of content, see above */}
                            <div
                                className="image-box"
                                onClick={handleTrendClick}
                            >
                                <div className="image-label">{t("Trend")}</div>
                                <img src="/assets/trend.png" alt="Trend" />
                            </div>
                            <div
                                className="image-box"
                                onClick={handleComingSoon}
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
