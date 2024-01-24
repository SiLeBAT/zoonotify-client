import React from "react";
import { Layout } from "./LayoutComponent";
import { MainContentComponent } from "./MainContentComponent";
import { FilterContainerComponent } from "../components/FilterContainerComponent";
import { useEvaluationPageComponent } from "./evaluationsUseCases";
import { useTranslation } from "react-i18next";
import { EvaluationDivisionContainer } from "../components/EvaluationDivisionContainer";
import { DivisionToken } from "../model/Evaluations.model";
import { MainComponentHeader } from "../../shared/components/MainComponentHeader";

export function PrevalenceMainComponent(): React.ReactElement {
    const { model, operations } = useEvaluationPageComponent();
    const { t } = useTranslation(["ExplanationPage"]);

    return (
        <div>
            <Layout
                side={
                    <FilterContainerComponent
                        selectionConfig={model.selectionConfig}
                        searchButtonText={model.searchButtonText}
                        handleSearchBtnClick={operations.updateFilters}
                        howToHeading={model.howToHeading}
                        howToContent={model.howto}
                    />
                }
                main={
                    <>
                        <MainComponentHeader heading={t("Prevalence")} />

                        <MainContentComponent
                            model={model}
                            operations={operations}
                        />

                        {!model.loading &&
                            (
                                Object.keys(
                                    model.evaluationsData
                                ) as DivisionToken[]
                            )
                                .filter((value) =>
                                    operations.showDivision(value)
                                )
                                .map((divisionToken) => {
                                    const divisionData =
                                        model.evaluationsData[divisionToken];
                                    const title = t(divisionToken);

                                    return (
                                        <EvaluationDivisionContainer
                                            key={divisionToken}
                                            title={title}
                                            divisionData={divisionData}
                                            downloadGraphButtonText={
                                                model.downloadGraphButtonText
                                            }
                                            downloadDataButtonText={
                                                model.downloadDataButtonText
                                            }
                                        />
                                    );
                                })}
                    </>
                }
            />
        </div>
    );
}
