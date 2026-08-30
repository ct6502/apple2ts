import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const USAGE = "Usage: npm run update-4cade-db -- --source /path/to/4cade"
const args = process.argv.slice(2)
if (args.length !== 2 || args[0] !== "--source" || !args[1]) {
  throw new Error(`Missing required 4cade source directory.\n${USAGE}`)
}

const source = resolve(args[1])
const requiredPaths = [
  { name: "res/GAMES.CONF", path: join(source, "res/GAMES.CONF"), directory: false },
  { name: "res/dsk", path: join(source, "res/dsk"), directory: true },
  { name: "src/prelaunch", path: join(source, "src/prelaunch"), directory: true },
]
const missingPaths = requiredPaths.filter(({ path, directory }) =>
  !existsSync(path) || (directory ? !statSync(path).isDirectory() : !statSync(path).isFile())
)
if (missingPaths.length > 0) {
  throw new Error(`4cade source is missing: ${missingPaths.map(({ name }) => name).join(", ")}`)
}

const FOUR_CADE_DSK = requiredPaths[1].path
const PRELAUNCH_DIR = requiredPaths[2].path
const GAMES_CONF = requiredPaths[0].path
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUTPUT = join(repositoryRoot, "src/common/four_cade_catalog.json")

// Parse GAMES.CONF: ABCDEFG,PRODOS_NAME=Display Name/Year
const gamesConf = readFileSync(GAMES_CONF, "utf-8")
const gamesByProDos = new Map<string, string>()
for (const line of gamesConf.split(/\r?\n/)) {
  const m = line.match(/^[0-9]{7},([A-Z0-9.]+)=(.+)\/\d{4}$/)
  if (m) gamesByProDos.set(m[1], m[2])
}

// Parse prelaunch !to directives: map prelaunch filename → ProDOS name
const prelaunchByProDos = new Map<string, string>()
for (const f of readdirSync(PRELAUNCH_DIR).filter(f => f.endsWith(".a"))) {
  const src = readFileSync(join(PRELAUNCH_DIR, f), "utf-8")
  const m = src.match(/!to\s+"build\/PRELAUNCH\.INDEXED\/([^"]+)"/)
  if (m) {
    const proDosName = m[1]
    const prelaunchName = f.replace(/\.a$/, "")
    prelaunchByProDos.set(proDosName, prelaunchName)
  }
}

// List .po files and build entries keyed by display name
const poFiles = readdirSync(FOUR_CADE_DSK).filter(f => f.endsWith(".po"))
const entries: Array<{ name: string; disk: string; prelaunch: string }> = []
const missed: string[] = []

for (const po of poFiles) {
  const disk = po.replace(/\.po$/, "")
  const poData = readFileSync(join(FOUR_CADE_DSK, po))

  // Extract ProDOS volume to find the game binary name
  const blockSize = 512
  const block2off = 2 * blockSize
  if (poData.length < block2off + blockSize) continue
  const volByte = poData[block2off + 4]
  if (((volByte >> 4) & 0xF) !== 0xF) continue
  const entryLength = poData[block2off + 4 + 0x1F] || 0x27
  const entriesPerBlock = poData[block2off + 4 + 0x20] || 0x0D

  // Scan directory entries for the game file (skip volume header at offset 4)
  let gameProDosName: string | undefined
  const dirBase = block2off + 4  // skip prev/next block pointers
  for (let ei = 1; ei < entriesPerBlock; ei++) {
    const eoff = dirBase + ei * entryLength
    if (eoff + entryLength > poData.length) break
    const storageType = (poData[eoff] >> 4) & 0xF
    if (storageType === 0) continue
    const nameLen = poData[eoff] & 0x0F
    if (nameLen === 0) continue
    let name = ""
    for (let j = 0; j < nameLen; j++) name += String.fromCharCode(poData[eoff + 1 + j])
    if (name === "PRODOS" || name === "LOADER.SYSTEM" || name.endsWith(".SYSTEM")) continue

    if (storageType === 0xD) {
      // Subdirectory: read its key block and find the first non-system file
      const subKeyBlock = poData[eoff + 0x11] | (poData[eoff + 0x12] << 8)
      const subOff = subKeyBlock * blockSize
      if (subOff + blockSize <= poData.length) {
        const subDirBase = subOff + 4  // skip prev/next pointers
        for (let si = 1; si < entriesPerBlock; si++) {
          const soff = subDirBase + si * entryLength
          if (soff + entryLength > poData.length) break
          const sst = (poData[soff] >> 4) & 0xF
          if (sst === 0 || sst === 0xD || sst === 0xE || sst === 0xF) continue
          const snl = poData[soff] & 0x0F
          if (snl === 0) continue
          let sname = ""
          for (let j = 0; j < snl; j++) sname += String.fromCharCode(poData[soff + 1 + j])
          if (sname.endsWith(".SYSTEM")) continue
          gameProDosName = sname
          break
        }
      }
      if (gameProDosName) break
      continue
    }

    gameProDosName = name
    break
  }
  if (!gameProDosName) continue

  // Find prelaunch and display name
  const prelaunch = prelaunchByProDos.get(gameProDosName) || "standard"
  const displayName = gamesByProDos.get(gameProDosName)
  if (!displayName) {
    // Fallback: derive ProDOS name from disk filename and search GAMES.CONF
    // e.g. "bad dudes PRODOS (san inc pack)" → search for "BAD.DUDES"
    const diskBase = disk.replace(/\s*PRODOS.*$/i, "").replace(/\s*\d+k file.*$/i, "").replace(/\s*\(.*$/i, "").trim()
    const candidates = [
      diskBase.toUpperCase().replace(/\s+/g, "."),
      diskBase.toUpperCase().replace(/\s+/g, ""),
      diskBase.toUpperCase(),
    ]
    let found = false
    for (const c of candidates) {
      const dn = gamesByProDos.get(c)
      if (dn) {
        const pl = prelaunchByProDos.get(c) || "standard"
        entries.push({ name: dn, disk, prelaunch: pl })
        found = true
        break
      }
    }
    if (!found) missed.push(`${gameProDosName} (${disk})`)
    continue
  }

  entries.push({ name: displayName, disk, prelaunch })
}

// Sort by name for readability
entries.sort((a, b) => a.name.localeCompare(b.name))

// Check for duplicate names
const nameCounts = new Map<string, number>()
for (const e of entries) nameCounts.set(e.name, (nameCounts.get(e.name) || 0) + 1)
for (const [name, count] of nameCounts) {
  if (count > 1) {
    console.warn(`WARNING: duplicate name "${name}" — keeping first, skipping ${count - 1}`)
    // Remove all but the first occurrence
    let seen = 0
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].name === name) {
        seen++
        if (seen > 1) entries.splice(i, 1)
      }
    }
  }
}

// Write output
const lines = entries.map(({ name, disk, prelaunch }) =>
  `  ${JSON.stringify(name)}: ${JSON.stringify({ disk, prelaunch })}`
)
const output = `{\n${lines.join(",\n")}\n}\n`

writeFileSync(OUTPUT, output)
console.log(`Wrote ${entries.length} entries to ${OUTPUT}`)
if (missed.length > 0) {
  console.log(`\n${missed.length} unmatched:`)
  for (const m of missed.slice(0, 20)) console.log(`  ${m}`)
  if (missed.length > 20) console.log(`  ... and ${missed.length - 20} more`)
}
