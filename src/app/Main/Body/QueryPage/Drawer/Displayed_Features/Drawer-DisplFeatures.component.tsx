/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import { ValueType } from "react-select";
import IconButton from "@material-ui/core/IconButton";
import SwapVerticalCircleIcon from "@material-ui/icons/SwapVerticalCircle";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import {
    TableContext,
    TableType,
} from "../../../../../Shared/Context/TableContext";
import { ClearSelectorComponent as ClearSelectorButton } from "../../../../../Shared/ClearSelectorButton.component";
import { DisplayedFeatureSelectorComponent as DisplFeatureSelector } from "./DisplFeatures-Selector.component";
import { FilterType } from "../../../../../Shared/Model/Filter.model";

const drawerWidthStyle = css`
    width: inherit;
`;
const featureSubHeaderStyle = css`
    margin: 0; 
    font-size: 1rem;
    font-weight: bold;
`;
const featureAreaStyle = css`
    width: inherit;
    margin: 2.5em 16px 0 0;
    padding-right: 8px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
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

export function DrawerDisplayedFeaturesComponent(): JSX.Element {
    const { table, setTable } = useContext(TableContext);
    const { t } = useTranslation(["QueryPage"]);

    /**
     * @desc Takes the current values of the selector with the onChange event handler and sets it as row/column.
     * @param {ValueType<Record<string, string>>}  selectedOption       current values of the selector
     * @param {FilterType | TableType}             keyName              "row" or "column"
     */
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

    const handleSwap = (): void => {
        setTable({
            ...table,
            row: table.column,
            column: table.row,
        });
    };

    return (
        <div css={drawerWidthStyle}>
            <div css={featureAreaStyle}>
                <p css={featureSubHeaderStyle}>
                    {t("Drawer.Subtitles.Graph")}
                </p>
                <ClearSelectorButton
                    isFilter={false}
                    isTable
                />
            </div>
            <DisplFeatureSelector
                label={t("Drawer.Graphs.Row")}
                activeFeature={table.row}
                otherFeature={table.column}
                selectAttribute="row"
                handleChange={handleChange}
            />
            <div css={centerIconButtonStyle}>
                <IconButton css={iconButtonStyle} onClick={handleSwap}>
                    <SwapVerticalCircleIcon css={iconStyle} />
                </IconButton>
            </div>
            <DisplFeatureSelector
                label={t("Drawer.Graphs.Column")}
                activeFeature={table.column}
                otherFeature={table.row}
                selectAttribute="column"
                handleChange={handleChange}
            />
        </div>
    );
}
