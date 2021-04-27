import React from "react";
import { FormGroup } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { CheckboxComponent } from "../../../../Shared/Checkbox.component";


export interface CheckboxesProps {
    onCheckboxChange: (name: string, checked: boolean) => void;
    /**
     * true if dataset is selected for export
     */
    isRaw: boolean;
    /**
     *  true if statistic data is selected for export
     */
    isStat: boolean;
}

/**
 * @desc Returns the checkboxes to decide which data should be exported.
 * @param props
 * @returns {JSX.Element} - checkboxes component
 */
export function ExportDialogCheckboxesComponent(props: CheckboxesProps): JSX.Element {
    const { t } = useTranslation(["Export"]);

    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    return (
        <FormGroup>
            <CheckboxComponent
                onCheckboxChange={handleChangeCheckbox}
                checked={props.isRaw}
                key="checkbox-raw-data"
                name="raw"
                label={t("Checkbox.DataSet")}
            />
            <CheckboxComponent
                onCheckboxChange={handleChangeCheckbox}
                checked={props.isStat}
                key="checkbox-stat-data"
                name="stat"
                label={t("Checkbox.Stat")}
            />
        </FormGroup>
    );
}
