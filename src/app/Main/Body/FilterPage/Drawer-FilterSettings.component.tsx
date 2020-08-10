/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React from "react";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";

const filterHeadingStyle = css`
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 2rem;
    color: ${primaryColor};
`;
const filterSubheadingStyle = css`
    display: flex;
    flex-direction: row;
    align-items: center;
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

export function FilterSettingsComponent(): JSX.Element {
    const [state, setState] = React.useState<{
        number: number;
        rows: JSX.Element[];
        pathogen: string;
        serovar: string;
    }>({
        rows: [],
        number: 1,
        pathogen: "",
        serovar: "",
    });

    const { t } = useTranslation(["FilterPage"]);

    const handleChange = (
        event: React.ChangeEvent<{ name?: string; value: unknown }>
    ): void => {
        const name = event.target.name as keyof typeof state;
        setState({
            ...state,
            [name]: event.target.value,
        });
    };

    const handleAdd = (): void => {
        setState({
            ...state,
            number: state.number += 1,
        });
    };
    const handleRemove = (): void => {
        setState({
            ...state,
            number: state.number -= 1,
        });
    };

    return (
        <div>
            <h3 css={filterHeadingStyle}>{t("Drawer.Title")}</h3>
            <div css={filterSubheadingStyle}>
                <h4>{t("Drawer.Subtitles.Filter")}</h4>
                <IconButton css={iconButtonStyle} onClick={handleAdd}>
                    <AddCircleIcon css={iconStyle} />
                </IconButton>
            </div>
            <div>
                {(function Add(): JSX.Element[] {
                    const elements = [];
                    for (let i = 0; i < state.number; i += 1) {
                        elements.push(
                            <div css={selectorAreaStyle} key={i}>
                                <FormControl
                                    variant="filled"
                                    css={selectorStyle}
                                >
                                    <Select
                                        native
                                        value={state.pathogen}
                                        onChange={handleChange}
                                        inputProps={{
                                            name: "pathogen",
                                            id: "filled-age-native-simple",
                                        }}
                                    >
                                        <option value="">
                                            {t("Drawer.Selector")}
                                        </option>
                                        <option value="pathogen">
                                            {t("Drawer.Filters.Pathogen")}
                                        </option>
                                        <option value="serovar">
                                            {t("Drawer.Filters.Serovar")}
                                        </option>
                                    </Select>
                                </FormControl>
                                <IconButton
                                    css={iconButtonStyle}
                                    onClick={handleRemove}
                                >
                                    <RemoveCircleIcon css={iconStyle} />
                                </IconButton>
                            </div>
                        );
                    }
                    return elements;
                })()}
            </div>
        </div>
    );
}
