/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { CircularProgress, Theme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { primaryColor } from "./Style/Style-MainTheme.component";

const circularProgressStyle = css`
    margin: 3em auto;
    color: ${primaryColor};
`;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            "& > * + *": {
                marginLeft: theme.spacing(2),
            },
        },
    })
);

export function LoadingProcessComponent(): JSX.Element {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <CircularProgress css={circularProgressStyle} />
        </div>
    );
}
