import { useState, useEffect, useCallback } from "react";
import { callApiService } from "../shared/infrastructure/api/callApi.service";
import { CMSResponse, CMSEntity } from "../shared/model/CMS.model";
import { AMR_TABLE } from "../shared/infrastructure/router/routes";
import { useTranslation } from "react-i18next";

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
    introduction: string;
    title: string;
    titleString: string;
    description: string;
    tableHeader: string[];
    tableSubHeader: Record<string, string[]>;
    tableRows: AmrsTableData[];
}
interface UseAmrTableDataReturn {
    amrsTable: AmrsTable | null;
    loading: boolean;
    error: string | null;
    closeError: () => void;
}
interface ApiError {
    message: string;
    code: number;
}

async function getAmrTables(): Promise<AmrData[]> {
    const response = await callApiService<
        CMSResponse<CMSEntity<AmrData>[], ApiError>
    >(AMR_TABLE);
    if (!response || !response.data || !response.data.data) {
        throw new Error("Failed to fetch AMR tables.");
    }
    return response.data.data.map(
        (entity: CMSEntity<AmrData>) => entity.attributes
    );
}

function transformToAmrsTable(amrDataArray: AmrData[]): AmrsTable {
    // Creating table headers and subheaders
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
                    substanceClass: "Example Substance Class",
                    concentrationList: {},
                };
            }
            substancesMap[substance].concentrationList[data.year] =
                data.concentrationList[substance];
        });
    });

    const tableRows = Object.values(substancesMap);

    // Returning the transformed data
    return {
        introduction: "Introduction to AMR Tables",
        title: "AMR Table Title",
        titleString: "AMR Table Title String",
        description: "Description of AMR Tables",
        tableHeader,
        tableSubHeader,
        tableRows,
    };
}

export const useAmrTableData = (): UseAmrTableDataReturn => {
    const [amrsTable, setAmrsTable] = useState<AmrsTable | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const fetchData = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            const fetchedTables = await getAmrTables();
            const transformedTable = transformToAmrsTable(fetchedTables);
            setAmrsTable(transformedTable);
            setError(null);
        } catch (err) {
            setError(t("unknownError"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const closeError = (): void => {
        setError(null);
    };

    return { amrsTable, loading, error, closeError };
};
