/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import {
    Radio,
    FormControl,
    FormGroup,
    FormControlLabel,
    RadioGroup,
    withStyles,
    createStyles,
    Checkbox,
} from "@material-ui/core";
import {
    bfrDarkgrey,
    primaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";
import { DisplayOptionType } from "../../../../../Shared/Context/TableContext";

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
const radioButtonSizeStyle = css`
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
const checkBoxLabelStyle = css`
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
    isSumRowCol: { rowSum: boolean; colSum: boolean };
    tableOption: DisplayOptionType;
    onDisplayOptionsChange: (displayOption: string) => void;
    onShowRowSumToggle: (showSums: boolean) => void;
    onShowColSumToggle: (showSums: boolean) => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const handleChangeDisplayOptions = (displayOption: string): void =>
        props.onDisplayOptionsChange(displayOption);

    const handleChangeShowRowSumToggle = (showSums: boolean): void => {
        props.onShowRowSumToggle(showSums);
    };
    const handleChangeShowColSumToggle = (showSums: boolean): void => {
        props.onShowColSumToggle(showSums);
    };

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
                            css={radioButtonSizeStyle}
                            value="absolute"
                            control={<BlueRadio color="default" size="small" />}
                            label={absoluteText}
                        />
                        <FormControlLabel
                            css={radioButtonSizeStyle}
                            value="relative"
                            control={<BlueRadio color="default" size="small" />}
                            label={percentageText}
                        />
                    </RadioGroup>
                </FormControl>
                <FormGroup>
                    <FormControlLabel
                        css={checkBoxLabelStyle}
                        control={
                            <Checkbox
                                checked={props.isSumRowCol.colSum}
                                onChange={(event) =>
                                    handleChangeShowColSumToggle(
                                        event.target.checked
                                    )
                                }
                                name="displaySumCol"
                                color="primary"
                            />
                        }
                        label={sumColText}
                    />
                    <FormControlLabel
                        css={checkBoxLabelStyle}
                        control={
                            <Checkbox
                                checked={props.isSumRowCol.rowSum}
                                onChange={(event) =>
                                    handleChangeShowRowSumToggle(
                                        event.target.checked
                                    )
                                }
                                name="displaySumRow"
                                color="primary"
                            />
                        }
                        label={sumRowText}
                    />
                </FormGroup>
            </div>
        </div>
    );
}
