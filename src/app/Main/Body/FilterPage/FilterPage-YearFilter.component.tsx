import React from 'react';
import { createStyles, makeStyles, useTheme, Theme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
            maxWidth: 300,
        },
        chips: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        chip: {
            margin: 2,
        },
        noLabel: {
            arginTop: theme.spacing(3),
        },
    }),
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

const names = [
    '2019',
    '2018',
    '2017',
    '2016',
];

interface GetStyleProps{
    name: string, 
    personName: string[], 
    theme: Theme
}

function getStyles(props: GetStyleProps):{ fontWeight: number | "inherit" | "initial" | "-moz-initial" | "revert" | "unset" | "normal" | "bold" | "bolder" | "lighter" | undefined; } {
    return {
        fontWeight:
        !props.personName.includes(props.name)
            ? props.theme.typography.fontWeightRegular
            : props.theme.typography.fontWeightMedium,
    };
}


export function MultipleSelect(): JSX.Element {
    const { t } = useTranslation(['FilterPage']);
    const classes = useStyles();
    const theme = useTheme();
    const [personName, setPersonName] = React.useState<string[]>([]);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>):void => {
        setPersonName(event.target.value as string[]);
    };

    return (
        <FormControl className={classes.formControl}>
            <InputLabel id="demo-mutiple-chip-label">{t('Filter.SelectorLable')}</InputLabel>
            <Select
                labelId="demo-mutiple-chip-label"
                id="demo-mutiple-chip"
                multiple
                value={personName}
                onChange={handleChange}
                input={<Input id="select-multiple-chip" />}
                renderValue={(selected) => (
                    <div className={classes.chips}>
                    {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} className={classes.chip} />
                    ))}
                    </div>
                )}
                MenuProps={MenuProps}
                >
                {names.map((name) => (
                    <MenuItem key={name} value={name} style={getStyles({name, personName, theme})}>
                    {name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}