/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { CircularProgress, createStyles, makeStyles, Theme } from "@material-ui/core";
import { primaryColor } from "./Style/Style-MainTheme.component";

const circularProgressStyle = css`
    margin: 3em auto;
    color: ${primaryColor};
`

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
            <CircularProgress css={circularProgressStyle}/>
        </div>
    );
}
