/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { DataContext } from "../../../../Shared/Context/DataContext";
import { AccordionComponent } from "../../../../Shared/Accordion.component";

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
        <AccordionComponent
            title={t("NrOfIsolates.Title")}
            content={
                <table css={tableStyle}>
                    <tbody>
                        <tr>
                            <td css={tableTextStyle}>
                                {t("NrOfIsolates.Total")}
                            </td>
                            <td css={tableNumberStyle}>{totalNrOfIsolates}</td>
                            <td css={tableTextStyle}>
                                {t("NrOfIsolates.Selected")}
                            </td>
                            <td>{nrOfSelectedIsolates}</td>
                        </tr>
                    </tbody>
                </table>
            }
        />
    );
}
