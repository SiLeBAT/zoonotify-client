/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import IconButton from "@material-ui/core/IconButton";
import SwapVerticalCircleIcon from "@material-ui/icons/SwapVerticalCircle";
import { useTranslation } from "react-i18next";
import { ValueType } from "react-select";
import _ from "lodash";
import { FilterSelectorComponent } from "../Filter/Filter-Selector.component";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import {
    TableContext,
    TableType,
} from "../../../../../Shared/Context/TableContext";
import {
    FilterType,
    mainFilterAttributes,
} from "../../../../../Shared/Filter.model";
import { ClearSelectorComponent as ClearSelectorButton } from "../../../../../Shared/ClearSelectorButton.component";

const drawerWidthStyle = css`
    width: inherit;
`;
const filterSubHeaderStyle = css`
    margin: 2.5em 0 0 0;
    font-size: 1rem;
`;
const filterAreaStyle = css`
    width: inherit;
    display: flex;
    flex-direction: row;
`;
const iconButtonStyle = css`
    margin: 1em;
    padding: 0;
    color: ${primaryColor};
`;
const centerIconButtonStyle = css`
    display: flex;
    justify-content: center;
`;
const iconStyle = css`
    width: 36px;
    height: 36px;
`;

function gernerateSettings(tableValue: FilterType): [boolean, FilterType[]] {
    const noValues: boolean = _.isEmpty(tableValue);
    let selectedValuesList: FilterType[] = [tableValue];
    if (noValues) {
        selectedValuesList = [];
    }
    return [noValues, selectedValuesList];
}

export function GraphSettingsComponent(): JSX.Element {
    const { table, setTable } = useContext(TableContext);
    const { t } = useTranslation(["QueryPage"]);

    const handleSwap = (): void => {
        setTable({
            ...table,
            row: table.column,
            column: table.row,
        });
    };

    const handleChange = (
        selectedOption: ValueType<Record<string, string>>,
        keyName: FilterType | TableType
    ): void => {
        if (selectedOption) {
            const selectedFeature: string[] = [];
            const selectedOptionObj = selectedOption as Record<string, string>;
            selectedFeature.push(Object.values(selectedOptionObj)[0]);
            setTable({
                ...table,
                [keyName]: selectedFeature[0] as FilterType,
            });
        } else {
            setTable({
                ...table,
                [keyName]: [],
            });
        }
    };

    const offeredAttributesRow: string[] = _.difference(mainFilterAttributes, [
        table.column,
    ]);
    const offeredAttributesColumn: string[] = _.difference(
        mainFilterAttributes,
        [table.row]
    );

    const [noRow, selectedValuesRow]: [
        boolean,
        FilterType[]
    ] = gernerateSettings(table.row);
    const [noColumn, selectedValuesColumn]: [
        boolean,
        FilterType[]
    ] = gernerateSettings(table.column);

    return (
        <div css={drawerWidthStyle}>
            <div css={filterAreaStyle}>
                <h4 css={filterSubHeaderStyle}>
                    {t("Drawer.Subtitles.Graph")}
                </h4>
                <ClearSelectorButton
                    mainButton
                    filterAttribute="all"
                    isFilter={false}
                    isTabel
                />
            </div>
            <FilterSelectorComponent
                key="table-selector-row"
                label={t("Drawer.Graphs.Row")}
                filterAttribute="row"
                filterValues={offeredAttributesRow}
                handleChange={handleChange}
                selectedValues={selectedValuesRow}
                isMulti={false}
                isNotSelect={noRow}
            />
            <div css={centerIconButtonStyle}>
                <IconButton css={iconButtonStyle} onClick={handleSwap}>
                    <SwapVerticalCircleIcon css={iconStyle} />
                </IconButton>
            </div>
            <FilterSelectorComponent
                key="table-selector-column"
                label={t("Drawer.Graphs.Column")}
                filterAttribute="column"
                filterValues={offeredAttributesColumn}
                handleChange={handleChange}
                selectedValues={selectedValuesColumn}
                isMulti={false}
                isNotSelect={noColumn}
            />
        </div>
    );
}
