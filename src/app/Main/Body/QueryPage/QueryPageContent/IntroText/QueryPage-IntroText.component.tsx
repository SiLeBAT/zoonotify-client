/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button, Card, CardContent, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const normalTextStyle = css`
    font-size: 0.85rem;
    line-height: 1.6;
    text-align: justify;
    hyphens: auto;
`;

export function QueryPageIntroTextComponent(props: {
    onClickOpen: () => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleClick = (): void => props.onClickOpen();

    return (
        <Card
            sx={{
                margin: "auto",
            }}
        >
            <CardContent>
                <Typography css={normalTextStyle}>
                    {t("Content.MainText.Part1")}
                    <Button
                        variant="text"
                        onClick={handleClick}
                        size="small"
                        sx={{ padding: 0, textTransform: "none" }}
                    >
                        {t("Content.MainText.Part2")}
                    </Button>
                    {t("Content.MainText.Part3")}
                </Typography>
            </CardContent>
        </Card>
    );
}
