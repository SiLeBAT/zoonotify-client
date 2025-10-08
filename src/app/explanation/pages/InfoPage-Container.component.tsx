import Markdown from "markdown-to-jsx";
import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// import { AMR_TABLE } from "../../shared/infrastructure/router/routes";   // <<-- Don't use the static AMR_TABLE now!
import { CMS_API_ENDPOINT } from "../../shared/infrastructure/router/routes";
import { AmrKey, AmrsTable } from "../model/ExplanationPage.model";
import { InfoPageComponent } from "./ExplanationMainComponent";
import { ErrorSnackbar } from "../../shared/components/ErrorSnackbar/ErrorSnackbar";
interface AntibioticFlat {
    id: number;
    shortName: string;
    name: string;
}

// --- FLAT CUT-OFF RECORD TYPE ---
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

// --- FLAT AMR TABLE ITEM ---
interface AMRTableItem {
    id: number;
    table_id: string; // e.g. "3a", "3b", "1", etc.
    description: string;
    title: string;
    cut_offs: YearlyCutOffDataFlat[];
}

// --- RESPONSE TYPE FROM API ---
interface AMRTableFlatResponse {
    data: AMRTableItem[];
    meta?: unknown;
}
// ... (keep your interfaces as before) ...

const InfoPageContainer: React.FC = (): ReactElement => {
    const [amrTableData, setAmrTableData] = useState<Record<AmrKey, AmrsTable>>(
        {} as Record<AmrKey, AmrsTable>
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { i18n, t } = useTranslation(["InfoPage"]);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setLoading(true);
                setError(null);

                // Build dynamic URL based on language and Strapi API pattern you tested:
                const locale = i18n.language.split("-")[0] || "de";
                const url = `${CMS_API_ENDPOINT}/resistance-tables?locale=${locale}&populate=cut_offs.antibiotic`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const json: AMRTableFlatResponse = await response.json();

                // (Transformation stays the same as your code!)
                const transformedData = json.data.reduce<
                    Record<AmrKey, AmrsTable>
                >((acc, item) => {
                    const {
                        table_id: tableId,
                        description,
                        title,
                        cut_offs: cutOffs,
                    } = item;

                    if (
                        !["1", "2", "3a", "3b", "4", "5a", "5b"].includes(
                            tableId
                        )
                    ) {
                        return acc;
                    }

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

        fetchData();
    }, [i18n.language]);

    const handleCloseError = (): void => {
        setError(null);
    };

    if (loading) {
        return <div>{t("Loading...")}</div>;
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
                <ErrorSnackbar open={!!error} handleClose={handleCloseError}>
                    {error}
                </ErrorSnackbar>
            )}
        </div>
    );
};

export { InfoPageContainer };
