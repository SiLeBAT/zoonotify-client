import i18n from "../../i18n";

/**
 * @desc Service to change the language using i18n
 * @param {string} lang - key for the selected language ("de"/"en")
 * @returns {void}
 */
export function changeAppLanguage(lang: string): void {
    i18n.changeLanguage(lang);
}
