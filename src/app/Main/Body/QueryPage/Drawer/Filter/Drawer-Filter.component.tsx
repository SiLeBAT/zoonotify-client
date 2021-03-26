/** @jsx jsx */
import { css, jsx } from "@emotion/core";
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

export function DrawerFilterComponent(props: {
    onFilterChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | TableType
    ) => void;
    onFilterRemoveAll: () => void;
}): JSX.Element {
    const { filter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeFilter = (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | TableType
    ): void => props.onFilterChange(selectedOption, keyName);
    const handleRemoveAllFilter = (): void => props.onFilterRemoveAll();

    return (
        <div css={drawerWidthStyle}>
            <p css={filterHeadingStyle}>{t("Drawer.Title")}</p>
            <div css={filterAreaStyle}>
                <p css={filterSubheadingStyle}>
                    {t("Drawer.Subtitles.Filter")}
                </p>
                <ClearSelectorComponent onClick={handleRemoveAllFilter} />
            </div>
            {FilterSelectorListComponent(filter.mainFilter, handleChangeFilter)}
        </div>
    );
}
