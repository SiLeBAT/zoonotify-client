/** The organisms the antibiotic resistance page offers, as its fixed labels. */

export const ESBL_AMPC_E_COLI = "ESBL/AmpC E. coli";

export const AMR_ORGANISMS: readonly string[] = [
    "E. coli",
    ESBL_AMPC_E_COLI,
    "Campylobacter spp.",
    "Salmonella spp.",
    "MRSA",
    "STEC",
    "Enterococcus spp.",
];

/**
 * Organisms that are listed in the sidebar but have no resistance data in the
 * CMS yet. Selecting one announces "Coming soon" rather than rendering charts
 * that would resolve to an empty result set. Single source: the Link Finder
 * skips these too.
 */
export const AMR_ORGANISMS_WITHOUT_DATA: ReadonlySet<string> = new Set([
    ESBL_AMPC_E_COLI,
]);
