import React from "react";
import { v4 as uuidv4 } from "uuid";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import { EvaluationEntry } from "../model/Evaluations.model";
import { EvaluationsCardComponent } from "./EvaluationCardComponent";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
type EvaluationDivisionDataProps = {
    data: EvaluationEntry[];
    downloadGraphButtonText: string;
    downloadDataButtonText: string;
};

export function EvaluationDivisionDataComponent({
    data,
    downloadGraphButtonText,
    downloadDataButtonText,
}: EvaluationDivisionDataProps): JSX.Element {
    const { t } = useTranslation(["ExplanationPage"]);

    return (
        <div>
            {data &&
                data.length > 0 &&
                data.map((evaluation) => (
                    <ZNAccordion
                        key={`accordion-${uuidv4()}`}
                        title={evaluation.title}
                        content={
                            <EvaluationsCardComponent
                                title={evaluation.title}
                                id={evaluation.id}
                                description={evaluation.description}
                                chartPath={evaluation.chartPath}
                                dataPath={evaluation.dataPath}
                                downloadGraphButtonText={
                                    downloadGraphButtonText
                                }
                                downloadDataButtonText={downloadDataButtonText}
                            />
                        }
                        defaultExpanded={false}
                        centerContent
                    />
                ))}
            {data && data.length == 0 && (
                <div style={{ height: "100%" }}>
                    <Typography variant="h3">{t("No_Records")}</Typography>
                </div>
            )}
        </div>
    );
}
