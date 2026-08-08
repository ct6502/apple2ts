# Tooltip Style Guide

English catalog messages are the source text for every Apple2TS translation.
Keep tooltips concise, consistent, and complete enough for natural translation.
The first sections guide tooltip writers. **Implementation Notes** covers
catalog and rendering code.

## Terminology

- **Message:** one catalog entry translated and rendered as a unit. It may
  contain fixed text, interpolation variables, or both.
- **Interpolation variable:** raw data inserted through a named field such as
  `{{value}}`. Keep translated words and sentence fragments in the message.
  Data may include a resolved do-not-translate identifier such as a published
  product name.
- **Do-not-translate content:** published product names, hardware identifiers,
  addresses, and technical notation that must remain unchanged.
- **Localization note:** translator guidance about context, variables,
  do-not-translate content, or the supporting hardware documentation.

## Core Rules

### Writing Messages

- Each message renders one complete line for one UI concept or hardware effect.
- A noun phrase can be a complete tooltip.
- Write each complete line as one translation message, even when that repeats
  a term. Avoid assembling a line from separately translated words or
  fragments.
- Avoid splitting messages at a colon; a colon does not always make its parts
  grammatically independent.
- Use sentence case.
- Preserve conventional capitalization for product names, acronyms, register
  names, and values.
- Base user-facing text on official hardware terminology.
- Explain the effect without repeating the disassembly symbol already under
  the pointer.

### Runtime Data

- Use named interpolation variables only for clear runtime data.
- Keep fixed do-not-translate content in the source message.

### Localization Notes

- Add a note when a variable, identifier, or hardware context is unclear.
- Identify do-not-translate content in the note.
- Link hardware documentation when the note relies on device-specific facts.

## UI Tooltips

### Labels

- Use a concise noun phrase when a tooltip identifies a control or concern:

  ```text
  Emulator Speed
  Debug Panel
  Machine Configuration
  ```

- Keep the complete phrase in one message.
- Add an imperative verb only when the tooltip describes an action.

### Actions

- Use a concise imperative when the control's purpose is the action itself:

  ```text
  Boot
  Reset
  Copy Screen
  Step Over
  ```

- Keep the verb and its object in one message.
- Use a standalone verb only when the surrounding UI makes its object clear.

### Information

- Use a direct explanatory message when a tooltip describes capability or
  context:

  ```text
  These buttons save and restore the complete emulator state.
  ```

- Prefer a natural sentence, but use shorter wording when it conveys the whole
  meaning.

## Disassembly Tooltips

### Memory Details

- Translate each labeled memory detail while inserting technical notation as
  runtime data:

  ```text
  Effective address: $2003 = $2000 + $03
  Effective address: $1234 = ($23), $23 = $20 + $03
  Value: $42
  ```

- Keep hexadecimal values, operators, ordering, and grouping identical in
  every language.

### Raw Technical Notation

- Keep a tooltip untranslated when it contains only machine notation:

  ```text
  $1234
  93 = 01011101 = "]"
  ```

- Use this form for raw jump targets and immediate-value breakdowns. Add a
  translated message when explanatory text is needed.

### Observed Status

- Use an observed-status message when Apple2TS interprets an available runtime
  value:

  ```text
  Keyboard strobe: SET (MSB = 1)
  Any-key-down flag: CLEAR (MSB = 0)
  Text mode: ON (MSB = 1)
  Language Card read source: RAM (MSB = 1)
  Zero page, stack, and bank-switched RAM: AUXILIARY (MSB = 1)
  ```

- Translate the whole status message so each language controls word order and
  punctuation.

### Hardware Actions

- Use a complete imperative message when an access causes an action:

  ```text
  Clear keyboard strobe
  Toggle speaker output
  Enable DHIRES
  Disable annunciator 3
  Select display page 2, or auxiliary display memory with 80STORE
  Set display width to 80 columns
  ```

