/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { TableContext } from "../../../../Shared/Context/TableContext";
import { ResultsTableComponent as ResultsTable } from "./Results-Table.component";
import { TableMainHeaderComponent } from "./Result-MainHeader.component";

const subHeadingStyle = css`
    margin: 0;
`;
const accordionStyle = css`
    display: block;
`;
const dataStyle = css`
    max-width: fit-content;
    margin: auto;
    box-sizing: inherit;
`;
const dataTableStyle = css`
    overflow: auto;
`;
const tableDivStyle = css`
    display: flex;
    flex-direction: row;
`;

interface TestInterface {
    displayRowCol: {
        isCol: boolean;
        isRow: boolean;
    };
    columnAttributes: string[];
}

export function QueryPageTableRestultComponent(
    props: TestInterface
): JSX.Element {
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });
    const [tableHeight, setTableHeight] = useState<number>(0);
    const [totalWidth, setTotalWidth] = useState<number>(0);
    const [partWidth, setPartWidth] = useState<number>(0);
    const { table } = useContext(TableContext);
    const { t } = useTranslation(["QueryPage"]);

    useEffect(() => {
        const handleSize = (): void => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener("resize", handleSize);
        return () => window.removeEventListener("resize", handleSize);
    }, []);

    const div = useCallback(
        (
            node: HTMLElement | null,
            key: "height" | "totalWidth" | "partWidth"
        ) => {
            if (node !== null) {
                if (key === "height") {
                    const { height } = node.getBoundingClientRect();
                    setTableHeight(height);
                }
                if (key === "totalWidth") {
                    const { width } = node.getBoundingClientRect();
                    setTotalWidth(width);
                }
                if (key === "partWidth") {
                    const { width } = node.getBoundingClientRect();
                    setPartWidth(width);
                }
            }
        },
        [table, windowSize]
    );

    const headerWidth: number = totalWidth - partWidth;

    const rowMainHeader: string = t(`Filters.${table.row}`);
    const colMainHeader: string = t(`Filters.${table.column}`);

    const isIsolates = !!(
        !props.displayRowCol.isCol && !props.displayRowCol.isRow
    );
    const isRowAndCol = !!(
        props.displayRowCol.isCol && props.displayRowCol.isRow
    );
    const isRowNotCol = !!(
        !props.displayRowCol.isCol && props.displayRowCol.isRow
    );

    return (
        <Accordion defaultExpanded>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="table-accordion-content"
                id="table-accordion-header"
            >
                <h3 css={subHeadingStyle}>Tabelle</h3>
            </AccordionSummary>
            <AccordionDetails css={accordionStyle}>
                <div css={dataStyle}>
                    <TableMainHeaderComponent
                        isTitle={props.displayRowCol.isCol}
                        isRow={false}
                        height={tableHeight}
                        width={headerWidth}
                        text={colMainHeader}
                    />
                    <div css={tableDivStyle}>
                        <TableMainHeaderComponent
                            isTitle={props.displayRowCol.isRow}
                            isRow
                            height={tableHeight}
                            width={headerWidth}
                            text={rowMainHeader}
                        />
                        <div
                            css={dataTableStyle}
                            ref={(node: HTMLElement | null) =>
                                div(node, "totalWidth")
                            }
                        >
                            <ResultsTable
                                allIsolates={table.statisticData}
                                isIsolates={isIsolates}
                                columnAttributes={props.columnAttributes}
                                getSize={div}
                                isRowNotCol={isRowNotCol}
                                isRowAndCol={isRowAndCol}
                            />
                        </div>
                    </div>
                </div>
            </AccordionDetails>
        </Accordion>
    );
}
