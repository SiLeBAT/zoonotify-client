import React, { useState, useEffect, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { AMR_TABLE } from "../../shared/infrastructure/router/routes";
import { InfoPageComponent } from "./ExplanationMainComponent";
import { AmrKey, AmrsTable } from "../model/ExplanationPage.model";
import Markdown from "markdown-to-jsx";

import { ErrorSnackbar } from "../../shared/components/ErrorSnackbar/ErrorSnackbar";

export interface AntibioticData {
    "cut-off"?: number | string;
    min?: number | string;
    max?: number | string;

    Substanzklasse?: string;
    Wirkstoff?: string;
}

export interface ApiData {
    id: number;
    attributes: {
        table_id: string;
        description: string;
        yearly_cut_off: {
            [year: string]: {
                [antibiotic: string]: AntibioticData;
            }[];
        };
        title: string;
    };
}

const InfoPageContainer: React.FC = (): ReactElement => {
    const [amrTableData, setAmrTableData] = useState<Record<AmrKey, AmrsTable>>(
        {} as Record<AmrKey, AmrsTable>
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Error state
    const { t } = useTranslation();

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setLoading(true);
                const response = await fetch(AMR_TABLE);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const json = await response.json();

                const transformedData = json.data.reduce(
                    (acc: Record<AmrKey, AmrsTable>, item: ApiData) => {
                        const {
                            table_id: tableId,
                            description,
                            yearly_cut_off: yearlyCutOff,
                            title,
                        } = item.attributes;

                        const years = Object.keys(yearlyCutOff)
                            .filter(
                                (y) =>
                                    !["Substanzklasse", "Wirkstoff"].includes(y)
                            )
                            .sort((a, b) => b.localeCompare(a)); // Sorting in descending order
                        const antibiotics = Object.keys(
                            yearlyCutOff[years[0]][0]
                        );

                        const SubstanzklasseData =
                            yearlyCutOff.Substanzklasse &&
                            yearlyCutOff.Substanzklasse.length > 0
                                ? Object.fromEntries(
                                      Object.entries(
                                          yearlyCutOff.Substanzklasse[0]
                                      ).map(([key, value]) => [
                                          key,
                                          value.toString(),
                                      ])
                                  )
                                : {};

                        const WirkstoffData =
                            yearlyCutOff.Wirkstoff &&
                            yearlyCutOff.Wirkstoff.length > 0
                                ? (yearlyCutOff.Wirkstoff[0] as Record<
                                      string,
                                      string
                                  >)
                                : {};

                        const tableTitle = `Table ${tableId}: ${title}`;
                        acc[tableId as AmrKey] = {
                            introduction: <div>{description}</div>,
                            title: <Markdown>{tableTitle}</Markdown>,
                            titleString: tableTitle,
                            description: description,
                            tableHeader: [
                                "Antibiotic",
                                "Substanzklasse",
                                "Wirkstoff",
                                ...years,
                            ],
                            tableSubHeader: years.reduce(
                                (subAcc, year) => ({
                                    ...subAcc,
                                    [year]: ["Min", "Max", "Cut-off"],
                                }),
                                {}
                            ),
                            tableRows: antibiotics.map((antibiotic) => {
                                const concentrationList = years.reduce(
                                    (
                                        listAcc: Record<
                                            string,
                                            {
                                                cutOff: string;
                                                min: string;
                                                max: string;
                                            }
                                        >,
                                        year
                                    ) => {
                                        const antibioticData =
                                            yearlyCutOff[year].find(
                                                (data) => data[antibiotic]
                                            )?.[antibiotic] || {};
                                        listAcc[year] = {
                                            cutOff: antibioticData["cut-off"]
                                                ? antibioticData[
                                                      "cut-off"
                                                  ].toString()
                                                : "",
                                            min: antibioticData.min
                                                ? antibioticData.min.toString()
                                                : "",
                                            max: antibioticData.max
                                                ? antibioticData.max.toString()
                                                : "",
                                        };
                                        return listAcc;
                                    },
                                    {}
                                );

                                return {
                                    amrSubstance: antibiotic,
                                    substanceClass:
                                        SubstanzklasseData[antibiotic] ||
                                        "Unknown",
                                    wirkstoff:
                                        WirkstoffData[antibiotic] || "Unknown",
                                    shortSubstance: antibiotic.substr(0, 3),

                                    concentrationList,
                                };
                            }),
                        };

                        return acc;
                    },
                    {}
                );

                setAmrTableData(transformedData);
                setLoading(false);
            } catch (fetchError) {
                console.error("Error fetching data:", fetchError);
                setError(
                    fetchError instanceof Error
                        ? fetchError.message
                        : "unknownError"
                );
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCloseError = (): void => {
        setError(null);
    };

    if (loading) {
        return <p>{t(" ")}</p>;
    }

    const handleExportAmrData = (amrKey: AmrKey): void => {
        console.log("Export functionality for", amrKey);
    };

    return (
        <div>
            <InfoPageComponent
                tableData={amrTableData}
                onAmrDataExport={handleExportAmrData}
            />
            {error && (
                <ErrorSnackbar open={!!error} handleClose={handleCloseError} />
            )}
        </div>
    );
};

export { InfoPageContainer };
