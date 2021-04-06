/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import IconButton from "@material-ui/core/IconButton";
import SwapVerticalCircleIcon from "@material-ui/icons/SwapVerticalCircle";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import {
    TableType,
} from "../../../../../Shared/Context/TableContext";
import { ClearSelectorComponent } from "../../../../../Shared/ClearSelectorButton.component";
import { DisplayedFeatureSelectorComponent } from "./DisplFeatures-Selector.component";
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

export interface DrawerDisplayedFeaturesProps {
    tableColumn: string, 
    tableRow: string, 
    mainFilterAttributes: string[],
    onDisplFeaturesChange: (
        selectedOption: { value: string; label: string } | null,
        keyName: FilterType | TableType
    ) => void;
    onDisplFeaturesSwap: () => void;
    onDisplFeaturesRemoveAll: () => void;
}

export function DrawerDisplayedFeaturesComponent(
    props: DrawerDisplayedFeaturesProps
): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeDisplFeatures = (
        selectedOption: { value: string; label: string } | null,
        keyName: FilterType | TableType
    ): void => props.onDisplFeaturesChange(selectedOption, keyName);
    const handleSwapDisplFeatures = (): void => props.onDisplFeaturesSwap();
    const handleRemoveAllDisplFeatures = (): void =>
        props.onDisplFeaturesRemoveAll();

    return (
        <div css={drawerWidthStyle}>
            <div css={featureAreaStyle}>
                <p css={featureSubHeaderStyle}>{t("Drawer.Subtitles.Graph")}</p>
                <ClearSelectorComponent
                    onClick={handleRemoveAllDisplFeatures}
                />
            </div>
            <DisplayedFeatureSelectorComponent
                label={t("Drawer.Graphs.Row")}
                activeFeature={props.tableRow}
                otherFeature={props.tableColumn}
                selectAttribute="row"
                mainFilterAttributes={props.mainFilterAttributes}
                onChange={handleChangeDisplFeatures}
            />
            <div css={centerIconButtonStyle}>
                <IconButton
                    css={iconButtonStyle}
                    onClick={handleSwapDisplFeatures}
                >
                    <SwapVerticalCircleIcon css={iconStyle} />
                </IconButton>
            </div>
            <DisplayedFeatureSelectorComponent
                label={t("Drawer.Graphs.Column")}
                activeFeature={props.tableColumn}
                otherFeature={props.tableRow}
                selectAttribute="column"
                mainFilterAttributes={props.mainFilterAttributes}
                onChange={handleChangeDisplFeatures}
            />
        </div>
    );
}
