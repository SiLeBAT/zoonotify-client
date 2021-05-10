/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { AccordionComponent } from "../../../Shared/Accordion.component";
import {
    onPrimaryColor,
    primaryColor,
} from "../../../Shared/Style/Style-MainTheme.component";
import { InfoPageAmrsAccordionContentComponent } from "./Amrs/InfoPage-AmrsAccordionContent.component";
import { InfoPageFilterAccordionsComponent } from "./InfoPage-FilterAccordions.component";
import { AmrKeyType, TableData } from "./InfoPage.model";
import { InfoPageNavButtonsComponent } from "./InfoPage-NavButtons.component";

const infoPageStyle = css`
    margin-left: 5em;
    margin-right: 5em;
    margin-bottom: 2em;
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

const subHeadingStyle = css`
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
    padding: 0.5em;
`;

export function InfoPageComponent(props: {
    describedFilters: string[];
    amrKeys: AmrKeyType[];
    tableData: Record<string, TableData>;
    onAmrDataExport: (amrKey: AmrKeyType) => void;
}): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);

    const handleExportAmrData = (amrKey: AmrKeyType): void => {
        props.onAmrDataExport(amrKey);
    };

    const backgroundChapterHeading = t("Background.Name");
    const filtersChapterHeading = t("Filters.Name");
    const methodsChapterHeading = t("Methods.Name");

    return (
        <div css={infoPageStyle}>
            <p css={headingStyle}>{t("Title")}</p>
            <InfoPageNavButtonsComponent
                backgroundButtonLabel={backgroundChapterHeading}
                filtersButtonLabel={filtersChapterHeading}
                methodsButtonLabel={methodsChapterHeading}
            />
            <div>
                <AccordionComponent
                    title={backgroundChapterHeading}
                    content={t("Background.Description")}
                    defaultExpanded={false}
                />
                <p css={subHeadingStyle} id="filter">
                    {filtersChapterHeading}
                </p>
                <InfoPageFilterAccordionsComponent
                    describedFilters={props.describedFilters}
                />
                <p css={subHeadingStyle} id="methods">
                    {methodsChapterHeading}
                </p>
                <div>
                    <AccordionComponent
                        title={t("Methods.Isolates.Name")}
                        content={t("Methods.Isolates.Description")}
                        defaultExpanded={false}
                    />
                    <AccordionComponent
                        title={t("Methods.Amrs.Name")}
                        content={
                            <InfoPageAmrsAccordionContentComponent
                                amrKeys={props.amrKeys}
                                tableData={props.tableData}
                                onAmrDataExport={handleExportAmrData}
                            />
                        }
                        defaultExpanded={false}
                    />
                </div>
            </div>
        </div>
    );
}
