import React, { useRef, useState } from "react";
import { Box, Button, Chip, Link, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    DataIndex,
    FoundLink,
    Lang,
    LinkFinder,
    LinkKind,
    linkKind,
    OrganismChoice,
} from "..";

type State =
    | { kind: "idle" }
    | { kind: "searching" }
    | { kind: "unavailable" }
    | {
          kind: "done";
          links: FoundLink[];
          unmatched: string[];
          /** Organisms to pick from, with the text they re-run. */
          chooseOrganism?: OrganismChoice[];
          noResistanceData?: true;
          searched: string;
      };

export interface LinkFinderSearchProps {
    finder: LinkFinder;
    index: DataIndex;
}

/** The i18n key of the page a link opens. */
const TITLE_KEY_OF_KIND: { [K in LinkKind]: string } = {
    prevalence: "PagePrevalence",
    amrSubstance: "PageAmrSubstance",
    amrTrend: "PageAmrTrend",
    antimicrobialUse: "PageAntimicrobialUse",
    microbialCounts: "PageMicrobialCounts",
    evaluations: "PageEvaluations",
};

function toLang(language: string | undefined): Lang {
    return language && language.toLowerCase().startsWith("en") ? "en" : "de";
}

/**
 * A plain-language search answered with pre-filtered links. The search text stays in this
 * component's state: it is never put in the page URL, logged or sent anywhere.
 */
export function LinkFinderSearch({
    finder,
    index,
}: LinkFinderSearchProps): JSX.Element {
    const { t, i18n } = useTranslation(["LinkFinder"]);
    const [text, setText] = useState("");
    const [state, setState] = useState<State>({ kind: "idle" });
    const latest = useRef(0);

    async function run(searched: string, organism?: string): Promise<void> {
        if (!searched.trim()) return;
        latest.current += 1;
        const mine = latest.current;
        setState({ kind: "searching" });
        try {
            const lang = toLang(i18n.language);
            const result = await finder.find(searched, lang, index, organism);
            if (mine === latest.current)
                setState({ kind: "done", ...result, searched });
        } catch {
            if (mine === latest.current) setState({ kind: "unavailable" });
        }
    }

    const onSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        void run(text);
    };

    let status = "";
    if (state.kind === "searching") status = t("Searching");
    if (state.kind === "unavailable") status = t("Unavailable");
    const choices = state.kind === "done" ? state.chooseOrganism ?? [] : [];
    if (state.kind === "done")
        status = choices.length
            ? t("ChooseOrganism")
            : state.links.length
            ? t("Found", { count: state.links.length })
            : state.noResistanceData
            ? t("NoResistanceData")
            : t("NoLinks");

    return (
        <Box
            component="section"
            aria-labelledby="link-finder-heading"
            // Aligned with the home page's logo card: half width, 90% on phones.
            sx={{
                width: "50%",
                margin: "2.5em auto 0",
                boxSizing: "border-box",
                "@media (max-width: 800px)": {
                    width: "90%",
                    margin: "1em auto 0",
                },
            }}
        >
            <Typography
                id="link-finder-heading"
                component="h2"
                variant="h6"
                sx={{ mb: 1 }}
            >
                {t("Heading")}
            </Typography>
            <Box
                component="form"
                role="search"
                onSubmit={onSubmit}
                sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                }}
            >
                <TextField
                    id="link-finder-input"
                    type="search"
                    label={t("SearchLabel")}
                    placeholder={t("Placeholder")}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    autoComplete="off"
                    size="small"
                    inputProps={{ "aria-describedby": "link-finder-hint" }}
                    sx={{ flex: "1 1 16rem", minWidth: 0 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={state.kind === "searching"}
                >
                    {t("SearchButton")}
                </Button>
            </Box>
            <Typography
                id="link-finder-hint"
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
            >
                {t("ScopeHint")}
            </Typography>
            <Box role="status" aria-live="polite" sx={{ mt: 1 }}>
                {status && <Typography variant="body2">{status}</Typography>}
                {state.kind === "done" && state.unmatched.length > 0 && (
                    <Typography variant="body2">
                        {t("Unmatched", { words: state.unmatched.join(", ") })}
                    </Typography>
                )}
            </Box>
            {state.kind === "done" && choices.length > 0 && (
                <Box
                    role="group"
                    aria-label={String(t("ChooseOrganism"))}
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                >
                    {choices.map((choice) => (
                        <Button
                            key={choice.organism}
                            variant="outlined"
                            size="small"
                            onClick={() =>
                                void run(state.searched, choice.organism)
                            }
                        >
                            {choice.label}
                        </Button>
                    ))}
                </Box>
            )}
            {state.kind === "done" && state.links.length > 0 && (
                <Box
                    component="ul"
                    sx={{ listStyle: "none", p: 0, m: 0, mt: 1 }}
                >
                    {state.links.map((link) => (
                        <Box component="li" key={link.url} sx={{ mb: 1 }}>
                            <Link
                                component={RouterLink}
                                to={link.url}
                                underline="hover"
                                sx={{
                                    display: "block",
                                    p: 1,
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius: 1,
                                    overflowWrap: "anywhere",
                                }}
                            >
                                <Typography component="span" fontWeight="bold">
                                    {t(TITLE_KEY_OF_KIND[linkKind(link)])}
                                </Typography>
                                {link.closest && (
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        sx={{ ml: 1, fontStyle: "italic" }}
                                    >
                                        {t("Closest")}
                                    </Typography>
                                )}
                                {link.dropped.length > 0 && (
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        sx={{
                                            display: "block",
                                            mt: 0.5,
                                            fontStyle: "italic",
                                            color: "text.secondary",
                                        }}
                                    >
                                        {t("Without", {
                                            values: link.dropped
                                                .map((d) => d.text)
                                                .join(", "),
                                        })}
                                    </Typography>
                                )}
                                <Box
                                    component="span"
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                        mt: 0.5,
                                    }}
                                >
                                    {link.labels.map((label) => (
                                        <Chip
                                            key={`${label.dim}:${label.text}`}
                                            component="span"
                                            size="small"
                                            label={label.text}
                                            sx={{
                                                maxWidth: "100%",
                                                height: "auto",
                                                cursor: "inherit",
                                                "& .MuiChip-label": {
                                                    whiteSpace: "normal",
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Link>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}
