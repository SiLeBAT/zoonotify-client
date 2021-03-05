/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Checkbox, FormControlLabel, FormGroup } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const checkboxStyle = css`
    margin-left: 2rem;
`;

export interface CheckboxesProps {
    handleCheckbox: (name: string, checked: boolean) => void;
    raw: boolean;
    stat: boolean;
}

/**
 * @desc Returns the checkboxes to decide which data should be exported.
 * @param {(name: string, checked: boolean) => void} onChange - function to select/deselect the checkbox
 * @param {boolean} raw - true if dataset is selected for export
 * @param {boolean} stat - true if statistic data is selected for export
 * @returns {JSX.Element} - checkboxes component
 */
export function ExportCheckboxesComponent(props: CheckboxesProps): JSX.Element {
    const { t } = useTranslation(["Export"]);

    return (
        <FormGroup css={checkboxStyle}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={props.raw}
                        onChange={(event) =>
                            props.handleCheckbox(
                                event.target.name,
                                event.target.checked
                            )
                        }
                        name="raw"
                        color="primary"
                    />
                }
                label={t("Checkbox.DataSet")}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={props.stat}
                        onChange={(event) =>
                            props.handleCheckbox(
                                event.target.name,
                                event.target.checked
                            )
                        }
                        name="stat"
                        color="primary"
                    />
                }
                label={t("Checkbox.Stat")}
            />
        </FormGroup>
    );
}
