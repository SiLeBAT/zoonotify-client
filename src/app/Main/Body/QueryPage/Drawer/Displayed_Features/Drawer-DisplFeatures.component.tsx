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
import { ClearSelectorComponent } from "../../../../../Shared/ClearSelectorButton.component";
import { DisplayedFeatureSelectorComponent } from "./DisplFeatures-Selector.component";
import { FilterType } from "../../../../../Shared/Model/Filter.model";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";

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

interface DrawerDisplayedFeaturesProps {
    onDisplFeaturesChange: (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
    ) => void;
    onDisplFeaturesSwap: () => void;
    onDisplFeaturesRemoveAll: () => void;
}

export function DrawerDisplayedFeaturesComponent(
    props: DrawerDisplayedFeaturesProps
): JSX.Element {
    const { table } = useContext(TableContext);
    const { filter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeDisplFeatures = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
    ): void => props.onDisplFeaturesChange(selectedOption, keyName);
    const handleSwapDisplFeatures = (): void => props.onDisplFeaturesSwap();
    const handleRemoveAllDisplFeatures = (): void =>
        props.onDisplFeaturesRemoveAll();

    return (
        <div css={drawerWidthStyle}>
            <div css={featureAreaStyle}>
                <p css={featureSubHeaderStyle}>{t("Drawer.Subtitles.Graph")}</p>
                <ClearSelectorComponent onClick={handleRemoveAllDisplFeatures} />
            </div>
            <DisplayedFeatureSelectorComponent
                label={t("Drawer.Graphs.Row")}
                activeFeature={table.row}
                otherFeature={table.column}
                selectAttribute="row"
                mainFilterAttributes={filter.mainFilter}
                onChange={handleChangeDisplFeatures}
            />
            <div css={centerIconButtonStyle}>
                <IconButton css={iconButtonStyle} onClick={handleSwapDisplFeatures}>
                    <SwapVerticalCircleIcon css={iconStyle} />
                </IconButton>
            </div>
            <DisplayedFeatureSelectorComponent
                label={t("Drawer.Graphs.Column")}
                activeFeature={table.column}
                otherFeature={table.row}
                selectAttribute="column"
                mainFilterAttributes={filter.mainFilter}
                onChange={handleChangeDisplFeatures}
            />
        </div>
    );
}
