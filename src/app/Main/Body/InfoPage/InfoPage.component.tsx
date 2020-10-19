/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Card, CardContent, makeStyles, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";

const appNameStyle = css`
    margin-bottom: 1rem;
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
`;
const normalTextStyle = css`
    font-size: 0.85rem;
    line-height: 1.6;
    text-align: justify;
`;
const useStyles = makeStyles({
    root: {
        padding: "1em",
        margin: "4rem auto",
        width: "50%",
    },
});

export function InfoPageComponent(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(["InfoPage"]);
    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography variant="h1" css={appNameStyle}>
                    {t("Title")}
                </Typography>
                <Typography css={normalTextStyle}>{t("MainText")}</Typography>
            </CardContent>
        </Card>
    );
}
