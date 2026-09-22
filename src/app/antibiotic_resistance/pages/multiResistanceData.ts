import type { MultiResistanceItem } from "./multiResistanceHelpers";
import fixture from "./fixtures/multiResistance.fixture.json";

type Fixture = Record<
    string,
    { en: MultiResistanceItem[]; de: MultiResistanceItem[] }
>;

/**
 * The one seam for Multi-resistance data. Until the CMS has a
 * `multi-resistance` collection it serves a local fixture (plan phase 3 swaps
 * this for REST); the fixture must never reach `develop`.
 */
export async function fetchMultiResistance(
    microorganism: string,
    locale: string
): Promise<MultiResistanceItem[]> {
    const rows = (fixture as Fixture)[microorganism];
    if (!rows) return [];
    return locale.startsWith("de") ? rows.de : rows.en;
}
