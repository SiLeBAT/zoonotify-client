/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React, { useContext } from "react";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { InputLabel, Input, Chip, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import { DataContext } from "../../../../../Shared/Context/DataContext";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";
import {
    FilterType,
    mainFilterAttributes,
} from "../../../../../Shared/Filter.model";

const filterHeadingStyle = css`
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 2rem;
    color: ${primaryColor};
`;
const filterSubheadingStyle = css`
    margin: 2.5em 0 0 0;
    font-weight: bold;
    font-size: 1rem;
`;

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

export function FilterSettingsComponent(): JSX.Element {
    const classes = useStyles();
    const { data } = useContext(DataContext);
    const { filter, setFilter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);
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

    const mainFilterLabels = [t("Drawer.Filters.Pathogen")]
    const totalNumberOfFilters: number = mainFilterAttributes.length;

    return (
        <div>
            <h3 css={filterHeadingStyle}>{t("Drawer.Title")}</h3>
            <h4 css={filterSubheadingStyle}>{t("Drawer.Subtitles.Filter")}</h4>
            {(function AddSelectorElements(): JSX.Element[] {
                const elements: JSX.Element[] = [];
                for (let i = 0; i < totalNumberOfFilters; i += 1) {
                    const filterAttribute: FilterType = mainFilterAttributes[i];
                    const filterValues: string[] = filter[filterAttribute];
                    elements.push(
                        <FormControl className={classes.formControl}>
                            <InputLabel id={`label${i}`}>
                                {mainFilterLabels[i]}
                            </InputLabel>
                            <Select
                                labelId={`label${i}`}
                                id={`selector-id-${i}`}
                                multiple
                                value={filterValues}
                                onChange={(e) =>
                                    handleChange(e, filterAttribute)
                                }
                                input={
                                    <Input id={`select-multiple-chip-${i}`} />
                                }
                                renderValue={(selected) => (
                                    <div className={classes.chips}>
                                        {(selected as string[]).map((value) => (
                                            <Chip
                                                key={value}
                                                label={value}
                                                className={classes.chip}
                                            />
                                        ))}
                                    </div>
                                )}
                                MenuProps={MenuProps}
                            >
                                {data.uniqueValues[filterAttribute].map(
                                    (mainFilterValue) => (
                                        <MenuItem
                                            key={mainFilterValue}
                                            value={mainFilterValue}
                                        >
                                            {mainFilterValue}
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>
                    );
                }
                return elements;
            })()}
        </div>
    );
}
