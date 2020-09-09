/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext, useEffect, useState } from "react";
import _ from "lodash";
import {
    primaryColor,
    onPrimaryColor,
} from "../../../../Shared/Style/Style-MainTheme.component";
import { FilterContext } from "../../../../Shared/Context/FilterContext";
import { DataContext } from "../../../../Shared/Context/DataContext";
import { TableContext } from "../../../../Shared/Context/TableContext";
import { FilterType } from "../../../../Shared/Filter.model";
import { ResultsTableComponent } from "./Results-Table.component";
import { getIsolatesRows } from "./Results-CountIsolates.service";

const dataStyle = css`
    box-sizing: inherit;
    width: fit-content;
    margin-left: 2em;
`;
const tableRowHeader = css`
    margin: 0;
    display: flex;
    justify-content: center;
    transform: rotate(180deg);
    writing-mode: vertical-lr;
    font-weight: normal;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
`;
const tableColumnHeader = css`
    margin: 0;
    display: flex;
    justify-content: center;
    font-weight: normal;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
`;
const tableDivStyle = css`
    display: flex;
    flex-direction: row;
`;

export function QueryPageTableRestultComponent(): JSX.Element {
    const [columnAttributes, setColumnAttributes] = useState<string[]>([]);
    const [allIsolates, setAllIsolates] = useState<Record<string, string>[]>(
        []
    );
    const { filter } = useContext(FilterContext);
    const { data } = useContext(DataContext);
    const { table } = useContext(TableContext);

    const rowAttribute: FilterType = table.row;
    const colAttribute: FilterType = table.column;

    const getValuesFromData = (attribute: FilterType): string[] => {
        let values = data.uniqueValues[attribute];
        if (!_.isEmpty(filter[attribute])) {
            values = filter[attribute];
        }
        return values;
    };

    const getAllIsolates = async (): Promise<void> => {
        setAllIsolates([]);
        const rowValues = getValuesFromData(rowAttribute);
        const colValues = getValuesFromData(colAttribute);
        if (rowAttribute.length !== 0 && colAttribute.length !== 0) {
            const rowsWithIsolates = getIsolatesRows(
                data.ZNData,
                colAttribute,
                rowAttribute,
                rowValues,
                colValues,
                "both"
            );
            setAllIsolates(rowsWithIsolates);
            setColumnAttributes(colValues);
        } else if (rowAttribute.length === 0) {
            const rowsWithIsolates = getIsolatesRows(
                data.ZNData,
                colAttribute,
                rowAttribute,
                ["Number of Isolates"],
                colValues,
                "col"
            );
            setAllIsolates(rowsWithIsolates);
            setColumnAttributes(colValues);
        } else if (colAttribute.length === 0) {
            const rowsWithIsolates = getIsolatesRows(
                data.ZNData,
                colAttribute,
                rowAttribute,
                rowValues,
                ["Number of Isolates"],
                "row"
            );
            setAllIsolates(rowsWithIsolates);
            setColumnAttributes(["Number of Isolates"]);
        }
    };

    useEffect((): void => {
        getAllIsolates();
    }, [filter, table]);

    return (
        <div css={dataStyle}>
            <h4 css={tableColumnHeader}>{colAttribute}</h4>
            <div css={tableDivStyle}>
                <h4 css={tableRowHeader}>{rowAttribute}</h4>
                <ResultsTableComponent
                    columnAttributes={columnAttributes}
                    allIsolates={allIsolates}
                />
            </div>
        </div>
    );
}
