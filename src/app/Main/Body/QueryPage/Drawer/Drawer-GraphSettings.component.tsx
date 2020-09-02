/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React from "react";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";
import SwapVerticalCircleIcon from "@material-ui/icons/SwapVerticalCircle";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../../Shared/Style/Style-MainTheme.component";

const filterSubHeaderStyle = css`
    display: flex;
    flex-direction: row;
    align-items: center;
    font-weight: bold;
    font-size: 1rem;
    line-height: 2rem;
`;
const filterLabelStyle = css`
    margin-left: 1em;
    font-weight: bold;
    font-size: 1rem;
    line-height: 2rem;
`;
const selectorAreaStyle = css`
    width: -webkit-fill-available;
    margin: 2em;
    display: flex;
    flex-direction: row;
    align-items: center;
`;
const iconButtonStyle = css`
    height: fit-content;
    margin-left: 1em;
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
const selectorStyle = css`
    width: inherit;
    select {
        padding: 0.8em;
    }
`;

export function GraphSettingsComponent(): JSX.Element {
    const [state, setState] = React.useState<{
        row: string;
        column: string;
    }>({
        row: "",
        column: "",
    });

    const { t } = useTranslation(["QueryPage"]);

    const handleChange = (
        event: React.ChangeEvent<{ name?: string; value: unknown }>
    ): void => {
        const name = event.target.name as keyof typeof state;
        setState({
            ...state,
            [name]: event.target.value,
        });
    };

    const handleSwap = (): void => {
        setState({
            ...state,
            row: state.column,
            column: state.row,
        });
    };

    return (
        <div>
            <h4 css={filterSubHeaderStyle}>{t("Drawer.Subtitles.Graph")}</h4>
            <p css={filterLabelStyle}>{t("Drawer.Graphs.Row")}</p>
            <div css={selectorAreaStyle}>
                <FormControl variant="filled" css={selectorStyle}>
                    <Select
                        native
                        value={state.row}
                        onChange={handleChange}
                        inputProps={{
                            name: "row",
                            id: "selected-row",
                        }}
                    >
                        <option value="">{t("Drawer.Selector")}</option>
                        <option value="pathogen">
                            {t("Drawer.Filters.Erreger")}
                        </option>
                        <option value="serovar">
                            {t("Drawer.Filters.Serovar")}
                        </option>
                    </Select>
                </FormControl>
            </div>
            <div css={centerIconButtonStyle}>
                <IconButton css={iconButtonStyle} onClick={handleSwap}>
                    <SwapVerticalCircleIcon css={iconStyle} />
                </IconButton>
            </div>

            <p css={filterLabelStyle}>{t("Drawer.Graphs.Column")}</p>
            <div css={selectorAreaStyle}>
                <FormControl variant="filled" css={selectorStyle}>
                    <Select
                        native
                        value={state.column}
                        onChange={handleChange}
                        inputProps={{
                            name: "column",
                            id: "selected-column",
                        }}
                    >
                        <option value="">{t("Drawer.Selector")}</option>
                        <option value="pathogen">
                            {t("Drawer.Filters.Erreger")}
                        </option>
                        <option value="serovar">
                            {t("Drawer.Filters.Serovar")}
                        </option>
                    </Select>
                </FormControl>
            </div>
        </div>
    );
}
