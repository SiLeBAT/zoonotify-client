/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
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

export function QueryPageNrOfIsolatesComponent(props: {
    numberOfIsolates:{
        total: number,
        filtered: number
    }
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

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
                            <td css={tableNumberStyle}>
                                {props.numberOfIsolates.total}
                            </td>
                            <td css={tableTextStyle}>
                                {t("NrOfIsolates.Selected")}
                            </td>
                            <td>{props.numberOfIsolates.filtered}</td>
                        </tr>
                    </tbody>
                </table>
            }
            defaultExpanded
        />
    );
}
