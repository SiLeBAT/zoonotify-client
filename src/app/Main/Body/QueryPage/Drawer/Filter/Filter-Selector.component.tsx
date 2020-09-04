import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { InputLabel } from "@material-ui/core";
import { FilterType } from "../../../../../Shared/Filter.model";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";
import { createPathString } from "../../../../../Core/createFilterPath.service";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1),
            marginLeft: "16px",
            marginRight: "16px",
            width: "23em",
        },
        chips: {
            display: "flex",
            flexWrap: "wrap",
        },
        chip: {
            margin: 2,
        },
        noLabel: {
            marginTop: theme.spacing(3),
        },
    })
);
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

interface SelectorProps {
    index: number;
    label: string;
    filterValues: string[];
    filterAttribute: FilterType;
    inputElement: JSX.Element;
    randerValues: ((value: unknown) => React.ReactNode) | undefined;
    child: JSX.Element[];
}

export function FilterSelectorComponent(props: SelectorProps): JSX.Element {
    const history = useHistory();
    const classes = useStyles();
    const {filter, setFilter} = useContext(FilterContext);


    /**
     * @desc takes the current value of the selector with the onChange envent handler and sets it as filter value (in the Context).
     * @param React.ChangeEvent An onChange event handler returns a Synthetic Event object which contains meta data (target input’s id, name, current value)
     */
    const handleChange = (
        event: React.ChangeEvent<{ value: unknown }>,
        keyName: FilterType
    ): void => {
        setFilter({
            ...filter,
            [keyName]: event.target.value as string[],
        });
    };

    useEffect((): void => {
        history.push(`?${createPathString(filter)}`);
    }, [filter]);

    return (
        <FormControl className={classes.formControl}>
            <InputLabel id={`label${props.index}`}>{props.label}</InputLabel>
            <Select
                labelId={`label${props.index}`}
                id={`selector-id-${props.index}`}
                multiple
                value={props.filterValues}
                onChange={(e) => handleChange(e, props.filterAttribute)}
                input={props.inputElement}
                renderValue={props.randerValues}
                MenuProps={MenuProps}
            >
                {props.child}
            </Select>
        </FormControl>
    );
}
