export const slugify = (s: string): string =>
    (s || "")
        .toLowerCase()
        .normalize("NFKD") // remove accents
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-") // non-alphanum → dash
        .replace(/^-+|-+$/g, ""); // trim dashes
