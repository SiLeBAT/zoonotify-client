/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { QueryPageIntroTextComponent } from "./IntroText/QueryPage-IntroText.component";
import { QueryPageParameterContentComponent } from "./Parameter/QueryPage-ParameterContent.component";
import { QueryPageNrOfIsolatesComponent } from "./NumberOfIsolates/QueryPage-NrOfIsolates.component";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";
import { QueryPageContentTableResultsLayoutComponent } from "./Results/TableResults/QueryPageContent-TableResultsLayout.component";
import { FilterInterface } from "../../../Shared/Model/Filter.model";
import { TableInterface } from "../../../Shared/Context/TableContext";
import { QueryPageDatabaseStatusIndicatorComponent } from './DatabaseStatusIndicator/QueryPage-DatabaseStatusIndicator.component';

const contentStyle = css`
    width: 0;
    height: inherit;
    margin-right: 1em;
    margin-left: 1em;
    padding: 2em;
    flex: 1 1 0;
    hyphens: auto;
    box-sizing: border-box;
    overflow: auto;
`;
const contentBoxStyle = css`
    max-width: 60em;
    min-width: 20em;
    margin: auto;
    display: flex;
    flex: 0 1 auto;
    flex-direction: column;
    hyphens: auto;
    box-sizing: border-box;
`;
const headingStyle = css`
    margin: 0;
    min-width: 7em;
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
`;

const resultsBoxStyle = css`
    margin-top: 2em;
`;

export function QueryPageContentLayoutComponent(props: {
    isCol: boolean;
    isRow: boolean;
    isFilter: boolean;
    columnNameValues: string[];
    tableData: TableInterface;
    numberOfIsolates: {
        total: number,
        filtered: number
    }
    mainFilterAttributes: string[];
    selectedFilter: FilterInterface;
    onRadioChange: (eventTargetValue: string) => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeRadio = (eventTargetValue: string): void =>
        props.onRadioChange(eventTargetValue);

    return (
        <div css={contentStyle}>
            <h1 css={headingStyle}>{t("Content.Title")}</h1>
            <QueryPageDatabaseStatusIndicatorComponent />
            <div css={contentBoxStyle}>
                {props.isFilter || props.isCol || props.isRow ? (
                    <QueryPageParameterContentComponent
                        mainFilterAttributes={props.mainFilterAttributes}
                        selectedFilter={props.selectedFilter}
                    />
                ) : (
                    <QueryPageIntroTextComponent />
                )}
                <QueryPageNrOfIsolatesComponent
                    numberOfIsolates={props.numberOfIsolates}
                />
            </div>
            <div css={resultsBoxStyle}>
                <QueryPageContentTableResultsLayoutComponent
                    displayRowCol={{ isCol: props.isCol, isRow: props.isRow }}
                    columnNameValues={props.columnNameValues}
                    tableData={props.tableData}
                    onRadioChange={handleChangeRadio}
                />
            </div>
        </div>
    );
}
