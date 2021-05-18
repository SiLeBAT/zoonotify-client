/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { Button } from "@material-ui/core";
import { AccordionComponent } from "../../../Shared/Accordion.component";
import { InfoPageAmrsContentComponent } from "./Amrs/InfoPage-AmrsContent.component";
import { InfoPageFiltersContentComponent } from "./InfoPage-FiltersContent.component";
import { AmrKey, AmrsTable } from "./InfoPage.model";
import {
    onPrimaryColor,
    primaryColor,
    secondaryColor,
} from "../../../Shared/Style/Style-MainTheme.component";

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
                    content={t("Background.Description")}
                    defaultExpanded={false}
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
                        content={t("Methods.Isolates.Description")}
                        defaultExpanded={false}
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
                    />
                </div>
            </div>
        </div>
    );
}
