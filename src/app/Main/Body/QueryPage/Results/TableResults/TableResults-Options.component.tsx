/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import {
    Radio,
    FormControl,
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
    width: 100%;
    display: "flex";
    margin-top: 9px;
    flex-direction: row;
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
    isSumRowCol: boolean;
    tableOption: DisplayOptionType;
    onRadioChange: (eventTargetValue: string) => void;
    onCheckboxChange: (checked: boolean) => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const handleChangeRadio = (eventTargetValue: string): void =>
        props.onRadioChange(eventTargetValue);

    const handleChangeCheckbox = (checked: boolean): void => {
        props.onCheckboxChange(checked);
    };

    const optionsHeading = t("OptionBar.Title")
    const absoluteText = t("OptionBar.Absolute");
    const percentageText = t("OptionBar.Percent");
    const sumRowColText = t("OptionBar.Sum")

    return (
        <div>
            <p css={optionsHeadingStyle}>{optionsHeading}</p>
            <FormControl css={optionsStyle} component="fieldset">
                <RadioGroup
                    css={css`
                        margin-bottom: 9px;
                    `}
                    aria-label="options"
                    name="options"
                    value={props.tableOption}
                    onChange={(event) => handleChangeRadio(event.target.value)}
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
                <FormControlLabel
                    css={checkBoxLabelStyle}
                    control={
                        <Checkbox
                            checked={props.isSumRowCol}
                            onChange={(event) =>
                                handleChangeCheckbox(event.target.checked)
                            }
                            name="raw"
                            color="primary"
                        />
                    }
                    label={sumRowColText}
                />
            </FormControl>
        </div>
    );
}
