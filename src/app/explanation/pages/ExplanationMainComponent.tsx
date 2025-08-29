// InfoPageComponent.tsx
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Markdown from "markdown-to-jsx";
import React from "react";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import { ExplanationTermComponent } from "../components/ExplanationTermComponent copy";
import { InfoPageAmrDialogComponent } from "../components/InfoPage-AmrsDialog.component";
import {
    AmrKey,
    AmrsTable,
    ExplanationDTO,
    ExplanationCollection,
} from "../model/ExplanationPage.model";
import { useExplanationPageComponent } from "./explanationUseCases";

import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";

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

    // Our hook now groups by normalized SectionCode keys (BACKGROUND, METHODS, ...)
    // but this cast still works fine.
    const typedEntries: Array<[string, ExplanationDTO[]]> = Object.entries(
        (model.explanationCollection || {}) as ExplanationCollection
    ) as Array<[string, ExplanationDTO[]]>;

    // Optional: enforce desired order visually
    const order: string[] = ["BACKGROUND", "METHODS", "GRAPHS", "DATA", "MAIN"];
    const sortedEntries =
        typedEntries.length > 0
            ? [...typedEntries].sort(
                  ([a], [b]) => order.indexOf(a) - order.indexOf(b)
              )
            : [];

    return (
        <PageLayoutComponent>
            <Box
                sx={{
                    width: "60%",
                    maxHeight: "calc(100vh - 140px)",
                    overflowY: "auto",
                    margin: "2em auto",
                }}
            >
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
                    {/* MAIN section (deep-linkable) */}
                    {model.mainSection.length > 0 ? (
                        <section id={model.mainSection[0].anchor}>
                            <Box
                                sx={{
                                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                                }}
                            >
                                <ZNAccordion
                                    key="mainSection"
                                    title={model.mainSection[0].title}
                                    content={
                                        <Markdown>
                                            {model.mainSection[0].description}
                                        </Markdown>
                                    }
                                    expanded={
                                        model.activeAnchor ===
                                        model.mainSection[0].anchor
                                    }
                                    defaultExpanded={false}
                                    centerContent={false}
                                    onToggle={(open) =>
                                        open &&
                                        operations.openSectionByAnchor(
                                            model.mainSection[0].anchor
                                        )
                                    }
                                />
                            </Box>
                        </section>
                    ) : null}

                    {/* Other CMS sections */}
                    {sortedEntries.length > 0
                        ? sortedEntries.map(([sectionToken, explanations]) => (
                              <div key={sectionToken}>
                                  <Typography
                                      sx={subHeadingStyle}
                                      id={sectionToken}
                                  >
                                      {/* 🔴 Use translated label from the hook */}
                                      {operations.getSectionLabel(sectionToken)}
                                  </Typography>

                                  <div>
                                      {explanations.map((explanation) => (
                                          <section
                                              key={explanation.anchor}
                                              id={explanation.anchor}
                                          >
                                              <Box
                                                  sx={{
                                                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                  }}
                                              >
                                                  <ZNAccordion
                                                      key={explanation.anchor}
                                                      title={explanation.title}
                                                      content={
                                                          <ExplanationTermComponent
                                                              handleOpen={
                                                                  operations.handleOpen
                                                              }
                                                              description={
                                                                  explanation.description
                                                              }
                                                          />
                                                      }
                                                      expanded={
                                                          model.activeAnchor ===
                                                          explanation.anchor
                                                      }
                                                      defaultExpanded={false}
                                                      centerContent={false}
                                                      onToggle={(open) =>
                                                          open &&
                                                          operations.openSectionByAnchor(
                                                              explanation.anchor
                                                          )
                                                      }
                                                  />
                                              </Box>
                                          </section>
                                      ))}
                                  </div>
                              </div>
                          ))
                        : null}

                    {/* AMR dialog */}
                    {model.openAmrDialog && model.currentAMRID ? (
                        <InfoPageAmrDialogComponent
                            resistancesTableData={
                                props.tableData[model.currentAMRID as AmrKey]
                            }
                            onClose={operations.handleClose}
                        />
                    ) : null}
                </div>
            </Box>
        </PageLayoutComponent>
    );
}
