/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import IconButton from "@material-ui/core/IconButton";
import SwapVerticalCircleIcon from "@material-ui/icons/SwapVerticalCircle";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import { TableSelectorComponent } from "./Table-Selector.component";
import { SelectorItem } from "./SimpleSelectorItem.component";
import { TableContext } from "../../../../../Shared/Context/TableContext";
import { mainFilterAttributes } from "../../../../../Shared/Filter.model";
import { ClearSelectorComponent as ClearSelectorButton } from "../../../../../Shared/ClearSelectorButton.component";

const filterSubHeaderStyle = css`
    margin: 2.5em 0 0 0;
    font-size: 1rem;
`;
const filterAreaStyle = css`
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

const mainItemChild = (values: string[]): JSX.Element[] =>
    values.map((mainFilterValue: string) =>
        SelectorItem({ item: mainFilterValue })
    );

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

    const offeredAttributesRow: string[] = _.difference(mainFilterAttributes, [
        table.column,
    ]);
    const offeredAttributesColumn: string[] = _.difference(
        mainFilterAttributes,
        [table.row]
    );

    return (
        <div>
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
            <TableSelectorComponent
                label={t("Drawer.Graphs.Row")}
                inputProps={{
                    name: "row",
                    id: `selector-id-row`,
                }}
                child={mainItemChild(offeredAttributesRow)}
            />
            <div css={centerIconButtonStyle}>
                <IconButton css={iconButtonStyle} onClick={handleSwap}>
                    <SwapVerticalCircleIcon css={iconStyle} />
                </IconButton>
            </div>
            <TableSelectorComponent
                label={t("Drawer.Graphs.Column")}
                inputProps={{
                    name: "column",
                    id: `selector-id-column`,
                }}
                child={mainItemChild(offeredAttributesColumn)}
            />
        </div>
    );
}
