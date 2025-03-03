import Markdown from "markdown-to-jsx";
import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AMR_TABLE } from "../../shared/infrastructure/router/routes";
import { AmrKey, AmrsTable } from "../model/ExplanationPage.model";
import { InfoPageComponent } from "./ExplanationMainComponent";
import { ErrorSnackbar } from "../../shared/components/ErrorSnackbar/ErrorSnackbar";

// "Flat" antibiotic
interface AntibioticFlat {
    id: number;
    shortName: string;
    name: string;
}

// "Flat" cut-off record
interface YearlyCutOffDataFlat {
    id: number;
    min: number;
    max: number;
    cutOff: number;
    substanzklasse: string;
    bacteria: string;
    year: number;
    antibiotic?: AntibioticFlat;
}

// "Flat" AMR table item
interface AMRTableItem {
    id: number;
    table_id: string; // e.g. "3a", "3b", "1", etc.
    description: string;
    title: string;
    cut_offs: YearlyCutOffDataFlat[];
}

// The entire response from your AMR_TABLE endpoint
interface AMRTableFlatResponse {
    data: AMRTableItem[];
    meta?: unknown;
}

const InfoPageContainer: React.FC = (): ReactElement => {
    const [amrTableData, setAmrTableData] = useState<Record<AmrKey, AmrsTable>>(
        {} as Record<AmrKey, AmrsTable>
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation(["InfoPage"]);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setLoading(true);

                // 1) Fetch the "flat" JSON from your AMR_TABLE endpoint
                const response = await fetch(AMR_TABLE);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const json: AMRTableFlatResponse = await response.json();

                // 2) Transform the array into a dictionary: Record<AmrKey, AmrsTable>
                const transformedData = json.data.reduce<
                    Record<AmrKey, AmrsTable>
                >((acc, item) => {
                    // Rename properties to camelCase
                    const {
                        table_id: tableId,
                        description,
                        title,
                        cut_offs: cutOffs,
                    } = item;

                    // Only proceed if tableId is one of your known keys
                    if (
                        !["1", "2", "3a", "3b", "4", "5a", "5b"].includes(
                            tableId
                        )
                    ) {
                        // If tableId is something else, skip it
                        return acc;
                    }

                    // Distinct years (descending)
                    const years: string[] = cutOffs
                        .reduce(
                            (yearList: string[], rec: YearlyCutOffDataFlat) => {
                                const yStr = rec.year.toString();
                                if (!yearList.includes(yStr)) {
                                    yearList.push(yStr);
                                }
                                return yearList;
                            },
                            []
                        )
                        .sort((a, b) => b.localeCompare(a));

                    // Distinct antibiotic shortNames
                    const antibiotics: string[] = cutOffs.reduce(
                        (microbs: string[], rec: YearlyCutOffDataFlat) => {
                            const shortName = rec.antibiotic?.shortName;
                            if (shortName && !microbs.includes(shortName)) {
                                microbs.push(shortName);
                            }
                            return microbs;
                        },
                        []
                    );

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
                        tableSubHeader: years.reduce((subAcc, year) => {
                            return {
                                ...subAcc,
                                [year]: ["Max", "Min", "Cut-off"],
                            };
                        }, {} as Record<string, string[]>),
                        tableRows: antibiotics.map((antibioticShort) => {
                            let antibioticName = "";
                            let substanceClass = "";

                            // Build concentrationList for each year
                            const concentrationList: Record<
                                string,
                                { cutOff: string; min: string; max: string }
                            > = {};

                            years.forEach((year) => {
                                const rec = cutOffs.find(
                                    (co) =>
                                        co.year.toString() === year &&
                                        co.antibiotic?.shortName ===
                                            antibioticShort
                                );
                                if (rec) {
                                    antibioticName = rec.antibiotic?.name ?? "";
                                    substanceClass = rec.substanzklasse;
                                    concentrationList[year] = {
                                        cutOff: rec.cutOff.toString(),
                                        min: rec.min.toString(),
                                        max: rec.max.toString(),
                                    };
                                }
                            });

                            return {
                                amrSubstance: antibioticShort,
                                substanceClass,
                                wirkstoff: antibioticName,
                                shortSubstance: antibioticShort,
                                concentrationList,
                            };
                        }),
                    };

                    return acc;
                }, {} as Record<AmrKey, AmrsTable>);

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

        void fetchData();
    }, [t]);

    const handleCloseError = (): void => {
        setError(null);
    };

    if (loading) {
        return <div>{t("Loading...")}</div>;
    }

    const handleExportAmrData = (amrKey: AmrKey): void => {
        console.log("Export functionality for", amrKey);
        // e.g. CSV or Excel export
    };

    return (
        <div>
            <InfoPageComponent
                tableData={amrTableData}
                onAmrDataExport={handleExportAmrData}
            />
            {error && (
                <ErrorSnackbar open={!!error} handleClose={handleCloseError}>
                    {error}
                </ErrorSnackbar>
            )}
        </div>
    );
};

export { InfoPageContainer };
