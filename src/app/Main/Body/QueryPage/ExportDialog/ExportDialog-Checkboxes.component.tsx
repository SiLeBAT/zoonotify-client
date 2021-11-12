import { useTranslation } from "react-i18next";
import {
    CheckboxesComponent,
    CheckboxesConfig,
} from "../../../../Shared/Checkboxes.component";

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
    isChart: boolean;
    nrOfIsolates: number;
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

    const rawCheckboxLabel = `${t("Checkbox.Raw")} (${props.nrOfIsolates} ${t(
        "Checkbox.Raw_Isolates"
    )}) ${t("Checkbox.Csv")}`;

    const statCheckboxLabel = `${t("Checkbox.Stat")}  ${t("Checkbox.Csv")}`;

    const chartCheckboxLabel = `${t("Checkbox.Chart")}  ${t("Checkbox.Png")}`;

    const checkboxObjectList: CheckboxesConfig[] = [
        { name: "raw", label: rawCheckboxLabel, checked: props.isRaw },
        { name: "stat", label: statCheckboxLabel, checked: props.isStat },
        { name: "chart", label: chartCheckboxLabel, checked: props.isChart },
    ];

    return CheckboxesComponent({
        onCheckboxChange: handleChangeCheckbox,
        checkboxes: checkboxObjectList,
        size: "default",
    });
}
