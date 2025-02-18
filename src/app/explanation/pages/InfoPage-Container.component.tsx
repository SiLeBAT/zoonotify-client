import Markdown from "markdown-to-jsx";
import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AMR_TABLE } from "../../shared/infrastructure/router/routes";
import { AmrKey, AmrsTable } from "../model/ExplanationPage.model";
import { InfoPageComponent } from "./ExplanationMainComponent";

import { ErrorSnackbar } from "../../shared/components/ErrorSnackbar/ErrorSnackbar";

export interface AntibioticAttributes {
    name: string;
    shortName: string;
}

export interface AntibioticDetails {
    id: number;
    attributes: AntibioticAttributes;
}

export interface Antibiotic {
    data: AntibioticDetails;
}

export interface YearlyCutOffData {
    id: number;
    min: number;
    max: number;
    cutOff: number;
    substanzklasse: string;
    bacteria: string;
    year: number;
    antibiotic: Antibiotic;
}

export type CutOffList = YearlyCutOffData[];

export interface ApiData {
    id: number;
    attributes: {
        table_id: string;
        description: string;
        cut_offs: CutOffList;
        title: string;
    };
}

const InfoPageContainer: React.FC = (): ReactElement => {
    const [amrTableData, setAmrTableData] = useState<Record<AmrKey, AmrsTable>>(
        {} as Record<AmrKey, AmrsTable>
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Error state
    const { t } = useTranslation(["InfoPage"]);

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
                            title,
                            cut_offs: cutOffs,
                        } = item.attributes;

                        const years: string[] = cutOffs
                            .reduce(function (
                                yearList: string[],
                                rec: YearlyCutOffData
                            ) {
                                if (
                                    yearList.findIndex(
                                        (x) => x == rec.year.toString()
                                    ) == -1
                                ) {
                                    yearList.push(rec.year.toString());
                                }
                                return yearList;
                            },
                            [])
                            .sort((a: string, b: string) => b.localeCompare(a)); // Sorting in descending order

                        const antibiotics: string[] = cutOffs.reduce(function (
                            microbs: string[],
                            rec: YearlyCutOffData
                        ) {
                            if (
                                microbs.findIndex(
                                    (x) =>
                                        x ==
                                        rec.antibiotic.data.attributes.shortName
                                ) == -1
                            ) {
                                microbs.push(
                                    rec.antibiotic.data.attributes.shortName
                                );
                            }
                            return microbs;
                        },
                        []);

                        const tableTitle = `Table ${tableId}: ${title}`;
                        acc[tableId as AmrKey] = {
                            introduction: <div>{description}</div>,
                            title: <Markdown>{tableTitle}</Markdown>,
                            titleString: tableTitle,
                            description: description,
                            tableHeader: [
                                t("Methods.Amrs.TableHeaderShortSub"),
                                t("Methods.Amrs.TableHeaderClass"),
                                t("Methods.Amrs.TableHeaderSubstance"),
                                ...years,
                            ],
                            tableSubHeader: years.reduce(
                                (subAcc, year) => ({
                                    ...subAcc,

                                    [year]: ["Max", "Min", "Cut-off"],
                                }),
                                {}
                            ),
                            tableRows: antibiotics.map((antibiotic) => {
                                let antibioticName = "",
                                    antibioticShortName = "",
                                    substanceClass = "";
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
                                        const antibioticData = cutOffs.find(
                                            (rec) =>
                                                rec.year.toString() == year &&
                                                rec.antibiotic.data.attributes
                                                    .shortName == antibiotic
                                        );

                                        if (antibioticData) {
                                            antibioticName =
                                                antibioticData.antibiotic.data
                                                    .attributes.name;
                                            antibioticShortName =
                                                antibioticData.antibiotic.data
                                                    .attributes.shortName;
                                            substanceClass =
                                                antibioticData.substanzklasse;
                                            listAcc[year] = {
                                                cutOff: antibioticData.cutOff.toString(),
                                                min: antibioticData.min.toString(),
                                                max: antibioticData.max.toString(),
                                            };
                                        }

                                        return listAcc;
                                    },
                                    {}
                                );

                                return {
                                    amrSubstance: antibioticShortName,
                                    substanceClass: substanceClass,
                                    wirkstoff: antibioticName,
                                    shortSubstance: antibioticShortName,
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
        return <div>{t(" ")}</div>;
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
