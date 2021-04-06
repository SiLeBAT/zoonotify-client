/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import {
    Card,
    CardContent,
    CardMedia,
    makeStyles,
    Typography,
} from "@material-ui/core";
import { primaryColor } from "./Style/Style-MainTheme.component";

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
    const classes = useStyles();

    return (
        <Card className={classes.root}>
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
                css={logoStyle}
            />
        </Card>
    );
}
