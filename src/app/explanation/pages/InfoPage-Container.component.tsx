import React, { useState, useEffect, ReactElement } from "react";
import { AmrTableComponent } from "../components/AmrTableComponent";
interface AntibioticData {
    "cut-off"?: number | string;
    min?: number | string;
    max?: number | string;
}

interface ResistanceTable {
    tableId: string;
    description: string;
    title: string;
    yearlyData: { [year: string]: { [antibiotic: string]: AntibioticData } };
    Wirkstoff: { [antibiotic: string]: string };
    Substanzklasse: { [antibiotic: string]: string };
}

interface ApiData {
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
    // Added return type
    const [resistanceTables, setResistanceTables] = useState<ResistanceTable[]>(
        []
    );
    const [loading, setLoading] = useState<boolean>(true); // Added boolean type

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            // Added return type
            try {
                const response = await fetch(
                    "http://localhost:1337/api/resistance-tables"
                );
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
                    let Wirkstoff: { [key: string]: string } = {}; // Changed to specific type
                    let Substanzklasse: { [key: string]: string } = {}; // Changed to specific type

                    Object.entries(yearlyCutOff).forEach(([year, data]) => {
                        if (year === "Wirkstoff") {
                            Wirkstoff = data[0] as { [key: string]: string }; // Type assertion
                        } else if (year === "Substanzklasse") {
                            Substanzklasse = data[0] as {
                                [key: string]: string;
                            }; // Type assertion
                        } else {
                            yearlyData[year] = data.reduce(
                                (
                                    acc: { [key: string]: AntibioticData },
                                    curr: { [key: string]: AntibioticData }
                                ) => ({ ...acc, ...curr }), // Specified types
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
        return <p>Loading data...</p>;
    }

    return (
        <div>
            {resistanceTables.length > 0 ? (
                resistanceTables.map((table, index) => (
                    <AmrTableComponent key={index} tableData={table} />
                ))
            ) : (
                <p>No data available.</p>
            )}
        </div>
    );
};

export { InfoPageContainer };
