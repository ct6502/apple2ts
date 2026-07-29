# Apple2TS i18n Developer Guide

This directory contains the core internationalization (i18n) engine and maintenance tools for Apple2TS. Refer to this guide when merging upstream changes or adding new translation keys.

## 🛠️ Maintenance Tools

### 1. `i18n_master.cjs` — Sync & Maintain Language Files
Run this script after adding keys to `en.ts` or merging upstream code that introduces new translatable strings.
- **What it does**: Uses `en.ts` as the source of truth and automatically fills in missing keys across all 12 other language files.
- **Smart defaults**: Preserves existing translations; uses a built-in dictionary to auto-translate common technical terms (e.g. Load, Save, Disk) for new keys.
- **Run with**:
  ```bash
  node src/i18n/i18n_master.cjs
  ```

### 2. `i18n_bootstrap.cjs` — Bootstrap a New Project
Use this if you want to port the same 13-language i18n architecture to a different React project.
- **What it does**: Generates the i18n engine, language switcher, all 13 language stubs, and an example panel.
- **Run with**:
  ```bash
  node src/i18n/archive/i18n_initial_bootstrap.cjs
  ```

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

2. **Sync all languages in one step**:
   Run `i18n_master.cjs` — it will add the new structure to every language file automatically.
   ```bash
   node src/i18n/i18n_master.cjs
   ```

3. **Refine specific translations (optional)**:
   If the auto-generated defaults aren't accurate enough for a particular language, manually edit that file (e.g. `zh-TW.ts` or `ja.ts`).

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
- `*.cjs` — Automation scripts for maintenance tasks.

---

## 🤖 Instructions for AI Agents

If you are an AI assistant maintaining this project, follow these rules when working on anything i18n-related:

1. **Treat `en.ts` as the single source of truth.** Always refer to `src/i18n/languages/en.ts` for the canonical key structure.
2. **Standard workflow for adding translations**:
   - Define the new key and English value in `en.ts` first.
   - Immediately run `node src/i18n/i18n_master.cjs` to propagate changes.
   - Do **not** manually edit all 13 language files individually unless making precise per-language adjustments.
3. **Detect structural drift**: If you notice a language file (e.g. `zh-TW.ts`) is missing keys that exist in `en.ts`, run `node src/i18n/i18n_master.cjs` to resync.
4. **Hardcoded strings in UI components**: When editing any `.tsx` file, convert hardcoded strings to `t("category.key")` calls.
5. **Interpolation syntax**: For dynamic values in translation strings, use `{{variable}}` syntax and pass the variable when calling `t`, e.g. `t("disk.syncedAt", { date: "2024-01-01" })`.

When a user asks you to add a feature or fix a translation, proactively check and run the sync workflow to keep all 13 languages complete.
