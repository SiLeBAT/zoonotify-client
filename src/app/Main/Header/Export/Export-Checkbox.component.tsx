/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Checkbox, FormControlLabel, FormGroup } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const checkboxStyle = css`
    margin-left: 2rem;
`;

interface CheckboxProps {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    raw: boolean;
    stat: boolean;
}

export function CheckBoxComponent(props: CheckboxProps): JSX.Element {
    const { t } = useTranslation(["Export"]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        props.onChange(event);
    };

    return (
        <FormGroup css={checkboxStyle}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={props.raw}
                        onChange={handleChange}
                        name="raw"
                        color="primary"
                    />
                }
                label={t("Checkbox.RAW")}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={props.stat}
                        onChange={handleChange}
                        name="stat"
                        color="primary"
                    />
                }
                label={t("Checkbox.Stat")}
            />
        </FormGroup>
    );
}
