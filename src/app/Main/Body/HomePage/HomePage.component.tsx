/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Card, CardMedia, makeStyles } from "@material-ui/core";
import { HomePageTextContentComponent as TextContent } from "./HomePage-TextContent.component";

const logoStyle = css`
    height: auto;
    width: auto;
`;
const useStyles = makeStyles({
    root: {
        padding: "1em",
        margin: "2.5em auto",
        width: "50%",
    },
});

export function HomePageLayoutComponent(): JSX.Element {
    const classes = useStyles();
    return (
        <Card className={classes.root}>
            <TextContent />
            <CardMedia
                component="img"
                alt="Contemplative Reptile"
                image="/assets/bfr_logo.gif"
                title="BfR Logo"
                css={logoStyle}
            />
        </Card>
    );
}
