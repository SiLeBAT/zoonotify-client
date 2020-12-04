/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { DataContext } from "../../../../Shared/Context/DataContext";
import { countNrOfIsolates } from "./countNrOfIsolates.component";

const subHeadingStyle = css`
    margin: 0;
`;
const parameterBlockStyle = css`
    margin-left: 2em;
`;
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

    const totalNrOfIsolates = countNrOfIsolates(data.ZNData);
    const nrOfSelectedIsolates = countNrOfIsolates(data.ZNDataFiltered);

    return (
        <Accordion defaultExpanded>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <h3 css={subHeadingStyle}>{t("NrOfIsolates.Title")}</h3>
            </AccordionSummary>
            <AccordionDetails css={parameterBlockStyle}>
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
            </AccordionDetails>
        </Accordion>
    );
}
