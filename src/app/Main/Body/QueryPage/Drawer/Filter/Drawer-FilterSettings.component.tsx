/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React, { useState, useContext } from "react";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import { useTranslation } from "react-i18next";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";
import { DataContext } from "../../../../../Shared/Context/DataContext";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import { SelectorItem } from "../Drawer-SelectorItem.component";

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

const mainSelectorAreaStyle = css`
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
const subSelectorAreaStyle = css`
    display: none;
`;
const selectorStyle = css`
    width: inherit;
    select {
        padding: 0.8em;
    }
`;
/* const selectorHeadingStyle = css`
    padding: 0;
    margin: 2em 2em 0 2em;
`; */

export function FilterSettingsComponent(): JSX.Element {
    const [state, setState] = useState<{
        numberOfFilters: number;
        subFilter: boolean;
    }>({
        numberOfFilters: 1,
        subFilter: false,
    });
    const { filter, setFilter } = useContext(FilterContext);
    const dataValue = useContext(DataContext);

    const { t } = useTranslation(["QueryPage"]);
    const filterName = `filter${state.numberOfFilters}`
    const mainFilterValues = ["Erreger", "Matrix", "Projekt"];


    /**
     * @desc takes the current value of the selector with the onChange envent handler and sets it as filter value (in the Context).
     * @param React.ChangeEvent An onChange event handler returns a Synthetic Event object which contains meta data (target input’s id, name, current value)
     */
    const handleMainFilterChange = (
        event: React.ChangeEvent<{ value: unknown }>
    ): void => {
        const name = event.target.value as string;
/*         const filterName = `filter${state.numberOfFilters}` */        
        filter.mainFilter[filterName] = name;
        mainFilterValues.splice( mainFilterValues.indexOf(name, 1 ));
        // eslint-disable-next-line no-console
        console.log(mainFilterValues)
        /* setFilter({ ...filter, mainFilter: {filter.mainFilter[filterName]: name} }); */
        setState({ ...state, subFilter: true });
    };
    const handleChange = (
        event: React.ChangeEvent<{ value: unknown }>
    ): void => {
        const name = event.target.value as string;
        setFilter({ ...filter, filterValue: name });
    };

    const handleAdd = (): void => {
        setState({ ...state, numberOfFilters: state.numberOfFilters += 1 });
    };
    const handleRemove = (): void => {
        setState({ ...state, numberOfFilters: state.numberOfFilters -= 1 });
        /* remove filter.mainFilter[filterName] and Add it tomainFilterValues */
    };


    const mainSelectorItems = mainFilterValues.map((item: string) => (
        <SelectorItem item={item} />
    ));
    const filterValues = dataValue.data.uniqueValues;
    const selectorItems = filterValues.map((item: string) => (
        <SelectorItem item={item} />
    ));

    // eslint-disable-next-line no-console
    console.log(filter);

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
                    for (let i = 0; i < state.numberOfFilters; i += 1) {
                        elements.push(
                            <div>
                                <div css={mainSelectorAreaStyle} key={i}>
                                    <FormControl
                                        variant="filled"
                                        css={selectorStyle}
                                    >
                                        <Select
                                            native
                                            value={filter.mainFilter[filterName]}
                                            onChange={handleMainFilterChange}
                                            inputProps={{
                                                name: "filter",
                                                id: "filled-znData",
                                            }}
                                        >
                                            <option value="">
                                                {t("Drawer.Selector")}
                                            </option>
                                            {mainSelectorItems}
                                        </Select>
                                    </FormControl>
                                    <IconButton
                                        css={iconButtonStyle}
                                        onClick={handleRemove}
                                    >
                                        <RemoveCircleIcon css={iconStyle} />
                                    </IconButton>
                                </div>

                                <div
                                    css={
                                        state.subFilter
                                            ? mainSelectorAreaStyle
                                            : subSelectorAreaStyle
                                    }
                                    key={i}
                                >
                                    <FormControl
                                        variant="filled"
                                        css={selectorStyle}
                                    >
                                        <Select
                                            native
                                            value={filter.filterValue}
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
