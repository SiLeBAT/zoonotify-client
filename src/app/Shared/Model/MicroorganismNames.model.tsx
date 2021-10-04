import React from "react";

export type MicroorganismLabelKey =
    "Campylobacter spp" |
    "E coli" |
    "ESBL/AmpC-E coli" |
    "Listeria monocytogenes" |
    "MRSA" |
    "Salmonella spp" |
    "STEC" |
    "CARBA-E coli" |
    "Enterococcus spp" |
    "spp";

export const microorganismLabels: Record<MicroorganismLabelKey, string | JSX.Element> = {
    "Campylobacter spp": <i>Campylobacter</i>,
    "E coli": <i>E. coli</i>,
    "ESBL/AmpC-E coli": "ESBL/AmpC-",
    "Listeria monocytogenes": <i>L. monocytogenes</i>,
    "MRSA": "MRSA",
    "Salmonella spp": <i>Salmonella</i>,
    "STEC": "STEC",
    "CARBA-E coli": "Carba-",
    "Enterococcus spp": <i>Enterococcus</i>,
    "spp": " spp.",
};
