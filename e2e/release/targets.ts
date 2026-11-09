/**
 * The only per-target expectations of the release checks, selected by
 * `E2E_TARGET=qa|prod`. Everything else is read live from the site under test.
 *
 * Whoever flips one of these flags on a deployment (e.g.
 * REACT_APP_API_REFERENCE_LINKED at go-live) edits this file in the same change.
 */
export interface Target {
    name: "qa" | "prod";
    /** Whether the footer links the API reference (REACT_APP_API_REFERENCE_LINKED). */
    apiReferenceLinked: boolean;
}

export const TARGETS: Record<Target["name"], Target> = {
    qa: { name: "qa", apiReferenceLinked: true },
    prod: { name: "prod", apiReferenceLinked: false },
};

/** Throws on a missing or unknown value: a release run must say what it checks. */
export function resolveTarget(value: string | undefined): Target {
    if (!value || !Object.prototype.hasOwnProperty.call(TARGETS, value)) {
        throw new Error(
            `E2E_TARGET must be one of ${Object.keys(TARGETS).join(
                ", "
            )}, got ${JSON.stringify(value)}`
        );
    }
    return TARGETS[value as Target["name"]];
}

/** The target of this run, from `E2E_TARGET`. */
export function currentTarget(): Target {
    return resolveTarget(process.env.E2E_TARGET);
}
