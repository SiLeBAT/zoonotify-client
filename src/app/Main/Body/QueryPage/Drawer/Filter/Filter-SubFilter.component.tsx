/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React, { /* useState, */ useContext } from "react";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
/* import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle"; */
import { useTranslation } from "react-i18next";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";
import { DataContext } from "../../../../../Shared/Context/DataContext";
import { SelectorItem } from "../Drawer-SelectorItem.component";



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

export function SubFilterComponent(): JSX.Element {
/*     const [state, setState] = useState<{
        numberOfFilters: number;
        subFilter: boolean;
    }>({
        numberOfFilters: 1,
        subFilter: false,
    }); */
    const { filter, setFilter } = useContext(FilterContext);
    const dataValue = useContext(DataContext);

    const { t } = useTranslation(["QueryPage"]);

    /**
     * @desc takes the current value of the selector with the onChange envent handler and sets it as filter value (in the Context).
     * @param React.ChangeEvent An onChange event handler returns a Synthetic Event object which contains meta data (target input’s id, name, current value)
     */
    /*     const handleMainFilterChange = (
        event: React.ChangeEvent<{ value: unknown }>
    ): void => {
        const name = event.target.value as string;
        setFilter({ ...filter, mainFilter: name });
        setState({...state, subFilter: true})
    }; */
    const handleChange = (
        event: React.ChangeEvent<{ value: unknown }>
    ): void => {
        const name = event.target.value as string;
        setFilter({ ...filter, filterValue: name });
    };


    /*    const mainFilterValues = ["Erreger", "Matrix"];
    

    const mainSelectorItems = mainFilterValues.map((item: string) => (
        <SelectorItem item={item} />
    )); */
    const filterValues = dataValue.data.uniqueValues;
    const selectorItems = filterValues.map((item: string) => (
        <SelectorItem item={item} />
    ));

    // eslint-disable-next-line no-console
    console.log(filter);

    return (
        <FormControl variant="filled" css={selectorStyle}>
            <Select
                native
                value={filter.filterValue}
                onChange={handleChange}
                inputProps={{
                    name: "filter",
                    id: "filled-age-native-simple",
                }}
            >
                <option value="">{t("Drawer.Selector")}</option>
                {selectorItems}
            </Select>
        </FormControl>
    );
}
