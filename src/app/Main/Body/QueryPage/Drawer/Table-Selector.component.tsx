import React from "react";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { InputLabel } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1),
            marginLeft: "16px",
            marginRight: "16px",
            width: "23em",
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    })
);

interface SelectorProps {
    index: string;
    label: string;
    inputProps: {
        name: string;
        id: string;
    };
    child: JSX.Element[];
}

export function TableSelectorComponent(props: SelectorProps): JSX.Element {
    const [state, setState] = React.useState<{
        row: string;
        column: string;
    }>({
        row: "",
        column: "",
    });
    const classes = useStyles();

    const handleChange = (
        event: React.ChangeEvent<{ name?: string; value: unknown }>
    ): void => {
        setState({
            ...state,
            row: event.target.value as string,
        });
    };

    return (
        <div>
            <FormControl className={classes.formControl}>
                <InputLabel id={`label-${props.index}`}>
                    {props.label}
                </InputLabel>
                <Select
                    native
                    value={state.row}
                    onChange={(e) => handleChange(e)}
                    inputProps={props.inputProps}
                >
                    <option aria-label="None" value="" />
                    {props.child}
                </Select>
            </FormControl>
        </div>
    );
}