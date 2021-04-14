/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Checkbox, FormControlLabel, FormGroup } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const checkboxStyle = css`
    margin-left: 2rem;
`;

export interface CheckboxesProps {
    onCheckboxChange: (name: string, checked: boolean) => void;
    /**
     * true if dataset is selected for export
     */
    raw: boolean;
    /**
     *  true if statistic data is selected for export
     */
    stat: boolean;
}

/**
 * @desc Returns the checkboxes to decide which data should be exported.
 * @param props
 * @returns {JSX.Element} - checkboxes component
 */
export function ExportCheckboxesComponent(props: CheckboxesProps): JSX.Element {
    const { t } = useTranslation(["Export"]);

    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    return (
        <FormGroup css={checkboxStyle}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={props.raw}
                        onChange={(event) =>
                            handleChangeCheckbox(
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
                            handleChangeCheckbox(
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
