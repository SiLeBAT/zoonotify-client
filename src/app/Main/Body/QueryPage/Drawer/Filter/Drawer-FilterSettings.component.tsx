/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext, ReactNode } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Chip, MenuItem, Input } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import { DataContext } from "../../../../../Shared/Context/DataContext";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";
import {
    FilterType,
    mainFilterAttributes,
} from "../../../../../Shared/Filter.model";
import { FilterSelectorComponent } from "./Filter-Selector.component";
import { RemoveFilterComponent } from "./Filter-RemoveFilter.component";

const filterHeadingStyle = css`
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 2rem;
    color: ${primaryColor};
`;
const filterAreaStyle = css`
    display: flex;
    flex-direction: row;
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

export function FilterSettingsComponent(): JSX.Element {
    const classes = useStyles();
    const { data } = useContext(DataContext);
    const { filter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);

    const randerValues = (selected: unknown): ReactNode => (
        <div className={classes.chips}>
            {(selected as string[]).map((value) => (
                <Chip key={value} label={value} className={classes.chip} />
            ))}
        </div>
    );

    const mainItemChild = (values: string[]): JSX.Element[] =>
        values.map((mainFilterValue) => (
            <MenuItem key={mainFilterValue} value={mainFilterValue}>
                {mainFilterValue}
            </MenuItem>
        ));

    const inputElement = (key: FilterType): JSX.Element => (
        <Input id={`select-multiple-chip-id-${key}`} />
    );

    const totalNumberOfFilters: number = mainFilterAttributes.length;

    return (
        <div>
            <h3 css={filterHeadingStyle}>{t("Drawer.Title")}</h3>
            <div css={filterAreaStyle}>
                <h4 css={filterSubheadingStyle}>
                    {t("Drawer.Subtitles.Filter")}
                </h4>
                <RemoveFilterComponent mainButton filterAttribute="all" />
            </div>
            {(function AddSelectorElements(): JSX.Element[] {
                const elements: JSX.Element[] = [];
                for (let i = 0; i < totalNumberOfFilters; i += 1) {
                    const filterAttribute: FilterType = mainFilterAttributes[i];
                    const filterValues: string[] = filter[filterAttribute];
                    elements.push(
                        <FilterSelectorComponent
                            key={`filter-selector-${filterAttribute}`}
                            index={i}
                            label={t(`Filters.${filterAttribute}`)}
                            filterAttribute={filterAttribute}
                            filterValues={filterValues}
                            inputElement={inputElement(filterAttribute)}
                            randerValues={randerValues}
                            child={mainItemChild(
                                data.uniqueValues[filterAttribute]
                            )}
                        />
                    );
                }
                return elements;
            })()}
        </div>
    );
}
