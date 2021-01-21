/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
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
import {
    OptionType,
    TableContext,
} from "../../../../../Shared/Context/TableContext";

const size = 0.75;

const optionsStyle = (isTable: boolean): SerializedStyles => css`
    display: ${isTable ? "flex" : "none"};
    margin-top: 0;
    flex-direction: row;
`;
const optionsHeadingStyle = css`
    margin: auto 2em auto 0;
    font-weight: bold;
    font-size: ${size}rem;
`;
const sizeStyle = css`
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
 * @desc Returns the option bar to display the table numbers as absolute numbers or in percent
 * @returns {JSX.Element} - option bar component
 */
export function ResultsTableOptionsComponent(props: {
    isTable: boolean;
}): JSX.Element {
    const { table, setTable } = useContext(TableContext);

    const handleRadioChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const optionValue = (event.target as HTMLInputElement)
            .value as OptionType;
        setTable({
            ...table,
            option: optionValue,
        });
    };

    return (
        <div css={optionsStyle(props.isTable)}>
            <p css={optionsHeadingStyle}>Display options:</p>
            <FormControl component="fieldset">
                <RadioGroup
                    row
                    aria-label="options"
                    name="options"
                    value={table.option}
                    onChange={handleRadioChange}
                >
                    <FormControlLabel
                        css={sizeStyle}
                        value="absolute"
                        control={<BlueRadio color="default" size="small" />}
                        label="Absolute numbers"
                    />
                    <FormControlLabel
                        css={sizeStyle}
                        value="percent"
                        control={<BlueRadio color="default" size="small" />}
                        label="Percent"
                    />
                </RadioGroup>
            </FormControl>
        </div>
    );
}
