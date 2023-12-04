import React, { useState, useEffect, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { AmrTableComponent } from "../components/AmrTableComponent";
import { AMR_TABLE } from "../../shared/infrastructure/router/routes";

export interface AntibioticData {
    "cut-off"?: number | string;
    min?: number | string;
    max?: number | string;
    Wirkstoff?: string;
    Substanzklasse?: string;
}

export interface ResistanceTable {
    tableId: string;
    description: string;
    title: string;
    yearlyData: { [year: string]: { [antibiotic: string]: AntibioticData } };
    Wirkstoff: { [antibiotic: string]: string };
    Substanzklasse: { [antibiotic: string]: string };
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
    const [resistanceTables, setResistanceTables] = useState<ResistanceTable[]>(
        []
    );
    const [loading, setLoading] = useState<boolean>(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                const response = await fetch(AMR_TABLE);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const json = await response.json();

                const transformedData = json.data.map((item: ApiData) => {
                    const {
                        table_id: tableId,
                        description,
                        yearly_cut_off: yearlyCutOff,
                        title,
                    } = item.attributes;

                    const yearlyData: {
                        [year: string]: {
                            [antibiotic: string]: AntibioticData;
                        };
                    } = {};
                    let Wirkstoff: { [key: string]: string } = {};
                    let Substanzklasse: { [key: string]: string } = {};

                    Object.entries(yearlyCutOff).forEach(([year, data]) => {
                        if (year === "Wirkstoff") {
                            Wirkstoff = data[0] as { [key: string]: string };
                        } else if (year === "Substanzklasse") {
                            Substanzklasse = data[0] as {
                                [key: string]: string;
                            };
                        } else {
                            yearlyData[year] = data.reduce(
                                (
                                    acc: { [key: string]: AntibioticData },
                                    curr: { [key: string]: AntibioticData }
                                ) => ({ ...acc, ...curr }),
                                {}
                            );
                        }
                    });

                    return {
                        tableId,
                        description,
                        title,
                        yearlyData,
                        Wirkstoff,
                        Substanzklasse,
                    };
                });

                setResistanceTables(transformedData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <p>{t("loading")}</p>;
    }

    return (
        <div>
            {resistanceTables.length > 0 ? (
                resistanceTables.map((table, index) => (
                    <AmrTableComponent key={index} tableData={table} />
                ))
            ) : (
                <p>{t("noDataAvailable")}</p>
            )}
        </div>
    );
};

export { InfoPageContainer };
