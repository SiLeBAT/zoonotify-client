/** @jsx jsx */
import { css, jsx } from "@emotion/react";

import { AccordionComponent } from "../../../Shared/Accordion.component";
import {
    primaryColor,
    onPrimaryColor,
} from "../../../Shared/Style/Style-MainTheme";
import { EvaluationsPageCardComponent } from "./EvaluationPage-Card.component";
import { Evaluation, EvaluationCategory } from "./Evaluations.model";

const infoPageStyle = css`
    width: 60%;
    margin: 2em auto;
`;

const headingStyle = css`
    min-width: 7em;
    padding-bottom: 0.5em;
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
    border-bottom: 1px solid ${primaryColor};
`;

const subHeadingStyle = css`
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
    padding: 0.5em;
`;

export function EvaluationsPageComponent(props: {
    heading: string;
    evaluationsData: Evaluation;
    navButtonComponent: JSX.Element;
    downloadButtonText: string;
}): JSX.Element {
    return (
        <div css={infoPageStyle}>
            <p css={headingStyle}>{props.heading}</p>
            {props.navButtonComponent}
            <div>
                {Object.keys(props.evaluationsData).map((category) => (
                    <div key={`main-category-${category}`}>
                        <p css={subHeadingStyle} id={category}>
                            {
                                props.evaluationsData[
                                    category as EvaluationCategory
                                ].mainTitle
                            }
                        </p>
                        <div>
                            {props.evaluationsData[
                                category as EvaluationCategory
                            ].accordions.map((evaluation) => (
                                <AccordionComponent
                                    key={`accordion-${category}-${evaluation.title}`}
                                    title={evaluation.title}
                                    content={
                                        <EvaluationsPageCardComponent
                                            title={evaluation.title}
                                            description={evaluation.description}
                                            chartPath={evaluation.chartPath}
                                            downloadButtonText={
                                                props.downloadButtonText
                                            }
                                        />
                                    }
                                    defaultExpanded={false}
                                    centerContent
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
