/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/system";
import { primaryColor } from "./Style/Style-MainTheme";

const circularProgressStyle = css`
    margin: 3em auto;
    color: ${primaryColor};
`;

export function LoadingProcessComponent(): JSX.Element {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "flex",
                "& > * + *": {
                    marginLeft: theme.spacing(2),
                },
            }}
        >
            <CircularProgress css={circularProgressStyle} />
        </Box>
    );
}
