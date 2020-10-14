/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Card, CardContent, makeStyles, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const normalTextStyle = css`
    font-size: 0.85rem;
    line-height: 1.6;
    text-align: justify;
    hyphens: auto;
`;
const useStyles = makeStyles({
    root: {
        margin: "auto",
    },
});

export function QueryPageTextContentComponent(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(["QueryPage"]);
    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography css={normalTextStyle}>
                    {t("Content.MainText")}
                </Typography>
            </CardContent>
        </Card>
    );
}
