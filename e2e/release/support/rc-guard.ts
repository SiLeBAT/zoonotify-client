/**
 * RC guard: QA may be serving a different build than the one under test (a
 * later merge redeployed it, or cd-qa has not finished). Compare the commit the
 * footer reports with the commit the run was started for.
 */
export const RC_GUARD_MESSAGE = "QA is not serving this RC";

/** The hash from the footer tooltip text `client commit@<hash>`, or null. */
export function servedCommit(footerText: string): string | null {
    return /client commit@([0-9a-f]{7,40})/i.exec(footerText)?.[1] ?? null;
}

/** Short and full hashes both occur; they match when one is a prefix of the other. */
export function commitMatches(
    expected: string,
    served: string | null
): boolean {
    if (!served) return false;
    const a = expected.trim().toLowerCase();
    const b = served.trim().toLowerCase();
    return a.length > 0 && (a.startsWith(b) || b.startsWith(a));
}

/** What the report shows when the footer does not say which commit it serves. */
export const UNKNOWN_COMMIT = "unknown";

/**
 * Whether the guard passes. Without an expected commit (the post-release run)
 * nothing is compared, so an older build whose footer carries no commit still
 * passes; with one, a missing or different commit fails.
 */
export function guardPasses(
    expected: string | undefined,
    served: string | null
): boolean {
    if (!expected) return true;
    return commitMatches(expected, served);
}
