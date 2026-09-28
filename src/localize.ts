// Minimal localization helper for the SIP Core frontend cards.
//
// Lovelace custom cards are not wired up to Home Assistant's backend
// `translations/*.json` files (those only cover config/options flow strings),
// so the UI text rendered by these cards ships its own dictionary here and
// picks a language based on the `hass` object provided by the frontend.
//
// The actual per-language strings live in `./translations/<language>.ts`.

import en from "./translations/en";
import de from "./translations/de";

export type SupportedLanguage = "en" | "de";

const DEFAULT_LANGUAGE: SupportedLanguage = "en";

const translations: Record<SupportedLanguage, Record<string, string>> = {
    en,
    de,
};

/** Resolves the two-letter language code Home Assistant reports on `hass`. */
function resolveLanguage(hass: any): SupportedLanguage {
    const raw: string | undefined = hass?.locale?.language || hass?.language;
    if (!raw) return DEFAULT_LANGUAGE;

    const base = raw.toLowerCase().split("-")[0];
    return base in translations ? (base as SupportedLanguage) : DEFAULT_LANGUAGE;
}

/**
 * Looks up `key` in the dictionary for the language reported by `hass`,
 * falling back to English (and finally the key itself) when missing.
 * `substitutions` values replace `{placeholder}` tokens in the string.
 */
export function localize(
    hass: any,
    key: string,
    substitutions?: Record<string, string | number | null | undefined>,
): string {
    const language = resolveLanguage(hass);
    let translation = translations[language]?.[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;

    if (substitutions) {
        for (const [placeholder, value] of Object.entries(substitutions)) {
            translation = translation.replace(new RegExp(`{${placeholder}}`, "g"), value == null ? "" : String(value));
        }
    }

    return translation;
}
