/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { primaryColor } from "./Style/Style-MainTheme";

const titleStyle = css`
    margin-bottom: 1rem;
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
`;
const subtitleStyle = css`
    margin: 1em 0;
    font-size: 0.85rem;
    font-weight: normal;
    text-align: center;
`;
const textStyle = css`
    font-size: 0.85rem;
    line-height: 1.6;
    text-align: justify;
`;

export interface CardProps {
    title: string;
    subtitle: string;
    text: string;
}

/**
 * @desc Returns a card wrapper with BfR-Logo
 * @param props
 * @returns {JSX.Element} - card with title, subtitle, text and BfR-Logo
 */
export function LogoCardComponent(props: CardProps): JSX.Element {
    return (
        <Card
            sx={{
                padding: "1em",
                margin: "2.5em auto",
                width: "50%",
            }}
        >
            <CardContent>
                <Typography variant="h1" css={titleStyle}>
                    {props.title}
                </Typography>
                <Typography variant="h2" css={subtitleStyle}>
                    {props.subtitle}
                </Typography>
                <Typography css={textStyle}>{props.text}</Typography>
            </CardContent>
            <CardMedia
                component="img"
                image="/assets/bfr_logo.gif"
                title="BfR Logo"
                sx={{ height: "auto", width: "auto" }}
            />
        </Card>
    );
}
