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

    const countIsolates = (colValue: string, rowValue: string): string => {
        return (_.filter(data.ZNData, {
            [colAttribute]: colValue,
            [rowAttribute]: rowValue,
        }).length as unknown) as string;
    };

    const getAllIsolates = async (): Promise<void> => {
        setAllIsolates([]);
        const newIsolates: Record<string, string>[] = [];
        let rowValues = data.uniqueValues[rowAttribute];
        if (!_.isEmpty(filter[rowAttribute])) {
            rowValues = filter[rowAttribute];
        }
        let colValues = data.uniqueValues[colAttribute];
        if (!_.isEmpty(filter[colAttribute])) {
            colValues = filter[colAttribute];
        }
        rowValues.forEach((rowValue) => {
            const isolates: Record<string, string> = { name: rowValue };
            colValues.forEach((colValue) => {
                const count = countIsolates(colValue, rowValue);
                isolates[colValue] = count;
            });
            newIsolates.push(isolates);
        });
        setAllIsolates(newIsolates);
        setColumnAttributes(colValues);
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
