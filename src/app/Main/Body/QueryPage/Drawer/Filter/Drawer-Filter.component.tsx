/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@material-ui/core";
import { FilterSelectorListComponent } from "./Filter-SelectorList.component";
import { ClearSelectorComponent } from "../../../../../Shared/ClearSelectorButton.component";
import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import { TableType } from "../../../../../Shared/Context/TableContext";
import {
    onPrimaryColor,
    primaryColor,
    secondaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";
import { FilterContextInterface } from "../../../../../Shared/Context/FilterContext";
import { FilterSettingDialogComponent } from "./Dialog/FilterSetting-Dialog.component";

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

const buttonStyle = css`
    width: 100%;
    height: 1.5rem;
    margin-top: 0.5em;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
    &:hover {
        background-color: ${primaryColor};
        color: ${secondaryColor};
    }
`;

export function DrawerFilterComponent(props: {
    dataUniqueValues: FilterInterface;
    filterInfo: FilterContextInterface;
    onFilterChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | TableType
    ) => void;
    onFilterRemoveAll: () => void;
    onSubmitFiltersToDisplay: (tempFiltersToDisplay: string[]) => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const [filterDialogIsOpen, setFilterDialogIsOpen] = useState<boolean>(
        false
    );

    const handleChangeFilter = (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | TableType
    ): void => props.onFilterChange(selectedOption, keyName);
    const handleRemoveAllFilter = (): void => props.onFilterRemoveAll();

    const handleClickOpenFilterSettingDialog = (): void => {
        setFilterDialogIsOpen(true);
    };

    const handleSubmitFiltersToDisplay = (tempFiltersToDisplay: string[]): void => {
        props.onSubmitFiltersToDisplay(tempFiltersToDisplay);
        setFilterDialogIsOpen(false);
    };

    const handleCancelFiltersToDisplay = (): void => {
        setFilterDialogIsOpen(false)
    }

    const filterDialogButton = t("FilterDialog.ButtonText");

    return (
        <div css={drawerWidthStyle}>
            <p css={filterHeadingStyle}>{t("Drawer.Title")}</p>
            <div css={filterAreaStyle}>
                <p css={filterSubheadingStyle}>
                    {t("Drawer.Subtitles.Filter")}
                </p>
                <ClearSelectorComponent onClick={handleRemoveAllFilter} />
            </div>
            {FilterSelectorListComponent(
                props.dataUniqueValues,
                props.filterInfo.selectedFilter,
                props.filterInfo.displayedFilters,
                props.filterInfo.mainFilter,
                handleChangeFilter
            )}
            <Button
                css={buttonStyle}
                onClick={handleClickOpenFilterSettingDialog}
                color="primary"
            >
                {filterDialogButton}
            </Button>
            <FilterSettingDialogComponent
                isOpen={filterDialogIsOpen}
                previousFiltersToDisplay={props.filterInfo.displayedFilters}
                availableFilters={props.filterInfo.mainFilter}
                onSubmitFiltersToDisplay={handleSubmitFiltersToDisplay}
                onCancelFiltersToDisplay={handleCancelFiltersToDisplay}
            />
        </div>
    );
}
