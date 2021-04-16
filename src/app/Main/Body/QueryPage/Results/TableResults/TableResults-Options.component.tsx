/** @jsx jsx */
import { css, jsx } from "@emotion/core";
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
const checkboxStyle = css`
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
    const handleChangeRadio = (eventTargetValue: string): void =>
        props.onRadioChange(eventTargetValue);

    const handleChangeCheckbox = (checked: boolean): void => {
        props.onCheckboxChange(checked);
    };

    return (
        <div>
            <p css={optionsHeadingStyle}>Display options:</p>
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
                        label="Absolute numbers"
                    />
                    <FormControlLabel
                        css={radioButtonSizeStyle}
                        value="relative"
                        control={<BlueRadio color="default" size="small" />}
                        label="Percentage"
                    />
                </RadioGroup>
                <FormControlLabel
                    css={checkboxStyle}
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
                    label="show column and row sum"
                />
            </FormControl>
        </div>
    );
}
