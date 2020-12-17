/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TableContext } from "../../../../Shared/Context/TableContext";
import { TableContentComponent as TableContent } from "./Result-Content.component";
import { TableMainHeaderComponent } from "./Result-MainHeader.component";
import { AccordionComponent as Accordion } from "../../../../Shared/Accordion.component";

const dataStyle = css`
    max-width: fit-content;
    margin: auto;
    box-sizing: inherit;
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

    const accordionHeader: string = t(`Results.Table`);
    const rowMainHeader: string = t(`Filters.${table.row}`);
    const colMainHeader: string = t(`Filters.${table.column}`);

    return (
        <Accordion
            title={accordionHeader}
            content={
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
                        <TableContent
                            displayRowCol={props.displayRowCol}
                            columnAttributes={props.columnAttributes}
                            getSize={div}
                        />
                    </div>
                </div>
            }
        />
    );
}
