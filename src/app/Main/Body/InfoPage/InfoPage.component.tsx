/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import { AccordionComponent } from "../../../Shared/Accordion.component";
import { InfoPageAmrsContentComponent } from "./Amrs/InfoPage-AmrsContent.component";
import { InfoPageFiltersContentComponent } from "./InfoPage-FiltersContent.component";
import { AmrKey, AmrsTable } from "./InfoPage.model";
import {
    onPrimaryColor,
    primaryColor,
    secondaryColor,
} from "../../../Shared/Style/Style-MainTheme";
import {
    campySpp,
    coliFull,
    coliShort,
    enteroFF,
    listeria,
    salmSpp,
    staphy,
} from "./italicNames.constants";

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

function createParagraphWithBoldText(
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
                            {createParagraphWithBoldText(
                                t("Background.Paragraph1.Description1"),
                                t("Background.Paragraph1.Description2"),
                                t("Background.Paragraph1.Description3")
                            )}
                            <p>
                                {t("Background.Paragraph2.Description1")}
                                {salmSpp}, {campySpp}, {listeria}
                                {t("Background.Paragraph2.Description2")}
                                {coliFull}
                                {t("Background.Paragraph2.Description3")}
                                {staphy}
                                {t("Background.Paragraph2.Description4")}
                                <i>{t("Background.Paragraph2.Description5")}</i>
                                {t("Background.Paragraph2.Description6")}
                                {coliShort}
                                {t("Background.Paragraph2.Description7")}
                                {salmSpp}, {campySpp}
                                {t("Background.Paragraph2.Description8")}
                                {coliShort}
                                {t("Background.Paragraph2.Description9")}
                                {enteroFF}
                                {t("Background.Paragraph2.Description10")}
                                {coliShort}
                                {t("Background.Paragraph2.Description11")}
                                {coliShort}
                                {t("Background.Paragraph2.Description12")}
                                {coliShort}
                                {t("Background.Paragraph2.Description13")}
                            </p>
                            {createParagraphWithBoldText(
                                t("Background.Paragraph3.Description1"),
                                t("Background.Paragraph3.Description2"),
                                t("Background.Paragraph3.Description3")
                            )}
                            {createParagraphWithBoldText(
                                t("Background.Paragraph4.Description1"),
                                t("Background.Paragraph4.Description2"),
                                t("Background.Paragraph4.Description3")
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
                                {createParagraphWithBoldText(
                                    t(
                                        "Methods.Isolates.Paragraph1.Description1"
                                    ),
                                    t(
                                        "Methods.Isolates.Paragraph1.Description2"
                                    ),
                                    t(
                                        "Methods.Isolates.Paragraph1.Description3"
                                    )
                                )}
                                {createParagraphWithBoldText(
                                    t(
                                        "Methods.Isolates.Paragraph2.Description1"
                                    ),
                                    t(
                                        "Methods.Isolates.Paragraph2.Description2"
                                    ),
                                    t(
                                        "Methods.Isolates.Paragraph2.Description3"
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
