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

const optionsStyle = css`
    margin-top: 0;
    display: flex;
    flex-direction: row;
`;
const optionsHeadingStyle = css`
    margin: auto 1em auto 0;
    font-weight: bold;
`;
const BlueRadio = withStyles(() =>
    createStyles({
        root: {
            color: bfrDarkgrey,
            "&$checked": {
                color: primaryColor,
            },
        },
        checked: {},
    })
)(Radio);

/**
 * @desc Returns the option bar to display the table numbers as absolute numbers or in percent 
 * @returns {JSX.Element} - option bar component
 */
export function ResultsTableOptionsComponent(): JSX.Element {
    return (
        <div css={optionsStyle}>
            <p css={optionsHeadingStyle}>Display options:</p>
            <FormControl component="fieldset">
                <RadioGroup row aria-label="options" name="options">
                    <FormControlLabel
                        value="absolute"
                        control={<BlueRadio size="small" />}
                        label="Absolute numbers"
                    />
                    <FormControlLabel
                        value="percent"
                        control={<BlueRadio size="small" />}
                        label="Percent"
                    />
                </RadioGroup>
            </FormControl>
        </div>
    );
}
