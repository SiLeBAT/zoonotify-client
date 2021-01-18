/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { ValueType } from "react-select";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { FilterSelectorListComponent } from "./Filter-SelectorList.component";
import { ClearSelectorComponent } from "../../../../../Shared/ClearSelectorButton.component";
import { FilterType } from "../../../../../Shared/Model/Filter.model";
import { TableType } from "../../../../../Shared/Context/TableContext";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";

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
    margin: 2.5em 16px 0 0;
    padding-right: 8px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;
const filterSubheadingStyle = css`
    margin: 0;
    font-weight: bold;
    font-size: 1rem;
`;

export function DrawerFilterComponent(): JSX.Element {
    const { filter, setFilter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);

    /**
     * @desc takes the current values of the selector with the onChange event handler and sets it as filter values (in the Context).
     * @param {ValueType<Record<string, string>>}  selectedOption       current values of the selector
     * @param {FilterType | TableType}             keyName              name of the current main filter attribute
     */
    const handleChange = (
        selectedOption: ValueType<Record<string, string>>,
        keyName: FilterType | TableType
    ): void => {
        if (selectedOption) {
            const selectedFilter: string[] = [];
            const selectedOptionObj = selectedOption as Record<
                string,
                string
            >[];
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
            <p css={filterHeadingStyle}>{t("Drawer.Title")}</p>
            <div css={filterAreaStyle}>
                <p css={filterSubheadingStyle}>
                    {t("Drawer.Subtitles.Filter")}
                </p>
                <ClearSelectorComponent isFilter isTable={false} />
            </div>
            {FilterSelectorListComponent(handleChange)}
        </div>
    );
}
