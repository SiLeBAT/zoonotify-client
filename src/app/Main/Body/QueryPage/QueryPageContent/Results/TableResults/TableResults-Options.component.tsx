import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Radio,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Box,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/system";
import { DisplayOptionType } from "../../../../../../Shared/Context/DataContext";
import { CheckboxesComponent } from "../../../../../../Shared/Checkboxes.component";
import {
    smallSize,
    smallToggleStyle,
} from "../../../../../../Shared/Style/SmallToggleStyle";
import { SumOptions } from "./TableResults.model";

/**
 * @desc Returns the option bar to display the table numbers as absolute or as relative numbers.
 * @param props - function to handle change of radio button
 * @returns {JSX.Element} - option bar component
 */
export function ResultsTableOptionsComponent(props: {
    sumOptions: SumOptions;
    tableOption: DisplayOptionType;
    onDisplayOptionsChange: (displayOption: string) => void;
    onChangeSumOptions: (sumOptions: SumOptions) => void;
}): JSX.Element {
    const [sumOptions, setSumOptions] = useState<SumOptions>(props.sumOptions);
    const { t } = useTranslation(["QueryPage"]);
    const theme = useTheme();

    const radioButtonStyle = {
        "&.Mui-checked": {
            color: theme.palette.primary.main,
        },
    };

    const handleChangeDisplayOptions = (displayOption: string): void =>
        props.onDisplayOptionsChange(displayOption);

    const handleSumOptionsCheckboxChange = (
        name: string,
        checked: boolean
    ): void => {
        const newIsSumOptions = { ...sumOptions, [name]: checked };
        setSumOptions(newIsSumOptions);
        props.onChangeSumOptions(newIsSumOptions);
    };

    const optionsHeading = t("OptionBar.Title");
    const absoluteText = t("OptionBar.Absolute");
    const percentageText = t("OptionBar.Percent");
    const sumColText = t("Sums.ColSum");
    const sumRowText = t("Sums.RowSum");

    return (
        <div>
            <Typography
                component="p"
                sx={{
                    margin: "auto 2em auto 0",
                    fontWeight: "bold",
                    fontSize: `${smallSize}rem`,
                }}
            >
                {optionsHeading}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <FormControl component="fieldset">
                    <RadioGroup
                        sx={{
                            marginBottom: "9px",
                        }}
                        aria-label="options"
                        name="options"
                        value={props.tableOption}
                        onChange={(event) =>
                            handleChangeDisplayOptions(event.target.value)
                        }
                    >
                        <FormControlLabel
                            sx={smallToggleStyle}
                            value="absolute"
                            control={
                                <Radio
                                    sx={radioButtonStyle}
                                    color="default"
                                    size="small"
                                />
                            }
                            label={absoluteText}
                        />
                        <FormControlLabel
                            sx={smallToggleStyle}
                            value="relative"
                            control={
                                <Radio
                                    sx={radioButtonStyle}
                                    color="default"
                                    size="small"
                                />
                            }
                            label={percentageText}
                        />
                    </RadioGroup>
                </FormControl>
                {CheckboxesComponent({
                    onCheckboxChange: handleSumOptionsCheckboxChange,
                    checkboxes: [
                        {
                            name: "showColSum",
                            label: sumColText,
                            checked: props.sumOptions.showColSum,
                        },
                        {
                            name: "showRowSum",
                            label: sumRowText,
                            checked: props.sumOptions.showRowSum,
                        },
                    ],
                    size: "small",
                })}
            </Box>
        </div>
    );
}
