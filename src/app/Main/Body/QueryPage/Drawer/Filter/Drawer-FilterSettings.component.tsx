/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { ValueType } from "react-select";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AddSelectorElements } from "./Filter-SelectorList.component";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import { ClearSelectorComponent as ClearSelectorButton } from "../../../../../Shared/ClearSelectorButton.component";
import { FilterType } from "../../../../../Shared/Filter.model";
import { TableType } from "../../../../../Shared/Context/TableContext";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";

const drawerWidthStyle = css`
    width: inherit;
`;
const filterHeadingStyle = css`
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 2rem;
    color: ${primaryColor};
`;
const filterAreaStyle = css`
    width: inherit;
    display: flex;
    flex-direction: row;
`;
const filterSubheadingStyle = css`
    margin: 2.5em 0 0 0;
    font-weight: bold;
    font-size: 1rem;
`;

export function FilterSettingsComponent(): JSX.Element {
    const { filter, setFilter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);

    /**
     * @desc takes the current values of the selector with the onChange envent handler and sets it as filter values (in the Context).
     * @param {ValueType<Record<string, string>>}  selectedOption       current values of the slector
     * @param {FilterType | TableType}             keyName              name of the current main filter attribute
     */
    const handleChange = (
        selectedOption: ValueType<Record<string, string>>,
        keyName: FilterType | TableType
    ): void => {
        if (selectedOption) {
            const selectedFilter: string[] = [];
            const selectedOptionObj = selectedOption as Record<string, string>[];
            selectedOptionObj.forEach((element: Record<string, string>) => {
                selectedFilter.push(Object.values(element)[0]);
            });
            setFilter({
                ...filter,
                [keyName]: selectedFilter,
            });
        } else {
            setFilter({
                ...filter,
                [keyName]: [],
            });
        }
        
    };

    return (
        <div css={drawerWidthStyle}>
            <h3 css={filterHeadingStyle}>{t("Drawer.Title")}</h3>
            <div css={filterAreaStyle}>
                <h4 css={filterSubheadingStyle}>
                    {t("Drawer.Subtitles.Filter")}
                </h4>
                <ClearSelectorButton
                    isFilter
                    isTabel={false}
                />
            </div>
            {AddSelectorElements(handleChange)}
        </div>
    );
}
