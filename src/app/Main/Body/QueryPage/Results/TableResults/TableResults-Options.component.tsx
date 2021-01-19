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
import { useContext } from "react";
import {
    bfrDarkgrey,
    primaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";
import { OptionType, TableContext } from "../../../../../Shared/Context/TableContext";

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
            'input:hover ~ &': {
                backgroundColor: 'green',
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
    const { table, setTable } = useContext(TableContext); 

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const optionValue = (event.target as HTMLInputElement).value as OptionType
        setTable({
            ...table,
            option: optionValue,
        })
    };

    return (
        <div css={optionsStyle}>
            <p css={optionsHeadingStyle}>Display options:</p>
            <FormControl component="fieldset">
                <RadioGroup row aria-label="options" name="options" value={table.option} onChange={handleRadioChange}>
                    <FormControlLabel
                        value="absolute"
                        control={<BlueRadio color="default" size="small" />}
                        label="Absolute numbers"
                    />
                    <FormControlLabel
                        value="percent"
                        control={<BlueRadio color="default" size="small" />}
                        label="Percent"
                    />
                </RadioGroup>
            </FormControl>
        </div>
    );
}
