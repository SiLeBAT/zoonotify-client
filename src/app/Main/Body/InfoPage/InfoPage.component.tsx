/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import { AccordionComponent } from "../../../Shared/Accordion.component";
import { InfoPageAmrsContentComponent } from "./Amrs/InfoPage-AmrsContent.component";
import { InfoPageFiltersContentComponent } from "./InfoPage-FiltersContent.component";
import { AmrKey, AmrsTable, microorganismNames } from "./InfoPage.model";
import {
    onPrimaryColor,
    primaryColor,
    secondaryColor,
} from "../../../Shared/Style/Style-MainTheme";

const infoPageStyle = css`
    width: 60%;
    margin: 2em auto;
`;

const headingStyle = css`
    min-width: 7em;
    padding-bottom: 0.5em;
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
    border-bottom: 1px solid ${primaryColor};
`;
const navButtonDisplayStyle = css`
    display: grid;
`;
const navButtonListStyle = css`
    margin: 0 auto;
    display: grid;
`;
const navButtonStyle = css`
    margin: 0.25em;
    text-align: center;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
    &:hover {
        background-color: ${primaryColor};
        color: ${secondaryColor};
    }
`;

const subHeadingStyle = css`
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
    padding: 0.5em;
`;

function ParagraphWithBoldText(
    text1: string,
    boldText: string,
    text2: string
): JSX.Element {
    return (
        <p>
            {text1}
            <b>{boldText}</b>
            {text2}
        </p>
    );
}

export function InfoPageComponent(props: {
    describedFilters: string[];
    amrKeys: AmrKey[];
    tableData: Record<AmrKey, AmrsTable>;
    onAmrDataExport: (amrKey: AmrKey) => void;
}): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);

    const handleExportAmrData = (amrKey: AmrKey): void => {
        props.onAmrDataExport(amrKey);
    };

    const backgroundChapterHeading = t("Background.Name");
    const filtersChapterHeading = t("Filters.Name");
    const methodsChapterHeading = t("Methods.Name");

    return (
        <div css={infoPageStyle}>
            <p css={headingStyle}>{t("Title")}</p>
            <div css={navButtonDisplayStyle}>
                <div css={navButtonListStyle}>
                    <Button css={navButtonStyle} href="#filter">
                        {filtersChapterHeading}
                    </Button>
                    <Button css={navButtonStyle} href="#methods">
                        {methodsChapterHeading}
                    </Button>
                </div>
            </div>
            <div>
                <AccordionComponent
                    title={backgroundChapterHeading}
                    content={
                        <div>
                            {ParagraphWithBoldText(
                                t("Background.Paragraph1.Description1"),
                                t("Background.Paragraph1.BoldText"),
                                t("Background.Paragraph1.Description2")
                            )}
                            <p>
                                {t("Background.Paragraph2.Description1")}
                                {microorganismNames.SalmSpp},{" "}
                                {microorganismNames.CampySpp},{" "}
                                {microorganismNames.Listeria}
                                {t("Background.Paragraph2.Description2")}
                                {microorganismNames.ColiFull}
                                {t("Background.Paragraph2.Description3")}
                                {microorganismNames.Staphy}
                                {t("Background.Paragraph2.Description4")}
                                <i>{t("Background.Paragraph2.ItalicText")}</i>
                                {t("Background.Paragraph2.Description5")}
                                {microorganismNames.ColiShort}
                                {t("Background.Paragraph2.Description6")}
                                {microorganismNames.SalmSpp},{" "}
                                {microorganismNames.CampySpp}
                                {t("Background.Paragraph2.Description7")}
                                {microorganismNames.ColiShort}
                                {t("Background.Paragraph2.Description8")}
                                {microorganismNames.EnteroFF}
                                {t("Background.Paragraph2.Description9")}
                                {microorganismNames.ColiShort}
                                {t("Background.Paragraph2.Description10")}
                                {microorganismNames.ColiShort}
                                {t("Background.Paragraph2.Description11")}
                                {microorganismNames.ColiShort}
                                {t("Background.Paragraph2.Description12")}
                            </p>
                            {ParagraphWithBoldText(
                                t("Background.Paragraph3.Description1"),
                                t("Background.Paragraph3.BoldText"),
                                t("Background.Paragraph3.Description2")
                            )}
                            {ParagraphWithBoldText(
                                t("Background.Paragraph4.Description1"),
                                t("Background.Paragraph4.BoldText"),
                                t("Background.Paragraph4.Description2")
                            )}
                        </div>
                    }
                    defaultExpanded={false}
                    centerContent={false}
                />
                <p css={subHeadingStyle} id="filter">
                    {filtersChapterHeading}
                </p>
                <InfoPageFiltersContentComponent
                    describedFilters={props.describedFilters}
                />
                <p css={subHeadingStyle} id="methods">
                    {methodsChapterHeading}
                </p>
                <div>
                    <AccordionComponent
                        title={t("Methods.Isolates.Name")}
                        content={
                            <div>
                                {ParagraphWithBoldText(
                                    t(
                                        "Methods.Isolates.Paragraph1.Description1"
                                    ),
                                    t("Methods.Isolates.Paragraph1.BoldText"),
                                    t(
                                        "Methods.Isolates.Paragraph1.Description2"
                                    )
                                )}
                                {ParagraphWithBoldText(
                                    t(
                                        "Methods.Isolates.Paragraph2.Description1"
                                    ),
                                    t("Methods.Isolates.Paragraph2.BoldText"),
                                    t(
                                        "Methods.Isolates.Paragraph2.Description2"
                                    )
                                )}
                            </div>
                        }
                        defaultExpanded={false}
                        centerContent={false}
                    />
                    <AccordionComponent
                        title={t("Methods.Amrs.Name")}
                        content={
                            <InfoPageAmrsContentComponent
                                amrKeys={props.amrKeys}
                                tableData={props.tableData}
                                onAmrDataExport={handleExportAmrData}
                            />
                        }
                        defaultExpanded={false}
                        centerContent={false}
                    />
                </div>
            </div>
        </div>
    );
}
