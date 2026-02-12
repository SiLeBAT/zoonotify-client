import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import {
    SearchParameters,
    usePrevalenceFilters,
} from "./PrevalenceDataContext";

interface DataGridControlsProps {
    heading: string;
}

type SearchParameterDisplayProps = {
    searchParameters: SearchParameters;
};

type SearchParameterEntryProps = {
    title: string;
    value: JSX.Element | string | null;
};

const italicWords: string[] = [
    "Salmonella",
    "coli",
    "E.",
    "Bacillus",
    "cereus",
    "monocytogenes",
    "Clostridioides",
    "difficile",
    "Yersinia",
    "Listeria",
    "enterocolitica",
    "Vibrio",
    "Baylisascaris",
    "procyonis",
    "Echinococcus",
    "Campylobacter",
];

// Format microorganism names (italicize relevant parts)
const formatMicroorganismName = (
    microName: string | null | undefined
): JSX.Element => {
    if (!microName) return <></>;
    const words = microName
        .split(/([-\s])/)
        .filter((part: string) => part.length > 0);

    return (
        <>
            {words.map((word: string, index: number) => {
                if (word.trim() === "" || word === "-") return word;
                const italic = italicWords.some((w) =>
                    word.toLowerCase().includes(w.toLowerCase())
                );
                return italic ? (
                    <i key={index}>{word}</i>
                ) : (
                    <span key={index}>{word}</span>
                );
            })}
        </>
    );
};

/** ---------- Label memory hook (id -> label) ----------
 * Persists labels we’ve seen so the summary can always use names.
 * We only ever display names; if a label can't be resolved, we drop it.
 */
type OptionLike = { documentId?: string; name?: string } | undefined;

function useLabelMemory(options?: OptionLike[]): Map<string, string> {
    const ref = useRef<Map<string, string>>(new Map());
    useEffect(() => {
        if (!options) return;
        const mem = ref.current;
        for (const o of options) {
            if (o?.documentId && o?.name) {
                const key = String(o.documentId);
                if (mem.get(key) !== o.name) mem.set(key, o.name);
            }
        }
    }, [options]);
    return ref.current; // stable Map
}

// Display card row
const SearchParameterEntry: React.FC<SearchParameterEntryProps> = ({
    title,
    value,
}) => {
    if (!value) return null;
    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 1,
                border: 1,
                borderRadius: 1,
                mb: 1,
                backgroundColor: theme.palette.grey[100],
                width: "100%",
                maxWidth: "1200px",
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{
                    fontWeight: "bold",
                    mr: 1,
                    color: theme.palette.text.primary,
                    display: "inline",
                }}
            >
                {title}:
            </Typography>
            <Typography
                variant="body2"
                sx={{ color: theme.palette.text.primary, display: "inline" }}
            >
                {value}
            </Typography>
        </Box>
    );
};

const SearchParameterDisplay: React.FC<SearchParameterDisplayProps> = ({
    searchParameters,
}) => {
    const theme = useTheme();
    const { t } = useTranslation(["PrevalencePage"]);

    // Latest option lists from context (may be filtered by other selections)
    const {
        microorganismOptions,
        matrixOptions,
        sampleOriginOptions,
        matrixGroupOptions,
        samplingStageOptions,
        superCategorySampleOriginOptions,
    } = usePrevalenceFilters();

    // Persistent label memories per facet
    const memMicro = useLabelMemory(microorganismOptions);
    const memMatrix = useLabelMemory(matrixOptions);
    const memSampleOrigin = useLabelMemory(sampleOriginOptions);
    const memMatrixGroup = useLabelMemory(matrixGroupOptions);
    const memSamplingStage = useLabelMemory(samplingStageOptions);
    const memSuperCategory = useLabelMemory(superCategorySampleOriginOptions);

    // Map IDs to labels using memory; drop anything we can't resolve (no IDs, no "N selected")
    const mapToLabels: (
        vals: string[] | undefined,
        mem: Map<string, string>
    ) => string[] = useMemo(
        () =>
            (
                vals: string[] | undefined,
                mem: Map<string, string>
            ): string[] => {
                const out: string[] = [];
                for (const v of vals ?? []) {
                    const label = mem.get(v);
                    if (label) out.push(label);
                }
                return out;
            },
        []
    );

    // Render helpers
    const renderList = (
        vals: string[] | undefined,
        mem: Map<string, string>
    ): string | null => {
        const labels = mapToLabels(vals, mem);
        if (labels.length === 0) return null; // show nothing rather than IDs or counts
        return labels.join(", ");
    };

    const renderMicroList = (
        vals: string[] | undefined
    ): JSX.Element | null => {
        const labels = mapToLabels(vals, memMicro);
        if (labels.length === 0) return null;
        return (
            <>
                {labels.map((name, i) => (
                    <span key={`${name}-${i}`}>
                        {formatMicroorganismName(name)}
                        {i < labels.length - 1 ? ", " : ""}
                    </span>
                ))}
            </>
        );
    };

    return (
        <Box
            sx={{
                pt: theme.spacing(3),
                display: "flex",
                flexDirection: "column",
                width: "100%",
            }}
        >
            {/* Microorganisms (formatted) */}
            {searchParameters.microorganism?.length > 0 && (
                <SearchParameterEntry
                    title={t("MICROORGANISMS")}
                    value={renderMicroList(searchParameters.microorganism)}
                />
            )}

            {/* Matrix */}
            {searchParameters.matrix?.length > 0 && (
                <SearchParameterEntry
                    title={t("MATRIX")}
                    value={renderList(searchParameters.matrix, memMatrix)}
                />
            )}

            {/* Sample Origin */}
            {searchParameters.sampleOrigin?.length > 0 && (
                <SearchParameterEntry
                    title={t("SAMPLE_ORIGIN")}
                    value={renderList(
                        searchParameters.sampleOrigin,
                        memSampleOrigin
                    )}
                />
            )}

            {/* Matrix Group */}
            {searchParameters.matrixGroup?.length > 0 && (
                <SearchParameterEntry
                    title={t("MATRIX_GROUP")}
                    value={renderList(
                        searchParameters.matrixGroup,
                        memMatrixGroup
                    )}
                />
            )}

            {/* Year (already human) */}
            {searchParameters.samplingYear?.length > 0 && (
                <SearchParameterEntry
                    title={t("SAMPLING_YEAR")}
                    value={(searchParameters.samplingYear ?? []).join(", ")}
                />
            )}

            {/* Super Category Sample Origin */}
            {searchParameters.superCategorySampleOrigin?.length > 0 && (
                <SearchParameterEntry
                    title={t("SUPER-CATEGORY-SAMPLE-ORIGIN")}
                    value={renderList(
                        searchParameters.superCategorySampleOrigin,
                        memSuperCategory
                    )}
                />
            )}

            {/* Sampling Stage */}
            {searchParameters.samplingStage?.length > 0 && (
                <SearchParameterEntry
                    title={t("SAMPLING_STAGE")}
                    value={renderList(
                        searchParameters.samplingStage,
                        memSamplingStage
                    )}
                />
            )}
        </Box>
    );
};

const DataGridControls: React.FC<DataGridControlsProps> = ({ heading }) => {
    const { searchParameters } = usePrevalenceFilters();
    return (
        <ZNAccordion
            title={heading}
            content={
                <SearchParameterDisplay searchParameters={searchParameters} />
            }
            defaultExpanded={true}
            centerContent={true}
        />
    );
};

export { DataGridControls };
