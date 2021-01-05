/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { IconButton, Tooltip, withStyles } from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";
import { FilterType } from "./Model/Filter.model";
import { defaultFilter, FilterContext } from "./Context/FilterContext";
import {
    backgroundColor,
    onBackgroundColor,
    primaryColor,
} from "./Style/Style-MainTheme.component";
import { TableContext } from "./Context/TableContext";

const buttonAreaStyle = css`
    margin-top: auto;
    display: flex;
    align-items: center;
`;

const iconButtonStyle = css`
    height: fit-content;
    padding: 0;
    color: ${primaryColor};
`;

const LightTooltip = withStyles(() => ({
    tooltip: {
        backgroundColor,
        color: onBackgroundColor,
        fontSize: "9px",
        margin: "0.2em",
    },
}))(Tooltip);

interface ClearSelectorProps {
    isFilter: boolean;
    isTable: boolean;
}

export function ClearSelectorComponent(props: ClearSelectorProps): JSX.Element {
    const { setFilter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);

    const { t } = useTranslation(["QueryPage"]);
    const mouseOverText = t("QueryPage:Buttons.Delete");

    const handleRemove = (): void => {
        if (props.isFilter) {
            setFilter(defaultFilter);
        } else if (props.isTable) {
            setTable({
                ...table,
                row: "" as FilterType,
                column: "" as FilterType,
            });
        }
    };

    return (
        <div css={buttonAreaStyle}>
            <LightTooltip title={mouseOverText} placement="top">
                <IconButton
                    css={iconButtonStyle}
                    onClick={() => handleRemove()}
                >
                    <CancelIcon
                        css={css`
                            height: 20px;
                            width: 20px;
                        `}
                    />
                </IconButton>
            </LightTooltip>
        </div>
    );
}