- Keep the verb, object, and translated qualifiers together.
- Interpolate only runtime data, such as a bank number or display width.
- Use imperative wording for actions and declarative wording for observed
  states.
- Keep paired enable/disable actions and enumerated selections as complete,
  independently translated messages.

### Device-Scoped Actions

- Include the device name in the complete message when hardware identity
  distinguishes an action:

  ```text
  Language Card: Select bank 2
  TransWarp: Select 1 MHz
  Laser 128EX: Select 2.3 MHz maximum CPU speed
  FASTChip IIe: Advance unlock sequence
  ```

- Translate generic device names such as `Language Card` within each message.
- Retain published product names such as `TransWarp` and `Laser 128EX`.
- Use `Language Card` as the concise UI label. Apple calls the IIe
  implementation the "Built-in Language Card."

### Warnings

- Use a warning when an instruction can produce a meaningful but unpredictable
  effect:

  ```text
  WARNING: This instruction triggers the soft switch multiple times
  WARNING: This instruction writes an unknown value
  ```

- Keep each consequence as a complete message.
- Include the translated severity in each complete warning message.
- Reserve warnings for established, actionable consequences.

### Contextual Diagnostics

- Use `INFO:` for helpful context without a hazardous or unpredictable effect:

  ```text
  INFO: This write has no effect on Apple II+
  ```

- Keep contextual diagnostics separate from generic status and action
  messages.

### Multiple Effects

- Display independent effects on separate lines:

  ```text
  Language Card: Select bank 2
  Language Card: Use RAM for reads
  Language Card: Reset prewrite latch
  ```

- Keep each line as one complete translation message, even when one access
  causes every listed effect.

## Implementation Notes

These rules apply to code that selects and renders tooltip messages.

### Catalog Keys

- Group messages by hardware or UI concern rather than disassembly symbol.
- Keep a stable hardware identifier in a leaf key when it aids discovery.
- Derive keys from stable concepts rather than current English wording.

### Message Selection

- Choose the semantic message key before applying a language.
- Translation changes presentation only; the selected key determines hardware
  meaning.
- When a runtime byte is unavailable, retain the generic address detail and
  omit semantic status. Treat `UNKNOWN` as missing evidence, not a third
  hardware state.

### Device Context

- Lead with the selected machine's motherboard effect when an access also has
  optional-device meaning.
- Show optional-device intent only when machine, access, known-value, or
  sequence evidence supports it.
- Treat ordinary motherboard reads as motherboard actions.
- Distinguish an optional card from similar behavior built into a later
  motherboard.
- Once card configuration exists, show II+ Language Card actions only if the
  card is present.

### Rendering

- Resolve independent effects separately and render each message on its own
  line. Keep a computed effective-address message on its own line before the
  semantic effects; omit it for a direct operand whose address is already
  visible in the disassembly.
- Treat an indexed or indirect effective address as authoritative only for the
  instruction at the current PC. The paused CPU's registers and pointer memory
  do not establish what an earlier row used or a later row will use. Keep this
  limitation explicit in review material while issue #303 owns the follow-up.
- Place any stable hardware effects before warnings.
- Pass a resolved hardware identifier as raw data only when it varies at
  runtime.
- Preserve computed address and value notation from left to right in every
  language. Pass it through `{{notation}}` and isolate it from surrounding
  translated text in the renderer. For example, keep `$2003 = $2000 + $03`
  in that order.
- Keep supplemental `INFO:` and `WARNING:` messages in the disassembly
  `notice` group. Preserve the visible severity in each complete message.

## References

- [GNU gettext: Entire Sentences](https://www.gnu.org/software/gettext/manual/html_node/Entire-sentences.html)
- [ICU: Formatting Messages](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [i18next: Interpolation](https://www.i18next.com/translation-function/interpolation)
- [W3C: Working with Composite Messages](https://www.w3.org/International/articles/composite-messages/)
