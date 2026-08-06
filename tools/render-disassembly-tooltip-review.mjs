/* global process */
import fs from "node:fs/promises"
import { fileURLToPath } from "node:url"
import vm from "node:vm"
import ts from "typescript"

const SOURCE_URL = new URL("../src/ui/panels/disassembly/disassembly_tooltips.ts", import.meta.url)
const ENGLISH_CATALOG_URL = new URL("../src/i18n/languages/en.ts", import.meta.url)
const REVIEW_OUTPUT_URL = new URL("../docs/reviews/", import.meta.url)
const MACHINE_ORDER = ["APPLE2P", "APPLE2EU", "APPLE2EE"]
const INSTRUCTION_SENSITIVE_SCENARIOS = [
  {instruction: "INC $C030", address: 0xC030, opcode: "INC", operand: "$C030"},
  {
    instruction: "STA $C070,X (X = $03)",
    address: 0xC073,
    opcode: "STA",
    operand: "$C070,X",
    value: 0x03,
  },
  {
    instruction: "INC $C073",
    address: 0xC073,
    opcode: "INC",
    operand: "$C073",
    valueLabel: "UNKNOWN",
  },
  {
    instruction: "STA $C070,X (X = $04)",
    address: 0xC074,
    opcode: "STA",
    operand: "$C070,X",
    value: 0x01,
  },
  {
    instruction: "INC $C074",
    address: 0xC074,
    opcode: "INC",
    operand: "$C074",
    valueLabel: "UNKNOWN",
  },
]

const machineType = (machines) => {
  const normalized = [...machines].sort((left, right) =>
    MACHINE_ORDER.indexOf(left) - MACHINE_ORDER.indexOf(right))
  if (normalized.join(",") === "APPLE2P,APPLE2EU,APPLE2EE") return "II*"
  if (normalized.join(",") === "APPLE2EU,APPLE2EE") return "IIe"
  if (normalized.join(",") === "APPLE2P") return "II+"
  if (normalized.join(",") === "APPLE2EE") return "IIee"
  if (normalized.join(",") === "APPLE2EU") return "IIeu"
  return normalized.join(", ")
}

const hex = (value) => `$${value.toString(16).toUpperCase().padStart(2, "0")}`

const loadTypeScriptModule = async (url) => {
  const source = await fs.readFile(url, "utf8")
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: fileURLToPath(url),
  })
  const module = {exports: {}}
  vm.runInNewContext(compiled.outputText, {
    exports: module.exports,
    module,
  }, {filename: fileURLToPath(url)})
  return module.exports
}

export const createCatalogTranslator = (catalog) =>
  (key, params) => {
    let result = key.split(".").reduce((value, part) => value?.[part], catalog)
    if (typeof result !== "string") {
      throw new Error(`Missing review translation: ${key}`)
    }
    result = result.replace(/{{([^{}]+)}}/g, (token, param) =>
      Object.prototype.hasOwnProperty.call(params ?? {}, param) ? params[param] : token)
    if (/{{[^}]+}}/.test(result)) {
      throw new Error(`Unresolved review translation parameter: ${key}`)
    }
    return result
  }

const loadEnglishCatalog = async () =>
  (await loadTypeScriptModule(ENGLISH_CATALOG_URL)).en

const loadEnglishTranslator = async () =>
  createCatalogTranslator(await loadEnglishCatalog())

const markdownCell = (value) => String(value)
  .replaceAll("|", "\\|")
  .replaceAll("\n", "<br>")

const templateFields = (message) =>
  [...message.matchAll(/{{([^{}]+)}}/g)].map((match) => match[1]).join(", ") || "—"

export const renderDisassemblyTranslationKeyReview = async () => {
  const catalog = (await loadEnglishCatalog()).disassembly
  const direct = []
  const groups = []

  for (const [key, value] of Object.entries(catalog)) {
    if (typeof value === "string") {
      direct.push([key, value])
    } else {
      groups.push([key, Object.entries(value)])
    }
  }

  const groupedCount = groups.reduce((sum, [, entries]) => sum + entries.length, 0)
  const flattened = [
    ...direct.map(([key, message]) => ({key, message})),
    ...groups.flatMap(([group, entries]) =>
      entries.map(([key, message]) => ({key: `${group}.${key}`, message}))),
  ]
  const longest = flattened
    .filter(({key}) => key.length >= 24)
    .sort((left, right) =>
      right.key.length - left.key.length || left.key.localeCompare(right.key))

  const lines = [
    "# Disassembly translation-key structure review",
    "",
    `This catalog contains ${flattened.length} strings: ${direct.length} direct strings and ${groupedCount} strings in ${groups.length} named groups.`,
    "",
    "Keys are grouped by hardware or UI concern. Every entry is a complete rendered line; interpolation supplies runtime data rather than separately translated fragments.",
    "",
    "## Longest relative key paths",
    "",
    "| Length | Key | English |",
    "|---:|---|---|",
  ]

  for (const {key, message} of longest) {
    lines.push(`| ${key.length} | \`${markdownCell(key)}\` | ${markdownCell(message)} |`)
  }

  if (direct.length > 0) {
    lines.push(
      "",
      "## Direct strings",
      "",
      "| Key | English | Fields |",
      "|---|---|---|",
    )
    for (const [key, message] of direct) {
      lines.push(`| \`${markdownCell(key)}\` | ${markdownCell(message)} | ${markdownCell(templateFields(message))} |`)
    }
  }

  for (const [group, entries] of groups) {
    lines.push("", `## ${group}`, "", "| Key | English | Fields |", "|---|---|---|")
    for (const [key, message] of entries) {
      lines.push(`| \`${markdownCell(group)}.${markdownCell(key)}\` | ${markdownCell(message)} | ${markdownCell(templateFields(message))} |`)
    }
  }

  return `${lines.join("\n")}\n`
}

