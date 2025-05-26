import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";
import { Typography } from "@mui/material";
import { TrendDetails } from "./TrendDetails";

const ORGANISMS = [
    "E. coli",
    "Campylobacter spp.",
    "Salmonella spp.",
    "MRSA",
    "STEC",
    "Enterococcus spp.",
];

// Utils for microorganism name formatting
const italicWords: string[] = [
    "Salmonella",
    "coli",
    "E.",
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

// FormattedMicroorganismName component (now exported)
export interface FormattedMicroorganismNameProps {
    microName: string | null | undefined;
    isBreadcrumb?: boolean;
}

export const FormattedMicroorganismName: React.FC<
    FormattedMicroorganismNameProps
> = ({ microName, isBreadcrumb = false }) => {
    const words = formatMicroorganismNameArray(microName);
    return (
        <Typography
            component="span"
            style={{
                fontWeight: "bold",
                fontSize: isBreadcrumb ? "2rem" : "1.5rem",
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

// AntibioticResistancePageComponent
export function AntibioticResistancePageComponent(): JSX.Element {
    const { t } = useTranslation(["Antibiotic"]);
    const [selectedOrg, setSelectedOrg] = useState(ORGANISMS[0]);
    const [showTrendDetails, setShowTrendDetails] = useState(false);

    // now explicitly returning void
    const handleTrendClick = (): void => {
        setShowTrendDetails(true);
    };

    // now explicitly returning void
    const handleBack = (): void => {
        setShowTrendDetails(false);
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
          font-size: 1.75rem;
          color: #003663;
          margin-bottom: 2rem;
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
                {showTrendDetails ? (
                    <TrendDetails
                        microorganism={selectedOrg}
                        onBack={handleBack}
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
                                        onClick={() => setSelectedOrg(org)}
                                    >
                                        <FormattedMicroorganismName
                                            microName={org}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        <section className="abx-content">
                            <div className="abx-breadcrumb">
                                {t("AntibioticResistance")} /{" "}
                                <FormattedMicroorganismName
                                    microName={selectedOrg}
                                    isBreadcrumb={true}
                                />
                            </div>
                            <div
                                className="image-box"
                                onClick={handleTrendClick}
                            >
                                <div className="image-label">{t("Trend")}</div>
                                <img src="/assets/trend.png" alt="Trend" />
                            </div>
                            <div className="image-box">
                                <div className="image-label">
                                    {t("Substans")}
                                </div>
                                <img
                                    src="/assets/substans.png"
                                    alt="Substans"
                                />
                            </div>
                            <div className="image-box bottom">
                                <div className="image-label">{t("Multi")}</div>
                                <img src="/assets/multi.png" alt="Multi" />
                            </div>
                        </section>
                    </div>
                )}
            </PageLayoutComponent>
        </>
    );
}
