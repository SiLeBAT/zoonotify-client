/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Typography,
} from "@mui/material";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme";

const chartBoxStyle = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const downloadLinkStyle = css`
    width: 100%;
    padding: 0.5em 1em;
    color: inherit;
    text-decoration: none;
`;

export function EvaluationsPageCardComponent(props: {
    title: string;
    description: string;
    chartPath: string;
    downloadButtonText: string;
}): JSX.Element {
    return (
        <Card
            sx={{
                display: "flex",
                borderRadius: 0,
                boxShadow: 0,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <CardContent
                    sx={{
                        flex: "1 0 auto",
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        component="div"
                    >
                        {props.description}
                    </Typography>
                </CardContent>
            </Box>
            <div css={chartBoxStyle}>
                <CardMedia
                    component="img"
                    image={props.chartPath}
                    alt={props.title}
                />
                <Button
                    color="primary"
                    variant="contained"
                    sx={{
                        width: "30%",
                        margin: "0.5em",
                        padding: "0em",
                        backgroundColor: `${primaryColor}`,
                    }}
                >
                    <a href={props.chartPath} download css={downloadLinkStyle}>
                        {props.downloadButtonText}
                    </a>
                </Button>
            </div>
        </Card>
    );
}
