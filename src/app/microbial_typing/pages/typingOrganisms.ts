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
    /**
     * How the CMS is asked for the organism's rows, where its `id` is not the
     * CMS name: a fragment of the localized name, and the one typing method
     * to chart, by its name in each locale. Without it, the `id` is the name
     * and every typing method is fetched.
     */
    readonly cms?: {
        readonly nameContains: string;
        readonly typings: readonly string[];
    };
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
    {
        id: "MRSA",
        segments: [{ text: "MRSA" }],
        // The CMS has "Methicillin-resistant Staphylococcus aureus (MRSA)"
        // (de: "Methicillin-resistente …"), typed by clonal group and by spa
        // type; the chart shows the clonal groups (#1956).
        cms: {
            nameContains: "MRSA",
            typings: ["MRSA Clonal Complex", "MRSA klonale Gruppe"],
        },
    },
    { id: "STEC", segments: [{ text: "STEC" }] },
    {
        id: "Enterococcus spp.",
        segments: [{ text: "Enterococcus", italic: true }, { text: " spp." }],
    },
];

export const MICROORGANISM_PARAM = "microorganism";
