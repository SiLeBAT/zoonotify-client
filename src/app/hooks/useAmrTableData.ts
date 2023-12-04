import { useState, useEffect, useCallback } from "react";
import { callApiService } from "../shared/infrastructure/api/callApi.service";
import { CMSResponse, CMSEntity } from "../shared/model/CMS.model";

interface Concentration {
    cutOff: string;
    min: string;
    max: string;
}

interface AmrData {
    year: string;
    concentrationList: Record<string, Concentration>;
}

interface AmrsTableData {
    amrSubstance: string;
    shortSubstance: string;
    substanceClass: string;
    concentrationList: Record<string, Concentration>;
}

interface AmrsTable {
    introduction: string; // changed from JSX.Element to string
    title: string; // changed from JSX.Element to string
    titleString: string;
    description: string;
    tableHeader: string[];
    tableSubHeader: Record<string, string[]>;
    tableRows: AmrsTableData[];
}

interface ApiError {
    message: string;
    code: number;
}

const apiEndpoint = "http://localhost:1337/api/resistance-tables";

async function getAmrTables(): Promise<AmrData[]> {
    const response = await callApiService<
        CMSResponse<CMSEntity<AmrData>[], ApiError>
    >(apiEndpoint);
    if (!response || !response.data || !response.data.data) {
        throw new Error("Failed to fetch AMR tables.");
    }
    return response.data.data.map(
        (entity: CMSEntity<AmrData>) => entity.attributes
    );
}

function transformToAmrsTable(amrDataArray: AmrData[]): AmrsTable {
    const tableHeader = ["Short Substance", "Substance Class", "Substance"];
    const tableSubHeader: Record<string, string[]> = {};

    amrDataArray.forEach((data) => {
        tableHeader.push(data.year);
        tableSubHeader[data.year] = ["Cut Off", "Min", "Max"];
    });

    // Aggregate data by substance
    const substancesMap: Record<string, AmrsTableData> = {};

    amrDataArray.forEach((data) => {
        Object.keys(data.concentrationList).forEach((substance) => {
            if (!substancesMap[substance]) {
                substancesMap[substance] = {
                    amrSubstance: substance,
                    shortSubstance: substance.substr(0, 3),
                    substanceClass: "Your Substance Class Here",
                    concentrationList: {},
                };
            }
            substancesMap[substance].concentrationList[data.year] =
                data.concentrationList[substance];
        });
    });

    const tableRows = Object.values(substancesMap);

    return {
        introduction: "Your Introduction Content Here",
        title: "Your Table Title Here",
        titleString: "Your Title String Here",
        description: "Your Table Description Here",
        tableHeader,
        tableSubHeader,
        tableRows,
    };
}

export const useAmrTableData = (): {
    amrsTable: AmrsTable | null;
    loading: boolean;
    error: string | null;
} => {
    // Added return type
    const [amrsTable, setAmrsTable] = useState<AmrsTable | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const fetchedTables = await getAmrTables();
            const transformedTable = transformToAmrsTable(fetchedTables);
            setAmrsTable(transformedTable);
            setLoading(false);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An error occurred.");
            }
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { amrsTable, loading, error };
};
