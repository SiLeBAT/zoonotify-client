/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React, { useContext } from "react";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import { useTranslation } from "react-i18next";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { DataContext } from "../../../Shared/Context/DataContext";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";
import { SelectorItem } from "./Drawer-SelectorItem.component";

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
    margin: 0 2em 2em 2em;
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
const selectorHeadingStyle = css`
    padding: 0;
    margin: 2em 2em 0 2em;
`;

export function FilterSettingsComponent(): JSX.Element {
    const [state, setState] = React.useState<{
        number: number;
        filter: string;
    }>({
        number: 1,
        filter: "none",
    });
    const { setFilter } = useContext(FilterContext);
    const dataValue = useContext(DataContext);

    const { t } = useTranslation(["FilterPage"]);

    const handleChange = (
        event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
    ): void => {
        const name = event.target.value as keyof typeof state;
        setState({
            ...state,
            filter: name,
        });
        setFilter({ filterValue: name });
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

    const filterValues = dataValue.data.uniqueValues;

    const selectorItems = filterValues.map((item: string) => (
        <SelectorItem item={item} />
    ));

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
                            <div>
                                <h5 css={selectorHeadingStyle}>Serovar</h5>
                                <div css={selectorAreaStyle} key={i}>
                                    <FormControl
                                        variant="filled"
                                        css={selectorStyle}
                                    >
                                        <Select
                                            native
                                            value={state.filter}
                                            onChange={handleChange}
                                            inputProps={{
                                                name: "filter",
                                                id: "filled-age-native-simple",
                                            }}
                                        >
                                            <option value="">
                                                {t("Drawer.Selector")}
                                            </option>
                                            {selectorItems}
                                        </Select>
                                    </FormControl>
                                    <IconButton
                                        css={iconButtonStyle}
                                        onClick={handleRemove}
                                    >
                                        <RemoveCircleIcon css={iconStyle} />
                                    </IconButton>
                                </div>
                            </div>
                        );
                    }
                    return elements;
                })()}
            </div>
        </div>
    );
}
