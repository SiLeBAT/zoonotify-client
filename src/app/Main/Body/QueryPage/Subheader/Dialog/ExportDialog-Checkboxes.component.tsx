import { useTranslation } from "react-i18next";
import {
    CheckboxesComponent,
    CheckboxesConfig,
} from "../../../../../Shared/Checkboxes.component";

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
export function ExportDialogCheckboxesComponent(
    props: CheckboxesProps
): JSX.Element {
    const { t } = useTranslation(["Export"]);

    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    const checkboxObjectList: CheckboxesConfig[] = [
        { name: "raw", label: t("Checkbox.DataSet"), checked: props.isRaw },
        { name: "stat", label: t("Checkbox.Stat"), checked: props.isStat },
    ];

    return CheckboxesComponent({
        onCheckboxChange: handleChangeCheckbox,
        checkboxes: checkboxObjectList,
        size: "default"
    });
}
