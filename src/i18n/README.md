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
- `languages/*.ts` is ignored, generated application input. Do not edit or
  commit it.

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

# Regenerate TypeScript catalogs without running another project command.
npm run generate-i18n-catalogs

# Verify generated catalogs without modifying them.
npm run check-i18n-catalogs

# Test PO parsing, validation, reporting, updating, and generation.
npm run test-po-catalog
```

Application, lint, test, and tooltip-review commands regenerate TypeScript
catalogs automatically. The generated files are ignored so translator pull
requests contain only POT or PO source changes. Generation and checks use only
the repository's Node dependencies. The intentionally mutating update command
also requires GNU gettext `msgmerge`.

## Adding a language

Add `catalogs/<locale>.po` with the same canonical BCP 47 locale in its
`Language` header. Catalog generation discovers the file, compiles it, and
adds it to the generated runtime language registry. A newly discovered locale
uses its locale ID as its initial menu name, a neutral globe as its icon, and
English as its fallback. Exact browser locale matches work automatically;
language-only catalogs also match regional browser locales.

Use `tools/i18n/language-policies.mjs` only for information the locale ID
cannot supply safely: a polished menu name or icon, menu ordering, legacy
saved-language aliases, browser-locale exceptions, or an intermediate fallback
locale. The same file maps known translation-platform identifiers to canonical
runtime IDs; for example, Weblate's `en@pirate` becomes `en-x-pirate`. The
generator rejects invalid or noncanonical unmapped locale IDs, mismatched PO
headers, duplicate identities, and policy entries that reference a missing
catalog.

Automatic registration makes a catalog mechanically available. New scripts,
right-to-left languages, and unusually long translations may still need font
and layout review.

## Translating with Weblate

The [Browser Emulator component on
Weblate](https://hosted.weblate.org/projects/apple2ts/browser-emulator/) uses
the GitHub App integration. The normal contribution flow is:

1. Save translations in Weblate. Weblate keeps them pending until its commit
   schedule runs or a maintainer selects **Commit**.
2. Weblate creates or updates a GitHub pull request. Review the PO diff and let
   the Apple2TS catalog checks finish.
3. Merge a Weblate pull request with **Create a merge commit**. Do not squash
   or rebase it; Weblate uses its original commit identities when it
   synchronizes later changes.
4. GitHub notifies Weblate of the merge, and Weblate updates its repository
   automatically. A manual **Update** is not part of the normal flow.

Direct PO pull requests remain supported. After one merges, the same GitHub
notification imports it into Weblate. If Weblate reports an update conflict or
produces an unexpectedly broad diff, stop and reconcile the GitHub and Weblate
changes before using a reset operation.

Weblate quality checks are review aids. Dismiss a check only when the specific
translation intentionally differs, such as deliberate capitalization or end
punctuation. Keep structural checks for placeholders, markup, newlines,
leading or trailing whitespace, and technical notation active. Do not disable
a check for every language to accommodate one intentional translation.

## Adding or changing English messages

1. Add or update the entry in `catalogs/messages.pot`. Keep an existing
   `msgctxt` stable when only its English wording changes.
2. Run `npm run update-i18n-catalogs`.

   The updater matches stable `msgctxt` values before invoking `msgmerge`, so a
   rewritten English message retains its existing translation, becomes fuzzy,
   and keeps the previous English wording for comparison. New entries are
   added, and removed entries are deleted rather than retained as obsolete
   `#~` messages; Git history preserves their earlier translations. It disables
   cross-key fuzzy matching because the stable `msgctxt`, not similar English
   wording, identifies a message. Each locale is staged before replacement; a
   failure preserves the affected original and reports any earlier catalogs
   already updated.
3. Review the affected `msgstr` values. Clear fuzzy only after confirming a
   translation against current English. Leave missing translations empty so
   runtime fallback remains visible; do not copy English merely to complete
   catalog structure.
4. Run the relevant project checks. They regenerate the TypeScript catalogs
   automatically.

Translators can use
[Weblate](https://hosted.weblate.org/projects/apple2ts/browser-emulator/) or
edit PO files with standard tools such as Poedit. Contributors changing
English messages or catalog structure should follow the workflow above. The
non-writing catalog check rejects obsolete messages so direct and external
edits cannot bypass the cleanup policy.

## Interpolation

Runtime messages use `{{name}}` placeholders. Some component templates use
`{name}` placeholders. A translation may reorder placeholders, but must retain
their syntax, spelling, and occurrence count. Generation validates every
nonempty translation, including fuzzy ones, and rejects missing, unexpected,
renamed, malformed, or differently repeated placeholders.

Catalog messages must not begin or end with whitespace; rendering code owns the
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
- `languages/` — ignored, generated TypeScript catalogs and language registry
  consumed by the application.
- `tools/i18n/` — deterministic generation, reporting, and validation tools.
- `archive/` — historical bootstrap material; not part of this workflow.
