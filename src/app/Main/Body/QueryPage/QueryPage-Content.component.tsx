/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext, useEffect, useState } from "react";
import { Divider } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { SetDataComponent as Results } from "./QueryPage-SetResultData.component";
import { QueryPageTextContentComponent as TextContent } from "./QueryPage-TextContent.component";
import { QueryPageParameterContentComponent as ParameterContent } from "./Parameter/QueryPage-ParameterContent.component";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";
import { mainFilterAttributes } from "../../../Shared/Filter.model";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { TableContext } from "../../../Shared/Context/TableContext";

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
    min-width: 7em;
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
`;
const deviderStyle = css`
    width: 100%;
    height: 0.15em;
    background: ${primaryColor};
    padding: 0;
    margin: 2em 0;
`;
const subHeadingTextStyle = css`
    margin-top: 2em;
`;

export function QueryPageContentComponent(): JSX.Element {
    const [isFilter, setIsFilter] = useState(false);
    const [isTable, setIsTable] = useState(false);
    const { filter } = useContext(FilterContext);
    const { table } = useContext(TableContext);
    const { t } = useTranslation(["QueryPage"]);

    useEffect((): void => {
        mainFilterAttributes.forEach((element): void => {
            if (filter[element].length !== 0) {
                setIsFilter(true);
            }
        });
        if (table.row.length !== 0 || table.column.length !== 0) {
            setIsTable(true);
        } else {
            setIsTable(false);
        }
    }, [filter, table]);

    return (
        <div css={contentStyle}>
            <h1 css={headingStyle}>{t("Content.Title")}</h1>
            <div css={contentBoxStyle}>
                {isFilter || isTable ? <ParameterContent /> : <TextContent />}
                <Divider variant="middle" css={deviderStyle} />
                <h3 css={subHeadingTextStyle}>{t("Results.Title")}</h3>
            </div>
            <Results />
        </div>
    );
}