const examplesFor = (descriptor) => {
  switch (descriptor.kind) {
    case "sequence": {
      const examples = descriptor.parts.flatMap(examplesFor)
      const valuedExamples = examples.filter(({value}) => value !== undefined)
      return valuedExamples.length > 0
        ? [...new Map(valuedExamples.map((example) => [example.value, example])).values()]
        : [{}]
    }
    case "keyboard":
      return [{value: 0x5D}, {value: 0xDD}]
    case "msb-choice":
      return [{value: 0x00}, {value: 0x80}]
    case "aux-bank-selector":
      return [{value: 0x03}]
    case "accelerator-control":
      return [
        {value: 0x00},
        {value: 0x01},
        {value: 0x03},
        {value: 0x40},
        {value: 0xA0},
        {value: 0xC0},
      ]
    case "grouped-message":
      return [{}]
    default:
      throw new Error(`Unsupported tooltip descriptor: ${descriptor.kind}`)
  }
}

const markdownTooltip = (tooltip) => {
  const withRuntimeValues = tooltip
    .replace(/^Keyboard: "(.*)"$/m, "Keyboard: \"`$1`\"")
    .replace(/: ([^\n(]+) \(MSB = ([01])\)/g, ": `$1` (MSB = `$2`)")
    .replace(/\(MSB = ([01])\)/g, "(MSB = `$1`)")
  return withRuntimeValues.replace(/\n/g, "<br>")
}

export const renderDisassemblyTooltipReview = async ({
  machines = MACHINE_ORDER,
  title = "Disassembly tooltip review",
  includeType = true,
} = {}) => {
  const { DISASSEMBLY_TOOLTIP_ROWS: rows, getDisassemblyTooltip } =
    await loadTypeScriptModule(SOURCE_URL)
  const translate = await loadEnglishTranslator()
  const scenarios = new Map()

  for (const row of rows) {
    const descriptors = row.access && (row.read || row.write)
      ? [
        ["Read", row.read ?? row.access],
        ["Write", row.write ?? row.access],
      ]
      : row.access
        ? [["Read/write", row.access]]
        : [
          ["Read", row.read],
          ["Write", row.write],
        ]
    for (const [access, descriptor] of descriptors) {
      const opcode = access === "Write" ? "STA" : "LDA"
      for (const example of descriptor ? examplesFor(descriptor) : [{}]) {
        for (const machine of row.machines.filter((name) => machines.includes(name))) {
          const tooltip = getDisassemblyTooltip(
            machine,
            row.address,
            opcode,
            example.value ?? 0,
            translate,
          )
          if (tooltip === undefined) continue
          const renderedTooltip = tooltip || "No semantic tooltip"
          const scenario = {
            access,
            address: row.address,
            markdown: tooltip ? markdownTooltip(tooltip) : "_No semantic tooltip_",
            tooltip: renderedTooltip,
            value: example.value === undefined ? "" : hex(example.value),
          }
          const key = JSON.stringify(scenario)
          if (!scenarios.has(key)) {
            scenarios.set(key, {...scenario, machines: new Set(), order: scenarios.size})
          }
          scenarios.get(key).machines.add(machine)
        }
      }
    }
  }

  const lines = [
    `# ${title}`,
    "",
    "Each row records the semantic-tooltip outcome. Adjacent addresses with the same behavior share one range. _No semantic tooltip_ means that the address is known but the operation intentionally displays no semantic or generic value tooltip. Blue code spans mark only runtime-dependent text; they are not part of the actual tooltip.",
    "The Value column uses representative runtime values only to make conditional tooltip text concrete; it does not imply a particular source register, preceding instruction, or machine state.",
    "",
    includeType
      ? "| Range | Type | Access | Value | Tooltip |"
      : "| Range | Access | Value | Tooltip |",
    includeType
      ? "|---|---|---|---|---|"
      : "|---|---|---|---|",
  ]
  const accessOrder = {Read: 0, Write: 1, "Read/write": 2}
  const orderedScenarios = [...scenarios.values()].sort((left, right) =>
    left.address - right.address || accessOrder[left.access] - accessOrder[right.access] ||
    left.order - right.order)
  const behaviorGroups = new Map()
  for (const scenario of orderedScenarios) {
    const machine = machineType(scenario.machines)
    const key = JSON.stringify({
      ...(includeType ? {machine} : {}),
      access: scenario.access,
      value: scenario.value,
      tooltip: scenario.tooltip,
    })
    if (!behaviorGroups.has(key)) {
      behaviorGroups.set(key, {...scenario, addresses: [], ...(includeType ? {machine} : {})})
    }
    behaviorGroups.get(key).addresses.push(scenario.address)
  }

  const compactScenarios = []
  for (const behavior of behaviorGroups.values()) {
    const addresses = [...new Set(behavior.addresses)].sort((left, right) => left - right)
    let start = addresses[0]
    let previous = start
    for (const address of addresses.slice(1)) {
      if (address === previous + 1) {
        previous = address
        continue
      }
      compactScenarios.push({...behavior, address: start, end: previous})
      start = address
      previous = address
    }
    compactScenarios.push({...behavior, address: start, end: previous})
  }
  compactScenarios.sort((left, right) =>
    left.address - right.address || accessOrder[left.access] - accessOrder[right.access] ||
    left.order - right.order)
  for (const scenario of compactScenarios) {
    const start = `$${scenario.address.toString(16).toUpperCase().padStart(4, "0")}`
    const address = scenario.address === scenario.end
      ? start
      : `${start}–$${scenario.end.toString(16).toUpperCase().padStart(4, "0")}`
    lines.push(includeType
      ? `| ${address} | ${scenario.machine} | ${scenario.access} | ${scenario.value} | ${scenario.markdown} |`
      : `| ${address} | ${scenario.access} | ${scenario.value} | ${scenario.markdown} |`)
  }

  lines.push(
    "",
    "## Instruction-sensitive cases",
    "",
    "These representative instructions exercise tooltips whose meaning or warning depends on how the instruction accesses the soft switch. Indexed and indirect examples assume that the displayed instruction is at the current PC; paused state does not reliably resolve those operands on other rows (issue #303).",
    "",
    includeType
      ? "| Instruction | Type | Write value | Tooltip |"
      : "| Instruction | Write value | Tooltip |",
    includeType
      ? "|---|---|---|---|"
      : "|---|---|---|",
  )
  const instructionScenarios = new Map()
  for (const scenario of INSTRUCTION_SENSITIVE_SCENARIOS) {
    for (const machine of machines) {
      const tooltip = getDisassemblyTooltip(
        machine,
        scenario.address,
        scenario.opcode,
        scenario.value ?? 0,
        translate,
        scenario.operand,
      )
      if (!tooltip) continue
      const key = JSON.stringify({
        instruction: scenario.instruction,
        tooltip,
        value: scenario.value,
        valueLabel: scenario.valueLabel,
      })
      if (!instructionScenarios.has(key)) {
        instructionScenarios.set(key, {...scenario, tooltip, machines: new Set()})
      }
      instructionScenarios.get(key).machines.add(machine)
    }
  }
  for (const scenario of instructionScenarios.values()) {
    const instruction = `\`${scenario.instruction}\``
    const value = scenario.valueLabel ?? (scenario.value === undefined ? "—" : hex(scenario.value))
    const tooltip = markdownTooltip(scenario.tooltip)
    lines.push(includeType
      ? `| ${instruction} | ${machineType(scenario.machines)} | ${value} | ${tooltip} |`
      : `| ${instruction} | ${value} | ${tooltip} |`)
  }
  return `${lines.join("\n")}\n`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--write")) {
    await fs.mkdir(REVIEW_OUTPUT_URL, {recursive: true})
    const [apple2pReview, apple2eReview, keyReview] = await Promise.all([
      renderDisassemblyTooltipReview({
        machines: ["APPLE2P"],
        title: "Apple II+ disassembly tooltip review",
        includeType: false,
      }),
      renderDisassemblyTooltipReview({
        machines: ["APPLE2EU", "APPLE2EE"],
        title: "Apple IIe disassembly tooltip review",
        includeType: false,
      }),
      renderDisassemblyTranslationKeyReview(),
    ])
    await Promise.all([
      fs.writeFile(
        new URL("disassembly-tooltips-apple2p.md", REVIEW_OUTPUT_URL),
        apple2pReview,
      ),
      fs.writeFile(
        new URL("disassembly-tooltips-apple2e.md", REVIEW_OUTPUT_URL),
        apple2eReview,
      ),
      fs.writeFile(
        new URL("disassembly-translation-keys.md", REVIEW_OUTPUT_URL),
        keyReview,
      ),
    ])
  } else if (process.argv.includes("--keys")) {
    process.stdout.write(await renderDisassemblyTranslationKeyReview())
  } else {
    process.stdout.write(await renderDisassemblyTooltipReview())
  }
}
