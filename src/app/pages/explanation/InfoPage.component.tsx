import { Button, Typography } from "@mui/material";
import { Box, useTheme } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import { InfoPageAmrsContentComponent } from "./Amrs/InfoPage-AmrsContent.component";
import { AmrKey, AmrsTable } from "./InfoPage.model";
import {
    campySpp,
    coliFull,
    coliShort,
    enteroFF,
    listeria,
    salmSpp,
    staphy,
} from "./italicNames.constants";

function createParagraphWithBoldText(
    text1: string,
    boldText: string,
    text2: string
): JSX.Element {
    return (
        <Typography sx={{ marginBottom: "1em" }} component="p">
            {text1}
            <b>{boldText}</b>
            {text2}
        </Typography>
    );
}

export function InfoPageComponent(props: {
    amrKeys: AmrKey[];
    tableData: Record<AmrKey, AmrsTable>;
    onAmrDataExport: (amrKey: AmrKey) => void;
}): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);
    const theme = useTheme();

    const subHeadingStyle = {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        padding: "0.5em",
        margin: "1em 0",
    } as const;

    const navButtonStyle = {
        margin: "0.25em",
        textAlign: "center",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    } as const;

    const handleExportAmrData = (amrKey: AmrKey): void => {
        props.onAmrDataExport(amrKey);
    };

    const backgroundChapterHeading = t("Background.Name");
    const methodsChapterHeading = t("Methods.Name");

    const backgroundAccordionContent = (
        <div>
            {createParagraphWithBoldText(
                t("Background.Paragraph1.Description1"),
                t("Background.Paragraph1.Description2"),
                t("Background.Paragraph1.Description3")
            )}
            <Typography sx={{ marginBottom: "1em" }} component="p">
                {t("Background.Paragraph2.Description1")}
                {salmSpp}, {campySpp}, {listeria}
                {t("Background.Paragraph2.Description2")}
                {coliFull}
                {t("Background.Paragraph2.Description3")}
                {staphy}
                {t("Background.Paragraph2.Description4")}
                <i>{t("Background.Paragraph2.Description5")}</i>
                {t("Background.Paragraph2.Description6")}
                {coliShort}
                {t("Background.Paragraph2.Description7")}
                {salmSpp}, {campySpp}
                {t("Background.Paragraph2.Description8")}
                {coliShort}
                {t("Background.Paragraph2.Description9")}
                {enteroFF}
                {t("Background.Paragraph2.Description10")}
                {coliShort}
                {t("Background.Paragraph2.Description11")}
                {coliShort}
                {t("Background.Paragraph2.Description12")}
                {coliShort}
                {t("Background.Paragraph2.Description13")}
            </Typography>
            {createParagraphWithBoldText(
                t("Background.Paragraph3.Description1"),
                t("Background.Paragraph3.Description2"),
                t("Background.Paragraph3.Description3")
            )}
            {createParagraphWithBoldText(
                t("Background.Paragraph4.Description1"),
                t("Background.Paragraph4.Description2"),
                t("Background.Paragraph4.Description3")
            )}
        </div>
    );

    const methodsIsolatesAccordionContent = (
        <div>
            {createParagraphWithBoldText(
                t("Methods.Isolates.Paragraph1.Description1"),
                t("Methods.Isolates.Paragraph1.Description2"),
                t("Methods.Isolates.Paragraph1.Description3")
            )}
            {createParagraphWithBoldText(
                t("Methods.Isolates.Paragraph2.Description1"),
                t("Methods.Isolates.Paragraph2.Description2"),
                t("Methods.Isolates.Paragraph2.Description3")
            )}
        </div>
    );

    return (
        <Box sx={{ width: "60%", margin: "2em auto" }}>
            <Typography
                variant="h1"
                sx={{
                    marginBottom: "1rem",
                    paddingBottom: "0.5em",
                    fontSize: "3rem",
                    textAlign: "center",
                    fontWeight: "normal",
                    color: theme.palette.primary.main,
                    borderBottom: `1px solid ${theme.palette.primary.main}`,
                }}
            >
                {t("Title")}
            </Typography>
            <Box sx={{ display: "grid" }}>
                <Box sx={{ margin: "0 auto", display: "grid" }}>
                    <Button
                        variant="contained"
                        sx={navButtonStyle}
                        href="#methods"
                    >
                        {methodsChapterHeading}
                    </Button>
                </Box>
            </Box>
            <div>
                <ZNAccordion
                    title={backgroundChapterHeading}
                    content={backgroundAccordionContent}
                    defaultExpanded={false}
                    centerContent={false}
                />
                <Typography sx={subHeadingStyle} id="methods">
                    {methodsChapterHeading}
                </Typography>
                <div>
                    <ZNAccordion
                        title={t("Methods.Isolates.Name")}
                        content={methodsIsolatesAccordionContent}
                        defaultExpanded={false}
                        centerContent={false}
                    />
                    <ZNAccordion
                        title={t("Methods.Amrs.Name")}
                        content={
                            <InfoPageAmrsContentComponent
                                amrKeys={props.amrKeys}
                                tableData={props.tableData}
                                onAmrDataExport={handleExportAmrData}
                            />
                        }
                        defaultExpanded={false}
                        centerContent={false}
                    />
                </div>
            </div>
        </Box>
    );
}
