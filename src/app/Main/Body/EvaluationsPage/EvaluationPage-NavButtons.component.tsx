/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import { Button } from "@mui/material";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme";
import { Evaluation, EvaluationCategory } from "./Evaluations.model";

const navButtonDisplayStyle = css`
    display: grid;
`;
const navButtonListStyle = css`
    margin: 0 auto;
    display: grid;
`;

export function EvaluationsPageNavButtonComponent(props: {
    evaluationsData: Evaluation;
}): JSX.Element {
    return (
        <div css={navButtonDisplayStyle}>
            <div css={navButtonListStyle}>
                {Object.keys(props.evaluationsData).map((category) => (
                    <Button
                        variant="contained"
                        sx={{
                            margin: "0.25em",
                            textAlign: "center",
                            backgroundColor: `${primaryColor}`,
                        }}
                        href={`#${category}`}
                        key={`nav_button-${category}`}
                    >
                        {
                            props.evaluationsData[
                                category as EvaluationCategory
                            ].mainTitle
                        }
                    </Button>
                ))}
            </div>
        </div>
    );
}
