import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Markdown from "markdown-to-jsx";
import React from "react";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import { ExplanationTermComponent } from "../components/ExplanationTermComponent copy";
import { InfoPageAmrDialogComponent } from "../components/InfoPage-AmrsDialog.component";
import { AmrKey, AmrsTable } from "../model/ExplanationPage.model";
import { useExplanationPageComponent } from "./explanationUseCases";
export function InfoPageComponent(props: {
    tableData: Record<AmrKey, AmrsTable>;
    onAmrDataExport: (amrKey: AmrKey) => void;
}): JSX.Element {
    const { model, operations } = useExplanationPageComponent(null);

    const theme = useTheme();

    const subHeadingStyle = {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        padding: "0.5em",
        margin: "1em 0",
    } as const;

    const handleExportAmrData = (amrKey: AmrKey): void => {
        props.onAmrDataExport(amrKey);
    };

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
                {model.title}
            </Typography>
            <div>
                {model.mainSection.length > 0 ? (
                    <ZNAccordion
                        key="mainSection"
                        title={model.mainSection[0].title}
                        content={
                            <Markdown>
                                {model.mainSection[0].description}
                            </Markdown>
                        }
                        defaultExpanded={false}
                        centerContent={false}
                    />
                ) : null}
                {Object.entries(model.explanationCollection).length > 0
                    ? Object.entries(model.explanationCollection).map(
                          ([sectionToken, explanations]) => {
                              return (
                                  <div key={sectionToken}>
                                      <Typography
                                          sx={subHeadingStyle}
                                          id={sectionToken}
                                      >
                                          {sectionToken}
                                      </Typography>
                                      <div>
                                          {explanations.map((explanation) => {
                                              return (
                                                  <ZNAccordion
                                                      key={explanation.title}
                                                      title={explanation.title}
                                                      content={
                                                          <ExplanationTermComponent
                                                              handleOpen={
                                                                  operations.handleOpen
                                                              }
                                                              description={
                                                                  explanation.description
                                                              }
                                                          ></ExplanationTermComponent>
                                                      }
                                                      defaultExpanded={false}
                                                      centerContent={false}
                                                  />
                                              );
                                          })}
                                      </div>
                                  </div>
                              );
                          }
                      )
                    : null}
                {model.openAmrDialog && model.currentAMRID ? (
                    <InfoPageAmrDialogComponent
                        resistancesTableData={
                            props.tableData[model.currentAMRID as AmrKey]
                        }
                        onClose={operations.handleClose}
                        onAmrDataExport={() =>
                            handleExportAmrData(model.currentAMRID as AmrKey)
                        }
                    />
                ) : null}
            </div>
        </Box>
    );
}
