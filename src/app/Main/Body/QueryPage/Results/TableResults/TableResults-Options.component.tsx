/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
    Radio,
    FormControl,
    FormControlLabel,
    RadioGroup,
    withStyles,
    createStyles,
} from "@material-ui/core";
import {
    bfrDarkgrey,
    primaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";
import { DisplayOptionType } from "../../../../../Shared/Context/TableContext";
import { CheckboxesComponent } from "../../../../../Shared/Checkboxes.component";
import { SumOptions } from "./TableResults.mode";

const size = 0.75;

const optionsStyle = css`
    display: flex;
    justify-content: space-between;
`;
const optionsHeadingStyle = css`
    margin: auto 2em auto 0;
    font-weight: bold;
    font-size: ${size}rem;
`;
const toggleStyle = css`
    margin-right: 0;
    span {
        padding: 0px;
        margin-left: 5px;
        font-size: ${size}rem;
    }
    svg {
        width: ${size}em;
        height: ${size}em;
    }
`;

const BlueRadio = withStyles(() =>
    createStyles({
        root: {
            color: bfrDarkgrey,
            "&$checked": {
                color: primaryColor,
            },
            "input:hover ~ &": {
                backgroundColor: "green",
            },
        },
        checked: {},
    })
)(Radio);

/**
 * @desc Returns the option bar to display the table numbers as absolute or as relative numbers.
 * @param props - function to handle change of radio button
 * @returns {JSX.Element} - option bar component
 */
export function ResultsTableOptionsComponent(props: {
    isSumRowCol: { showRowSum: boolean; showColSum: boolean };
    tableOption: DisplayOptionType;
    onDisplayOptionsChange: (displayOption: string) => void;
    onShowRowColSum: (isSumRowCol: {
        showRowSum: boolean;
        showColSum: boolean;
    }) => void;
}): JSX.Element {
    const [isSumRowCol, setIsSumRowCol] = useState<SumOptions>({
        showRowSum: true,
        showColSum: true,
    });
    const { t } = useTranslation(["QueryPage"]);
    const handleChangeDisplayOptions = (displayOption: string): void =>
        props.onDisplayOptionsChange(displayOption);

    const handleRowSumCheckboxChange = (name: string, checked: boolean): void => {
            const newIsSumRowCol = { ...isSumRowCol, [name]: checked }
            setIsSumRowCol(newIsSumRowCol);
            props.onShowRowColSum(newIsSumRowCol);
    }
        

    const optionsHeading = t("OptionBar.Title");
    const absoluteText = t("OptionBar.Absolute");
    const percentageText = t("OptionBar.Percent");
    const sumColText = t("Sums.ColSum");
    const sumRowText = t("Sums.RowSum");

    return (
        <div>
            <p css={optionsHeadingStyle}>{optionsHeading}</p>
            <div css={optionsStyle}>
                <FormControl component="fieldset">
                    <RadioGroup
                        css={css`
                            margin-bottom: 9px;
                        `}
                        aria-label="options"
                        name="options"
                        value={props.tableOption}
                        onChange={(event) =>
                            handleChangeDisplayOptions(event.target.value)
                        }
                    >
                        <FormControlLabel
                            css={toggleStyle}
                            value="absolute"
                            control={<BlueRadio color="default" size="small" />}
                            label={absoluteText}
                        />
                        <FormControlLabel
                            css={toggleStyle}
                            value="relative"
                            control={<BlueRadio color="default" size="small" />}
                            label={percentageText}
                        />
                    </RadioGroup>
                </FormControl>
                {CheckboxesComponent({
                    onCheckboxChange: handleRowSumCheckboxChange,
                    checkboxes: [
                        {
                            name: "showColSum",
                            label: sumColText,
                            checked: props.isSumRowCol.showColSum,
                        },
                        {
                            name: "showRowSum",
                            label: sumRowText,
                            checked: props.isSumRowCol.showRowSum,
                        },
                    ],
                    style: toggleStyle,
                })}
            </div>
        </div>
    );
}
