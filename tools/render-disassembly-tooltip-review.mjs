/* global process */
import fs from "node:fs/promises"
import { fileURLToPath } from "node:url"
import vm from "node:vm"
import ts from "typescript"

const SOURCE_URL = new URL("../src/ui/panels/disassembly/disassembly_tooltips.ts", import.meta.url)
const ENGLISH_CATALOG_URL = new URL("../src/i18n/languages/en.ts", import.meta.url)
const REVIEW_OUTPUT_URL = new URL("../docs/reviews/", import.meta.url)
const MACHINE_ORDER = ["APPLE2P", "APPLE2EU", "APPLE2EE"]

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

const loadEnglishTranslator = async () => {
  const { en } = await loadTypeScriptModule(ENGLISH_CATALOG_URL)
  return createCatalogTranslator(en)
}

const examplesFor = (descriptor) => {
  switch (descriptor.kind) {
    case "keyboard":
      return [{value: 0x5D}, {value: 0xDD}]
    case "bit7":
      return [{value: 0x00}, {value: 0x80}]
    case "aux-bank-selector":
      return [{value: 0x03}]
    case "text":
      return [{}]
    default:
      throw new Error(`Unsupported tooltip descriptor: ${descriptor.kind}`)
  }
}

const markdownTooltip = (tooltip, descriptor) => {
  switch (descriptor.kind) {
    case "keyboard":
      return tooltip.replace(
        /^Keyboard = "(.*)"; Strobe is (CLEAR|SET) \(bit 7 = ([01])\)$/,
        "Keyboard = \"`$1`\"; Strobe is `$2` (bit 7 = `$3`)",
      )
    case "bit7":
      return tooltip.replace(
        / = ([^;(]+) \(bit 7 = ([01])\)/,
        " = `$1` (bit 7 = `$2`)",
      )
    default:
      return tooltip
  }
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
    for (const [access, descriptor] of [
      ["Read/write", row.access],
      ["Read", row.read],
      ["Write", row.write],
    ]) {
      if (!descriptor) continue
      const opcode = access === "Write" ? "STA" : "LDA"
      for (const example of examplesFor(descriptor)) {
        for (const machine of row.machines.filter((name) => machines.includes(name))) {
          const tooltip = getDisassemblyTooltip(
            machine,
            row.address,
            opcode,
            example.value ?? 0,
            translate,
          )
          if (!tooltip) continue
          const scenario = {
            access,
            address: row.address,
            markdown: markdownTooltip(tooltip, descriptor),
            tooltip,
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
    "Each row is a concrete rendered tooltip. Adjacent addresses with the same behavior share one range. Blue code spans mark only runtime-dependent text; they are not part of the actual tooltip.",
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
  return `${lines.join("\n")}\n`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--write")) {
    await fs.mkdir(REVIEW_OUTPUT_URL, {recursive: true})
    const [apple2pReview, apple2eReview] = await Promise.all([
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
    ])
  } else {
    process.stdout.write(await renderDisassemblyTooltipReview())
  }
}
