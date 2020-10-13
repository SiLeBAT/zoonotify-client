/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ValueType } from "react-select";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import {
    FilterType,
    mainFilterAttributes,
} from "../../../../../Shared/Filter.model";
import { FilterSelectorComponent } from "./Filter-Selector.component";
import { ClearSelectorComponent as ClearSelectorButton } from "../../../../../Shared/ClearSelectorButton.component";
import { DataContext } from "../../../../../Shared/Context/DataContext";
import { CheckIfSingleFilterIsSet } from "../../../../../Core/FilterServices/checkIfFilter.service";

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
    const { data } = useContext(DataContext);
    const { filter, setFilter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);

    /**
     * @desc takes the current values of the selector with the onChange envent handler and sets it as filter values (in the Context).
     * @param selectedOption current values of the slector
     * @param keyName name of the current main filter attribute
     */
    const handleChange = (
        selectedOption: ValueType<Record<string, string>>,
        keyName: FilterType
    ): void => {
        const selectedFilter: string[] = [];
        const selectedOptionObj = selectedOption as Record<string, string>[];
        selectedOptionObj.forEach((element: Record<string, string>) => {
            selectedFilter.push(Object.values(element)[0]);
        });
        setFilter({
            ...filter,
            [keyName]: selectedFilter,
        });
    };

    const totalNumberOfFilters: number = mainFilterAttributes.length;

    return (
        <div css={drawerWidthStyle}>
            <h3 css={filterHeadingStyle}>{t("Drawer.Title")}</h3>
            <div css={filterAreaStyle}>
                <h4 css={filterSubheadingStyle}>
                    {t("Drawer.Subtitles.Filter")}
                </h4>
                <ClearSelectorButton
                    mainButton
                    filterAttribute="all"
                    isFilter
                    isTabel={false}
                />
            </div>
            {(function AddSelectorElements(): JSX.Element[] {
                const elements: JSX.Element[] = [];
                for (let i = 0; i < totalNumberOfFilters; i += 1) {
                    const filterAttribute: FilterType = mainFilterAttributes[i];
                    const filterValues: string[] = filter[filterAttribute];
                    const allFilterValues: string[] =
                        data.uniqueValues[filterAttribute];
                    const noFilter: boolean = CheckIfSingleFilterIsSet(
                        filter,
                        filterAttribute
                    );
                    elements.push(
                        <FilterSelectorComponent
                            key={`filter-selector-${filterAttribute}`}
                            label={t(`Filters.${filterAttribute}`)}
                            filterAttribute={filterAttribute}
                            handleChange={handleChange}
                            selectedValues={filterValues}
                            filterValues={allFilterValues}
                            isMulti
                            isNotSelect={noFilter}
                        />
                    );
                }
                return elements;
            })()}
        </div>
    );
}
