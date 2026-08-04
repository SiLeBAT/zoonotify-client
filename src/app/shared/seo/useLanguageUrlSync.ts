import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { isSupportedLanguage, normalizeLanguage } from "./seo.model";

/** The query parameter that carries the active language. */
export const LANG_PARAM = "lang";

/** Pre-unification parameter name, still read so old links keep working. */
export const LEGACY_LANG_PARAM = "locale";

/**
 * Single source of truth for the language <-> URL relationship.
 *
 * Mounted once inside the router; see Body-Router.component.tsx.
 */
export function useLanguageUrlSync(): void {
    const { i18n } = useTranslation();
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const requested =
            params.get(LANG_PARAM) ?? params.get(LEGACY_LANG_PARAM);
        const active = normalizeLanguage(i18n.language);

        // URL -> i18next. Only a language we actually publish is honoured; an
        // unsupported value is left to the write-back below, which corrects the
        // URL instead of moving the reader.
        if (requested && isSupportedLanguage(requested)) {
            const normalized = normalizeLanguage(requested);
            if (normalized !== active) {
                i18n.changeLanguage(normalized);
                return;
            }
        }

        // i18next -> URL, collapsing the legacy parameter onto the canonical one.
        if (
            params.get(LANG_PARAM) === active &&
            !params.has(LEGACY_LANG_PARAM)
        ) {
            return;
        }
        params.delete(LEGACY_LANG_PARAM);
        params.set(LANG_PARAM, active);
        history.replace({
            pathname: location.pathname,
            search: params.toString(),
            hash: location.hash,
        });
    }, [
        location.search,
        location.pathname,
        location.hash,
        i18n,
        i18n.language,
        history,
    ]);
}
