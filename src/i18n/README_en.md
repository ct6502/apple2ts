# Apple2TS i18n Developer Guide

This directory contains the core internationalization (i18n) engine and maintenance tools for Apple2TS. Refer to this guide when merging upstream changes or adding new translation keys.

## 🛠️ Maintenance Tools

### 1. `i18n_master.cjs` — Deprecated
Do not use this script. It filled missing locale keys with copied English,
which hid untranslated entries. It now exits without changing files. Until
the planned PO workflow replaces these files, add English keys to `en.ts` and
add only real translations to the applicable locale files.

### 2. `i18n_bootstrap.cjs` — Archived Reference
The original bootstrap is retained under `archive/` as implementation history.
Do not run it for current maintenance or new projects: it copies English into
every locale and does not generate the current runtime fallback behavior.

---

## 🔄 Workflow: Adding or Updating Translations

Example: you've added a new "Printer Menu" feature and need translations for it.

1. **Add keys to the English source file**:
   Edit `src/i18n/languages/en.ts` and add your new key-value pairs.
   ```typescript
   printer: {
     print: "Print Now",
     clear: "Clear Buffer"
   }
   ```

2. **Add available translations**:
   Add the new key only to locale files for which you have an actual
   translation. Do not copy the English value merely to make every catalog
   structurally identical. An intentionally identical name or technical term
   may remain when it is valid locale text.

   Remove an existing locale entry when its provenance or review establishes
   that it is placeholder English copied from the source rather than an
   intentional translation. Equality with English alone is not sufficient:
   validated names and technical terms may legitimately match.

3. **Leave unavailable translations absent**:
   The runtime falls back to `en.ts` when a locale key is missing. This keeps
   the application readable while leaving untranslated entries identifiable.

4. **Use translations in a component**:
   ```tsx
   import { useTranslation } from "../../i18n/useTranslation";
   // ...
   const { t } = useTranslation();
   return <button title={t("printer.print")}>{t("printer.print")}</button>;
   ```

## 📁 Directory Structure

- `index.ts` — Core i18n manager: language detection, persistence, and translation lookup.
- `useTranslation.ts` — React hook that lets components reactively respond to language changes.
- `languages/` — The 13 language data files (`.ts` format for type checking).
- `i18n_master.cjs` — Deprecated guard retained to prevent use of the old sync workflow.
- `archive/` — Historical bootstrap material; not the current maintenance workflow.

---

## 🤖 Instructions for AI Agents

If you are an AI assistant maintaining this project, follow these rules when working on anything i18n-related:

1. **Treat `en.ts` as the single source of truth.** Always refer to `src/i18n/languages/en.ts` for the canonical key structure.
2. **Standard workflow for adding translations**:
   - Define the new key and English value in `en.ts` first.
   - Add only verified translations to the applicable locale files.
   - Do not run `i18n_master.cjs` or copy English values to complete catalog structure.
3. **Preserve intentional fallback**: A locale file such as `zh-TW.ts` may omit an `en.ts` key when no translation exists. The runtime will display English automatically.
4. **Hardcoded strings in UI components**: When editing any `.tsx` file, convert hardcoded strings to `t("category.key")` calls.
5. **Interpolation syntax**: For dynamic values in translation strings, use `{{variable}}` syntax and pass the variable when calling `t`, e.g. `t("disk.syncedAt", { date: "2024-01-01" })`.

When a user asks you to add a feature or fix a translation, preserve existing
translations and add only translations supported by the task.
