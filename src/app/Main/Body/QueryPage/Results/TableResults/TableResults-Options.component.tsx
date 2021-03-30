/** @jsx jsx */
import { css, jsx } from "@emotion/core";
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

const size = 0.75;

const optionsStyle = css`
    display: "flex";
    margin-top: 0;
    flex-direction: row;
`;
const optionsHeadingStyle = css`
    margin: auto 2em auto 0;
    font-weight: bold;
    font-size: ${size}rem;
`;
const radioButtonSizeStyle = css`
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
 * @desc Returns the option bar to display the table numbers as absolute numbers or in relative
 * @param props - function to handle change of radio button
 * @returns {JSX.Element} - option bar component
 */
export function ResultsTableOptionsComponent(props: {
    tableOption: DisplayOptionType;
    onRadioChange: (eventTargetValue: string) => void;
}): JSX.Element {
    const handleChange = (eventTargetValue: string): void =>
        props.onRadioChange(eventTargetValue);

    return (
        <div css={optionsStyle}>
            <p css={optionsHeadingStyle}>Display options:</p>
            <FormControl component="fieldset">
                <RadioGroup
                    row
                    aria-label="options"
                    name="options"
                    value={props.tableOption}
                    onChange={(event) => handleChange(event.target.value)}
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
            </FormControl>
        </div>
    );
}
