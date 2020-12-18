/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import { TableContentTableComponent as ResultsTable } from "./TableContent-Table.component";
import { ExplanationTextComponent as ExplanationText } from "../../../../../Shared/ExplanationText.component";
import { TableContext } from "../../../../../Shared/Context/TableContext";

const dataTableStyle = css`
    overflow: auto;
`;

interface TableContentInterface {
    displayRowCol: {
        isCol: boolean;
        isRow: boolean;
    };
    columnAttributes: string[];
    getSize: (
        node: HTMLElement | null,
        key: "height" | "totalWidth" | "partWidth"
    ) => void;
}

export function TabelResultTableContentComponent(props: TableContentInterface): JSX.Element {
    const { table } = useContext(TableContext);

    const noRowAndCol = !props.displayRowCol.isCol && !props.displayRowCol.isRow;
    const isRowAndCol = props.displayRowCol.isCol && props.displayRowCol.isRow;
    const isRowNotCol = !props.displayRowCol.isCol && props.displayRowCol.isRow;

    if (noRowAndCol) {
        return <ExplanationText />;
    }
    return (
        <div
            css={dataTableStyle}
            ref={(node: HTMLElement | null) =>
                props.getSize(node, "totalWidth")
            }
        >
            <ResultsTable
                allIsolates={table.statisticData}
                columnAttributes={props.columnAttributes}
                getSize={props.getSize}
                isRowNotCol={isRowNotCol}
                isRowAndCol={isRowAndCol}
            />
        </div>
    );
}
