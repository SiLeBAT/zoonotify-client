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
import { DisplayedFeatureSelectorComponent as TableSelector } from "./Feature-SelectorElement.component";
import { FilterType } from "../../../../../Shared/Filter.model";

const drawerWidthStyle = css`
    width: inherit;
`;
const featureSubHeaderStyle = css`
    margin: 0; 
    font-size: 1rem;
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

export function DisplayedFeaturesComponent(): JSX.Element {
    const { table, setTable } = useContext(TableContext);
    const { t } = useTranslation(["QueryPage"]);

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
                <h4 css={featureSubHeaderStyle}>
                    {t("Drawer.Subtitles.Graph")}
                </h4>
                <ClearSelectorButton
                    isFilter={false}
                    isTabel
                />
            </div>
            <TableSelector
                keyValue="table-selector-row"
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
            <TableSelector
                keyValue="table-selector-column"
                label={t("Drawer.Graphs.Column")}
                activeFeature={table.column}
                otherFeature={table.row}
                selectAttribute="column"
                handleChange={handleChange}
            />
        </div>
    );
}
