/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React, { useContext } from "react";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { InputLabel } from "@material-ui/core";
import { TableContext, TableType } from "../../../../../Shared/Context/TableContext";
import { FilterType } from "../../../../../Shared/Filter.model";
import { RemoveFilterComponent } from "../Filter/Filter-RemoveFilter.component";

const selectorStyle = css`
    flex-grow: 2;
`;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1),
            marginLeft: "16px",
            marginRight: "16px",
            width: "23em",
            display: "flex",
            flexDirection: "row",
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    })
);

interface SelectorProps {
    label: string;
    inputProps: {
        name: TableType;
        id: string;
    };
    child: JSX.Element[];
}

export function TableSelectorComponent(props: SelectorProps): JSX.Element {
    const { table, setTable } = useContext(TableContext)
    const classes = useStyles();

    const handleChange = (
        event: React.ChangeEvent<{ value: unknown }>,
        keyName: TableType
    ): void => {
        setTable({
            ...table,
            [keyName]: event.target.value as FilterType,
        });
    };

    return (
        <div>
            <FormControl className={classes.formControl}>
                <InputLabel id={`label-${props.inputProps.name}`}>
                    {props.label}
                </InputLabel>
                <Select
                    native
                    value={table[props.inputProps.name]}
                    onChange={(e) => handleChange(e, props.inputProps.name)}
                    inputProps={props.inputProps}
                    css={selectorStyle}
                >
                    <option aria-label="None" value="" />
                    {props.child}
                </Select>
                <RemoveFilterComponent mainButton={false} filterAttribute={props.inputProps.name} isFilter={false} isTabel />
            </FormControl>
        </div>
    );
}