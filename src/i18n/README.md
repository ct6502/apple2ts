# Apple2TS i18n Developer Guide

Apple2TS stores translator-facing messages in gettext PO catalogs while
retaining the existing runtime translation API. For primary English tooltip
wording, follow the [Tooltip Style Guide](TOOLTIP_STYLE.md).

The original Traditional Chinese
[implementation report](archive/initial-implementation-report_zh-TW.md) is
preserved as project history.

## Sources and generated files

- `catalogs/messages.pot` is the authoritative English message template.
  Stable translation keys are stored in `msgctxt`; English text is stored in
  `msgid`.
- `catalogs/<locale>.po` stores each locale's translations in `msgstr`.
- `languages/*.ts` is generated application input. Do not edit it directly.

An empty `msgstr` is omitted from the generated locale catalog, so the runtime
falls back to English. A fuzzy flag marks a translation for human review but
does not disable it: Apple2TS intentionally includes nonempty fuzzy
translations in generated TypeScript, similar to gettext's `--use-fuzzy`
option.

The initial migration marks retained non-English translations fuzzy because
their alignment with current English has not been confirmed. Translators can
clear that marker entry by entry after review.

## Commands

```bash
# Merge POT changes into every PO catalog. This modifies translator files.
npm run update-i18n-catalogs

# Regenerate TypeScript catalogs after editing POT or PO files.
npm run generate-i18n-catalogs

# Verify generated catalogs without modifying them.
npm run check-i18n-catalogs

# Test PO parsing, validation, reporting, updating, and generation.
npm run test-po-catalog
```

Normal builds and tests run the non-mutating freshness checks automatically.
Those checks use only the repository's Node dependencies. The intentionally
mutating update command also requires GNU gettext `msgmerge`.

## Adding or changing English messages

1. Add or update the entry in `catalogs/messages.pot`. Keep an existing
   `msgctxt` stable when only its English wording changes.
2. Run `npm run update-i18n-catalogs`.

   The updater matches stable `msgctxt` values before invoking `msgmerge`, so a
   rewritten English message retains its existing translation, becomes fuzzy,
   and keeps the previous English wording for comparison. New entries are
   added, and removed entries become obsolete. Each locale is staged before
   replacement; a failure preserves the affected original and reports any
   earlier catalogs already updated.
3. Review the affected `msgstr` values. Clear fuzzy only after confirming a
   translation against current English. Leave missing translations empty so
   runtime fallback remains visible; do not copy English merely to complete
   catalog structure.
4. Run `npm run generate-i18n-catalogs`, then the relevant project checks.

PO files can be edited directly or with standard tools such as Poedit and
Weblate.

## Interpolation

Runtime messages use `{{name}}` placeholders. Some component templates use
`{name}` placeholders. A translation may reorder placeholders, but must retain
their syntax, spelling, and occurrence count. Generation validates every
nonempty translation, including fuzzy ones, and rejects missing, unexpected,
renamed, malformed, or differently repeated placeholders.

Catalog messages must not begin or end with newlines; rendering code owns the
spacing around them. Inherently multiline content may contain internal line
breaks, and translators may place those breaks where their wording requires.

```po
msgctxt "disk.syncedAt"
msgid "Synced {{date}}"
msgstr "Synchronisé {{date}}"
```

The existing runtime API is unchanged:

```tsx
t("disk.syncedAt", {date: "2026-08-06"})
```

## Directory structure

- `index.ts` — language selection, persistence, fallback, and lookup.
- `useTranslation.ts` — reactive React translation hook.
- `catalogs/` — authoritative POT and PO translator files.
- `languages/` — generated TypeScript catalogs consumed by the application.
- `tools/i18n/` — deterministic generation, reporting, and validation tools.
- `archive/` — historical bootstrap material; not part of this workflow.
