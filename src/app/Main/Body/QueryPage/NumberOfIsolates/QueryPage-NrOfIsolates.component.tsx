/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { DataContext } from "../../../../Shared/Context/DataContext";
import { AccordionComponent as Accordion } from "../../../../Shared/Accordion.component";

const tableStyle = css`
    table-layout: auto;
`;
const tableTextStyle = css`
    padding-right: 1em;
    font-weight: bold;
`;
const tableNumberStyle = css`
    padding-right: 5em;
`;

export function QueryPageNrOfIsolatesComponent(): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const { data } = useContext(DataContext);

    const totalNrOfIsolates = data.ZNData.length;
    const nrOfSelectedIsolates = data.ZNDataFiltered.length;

    return (
        <Accordion
            title={t("NrOfIsolates.Title")}
            content={
                <table css={tableStyle}>
                    <tbody>
                        <tr>
                            <td key="tableText-total" css={tableTextStyle}>
                                {t("NrOfIsolates.Total")}
                            </td>
                            <td key="tableNr-total" css={tableNumberStyle}>
                                {totalNrOfIsolates}
                            </td>
                            <td key="tableText-selected" css={tableTextStyle}>
                                {t("NrOfIsolates.Selected")}
                            </td>
                            <td key="tableNr-selected">
                                {nrOfSelectedIsolates}
                            </td>
                        </tr>
                    </tbody>
                </table>
            }
        />
    );
}
