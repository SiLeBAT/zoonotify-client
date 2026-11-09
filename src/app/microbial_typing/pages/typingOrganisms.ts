/**
 * A run of a microorganism's display name. Genus and species are set in
 * italics; "spp." and abbreviations such as MRSA/STEC are not.
 */
export interface NameSegment {
    readonly text: string;
    readonly italic?: boolean;
}

export interface TypingOrganism {
    /** Stable value carried in the URL as `?microorganism=`. */
    readonly id: string;
    readonly segments: readonly NameSegment[];
}

/**
 * The microorganisms offered on the typing page, in sidebar order. The italics
 * are spelled out per entry rather than guessed from a word list, so a name
 * like "Listeria monocytogenes" is formatted exactly as the ticket shows it.
 */
export const TYPING_ORGANISMS: readonly TypingOrganism[] = [
    {
        id: "Salmonella spp.",
        segments: [{ text: "Salmonella", italic: true }, { text: " spp." }],
    },
    {
        id: "Campylobacter spp.",
        segments: [{ text: "Campylobacter", italic: true }, { text: " spp." }],
    },
    {
        id: "Listeria monocytogenes",
        segments: [{ text: "Listeria monocytogenes", italic: true }],
    },
    { id: "MRSA", segments: [{ text: "MRSA" }] },
    { id: "STEC", segments: [{ text: "STEC" }] },
    {
        id: "Enterococcus spp.",
        segments: [{ text: "Enterococcus", italic: true }, { text: " spp." }],
    },
];

export const MICROORGANISM_PARAM = "microorganism";

/** The organism a `?microorganism=` value names, or the first one. */
export function resolveTypingOrganism(
    value: string | null | undefined
): TypingOrganism {
    return (
        TYPING_ORGANISMS.find((organism) => organism.id === value) ??
        TYPING_ORGANISMS[0]
    );
}
