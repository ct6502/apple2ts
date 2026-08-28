import { FourCadeEntry } from "./four_cade_prelaunch_db"

export type PrelaunchOp =
  | { op: "patch"; addr: number; val: number }   // LDA #val; STA addr
  | { op: "inc_reset_checksum" }                 // INC $3F4 — force reset to reboot
  | { op: "call"; addr: number }                  // JSR addr
  | { op: "decompress"; addr: number }            // JSR to decompressor entry
  | { op: "readRom" }                             // STA $C082 — LC read ROM, no write
  | { op: "rwRam2" }                              // BIT $C083; BIT $C083 — LC read/write RAM bank 2
  | { op: "rdRam2" }                              // STA $C080 — LC read RAM bank 2, no write
  | { op: "callback_vector"; loAddr: number; hiAddr: number }  // store callback address at loAddr/hiAddr
  | { op: "jmp_decompress"; addr: number }        // JMP to decompressor (callback-based, no return)
  | { op: "reset_vector" }                        // install trailing stack-page reset handler in $3F2 and LC $FFFC
  | { op: "reset_vector_100" }                    // point the page-3 reset vector at the launcher's $0100 reboot wrapper
  | { op: "reset_handler"; mode: "rdRam2" }       // install named stack-page reset handler in $3F2
  | { op: "inline_rts_vector"; loAddr: number; hiAddr: number }
  | { op: "stack_entry"; returnAddress: number }
  | { op: "stack_callback_jmp"; addr: number }
  | { op: "install_routine"; loAddr: number; hiAddr: number; bytes: number[] }

/** Runtime prelaunch data parsed from a fetched .a file. */
export type PrelaunchEntry = number | "loadAddress" | { indirect: number }

export type ParsedPrelaunch = {
  sequence: PrelaunchOp[]
  entry: PrelaunchEntry
}

const FOUR_CADE_BASE_URL = "https://raw.githubusercontent.com/a2-4am/4cade/v6.0.1"

/** Fetch the compressed .po disk from the 4cade repo.  Returns raw bytes. */
export const fetchFourCadeDisk = async (entry: FourCadeEntry): Promise<Uint8Array> => {
  const url = `${FOUR_CADE_BASE_URL}/res/dsk/${encodeURIComponent(entry.disk + ".po")}`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Failed to fetch 4cade disk "${entry.disk}": ${resp.status}`)
  return new Uint8Array(await resp.arrayBuffer())
}

/** Fetch the prelaunch assembly source from the 4cade repo. */
export const fetchFourCadePrelaunch = async (entry: FourCadeEntry): Promise<string> => {
  const url = `${FOUR_CADE_BASE_URL}/src/prelaunch/${encodeURIComponent(entry.prelaunch + ".a")}`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Failed to fetch 4cade prelaunch "${entry.prelaunch}": ${resp.status}`)
  return resp.text()
}

/**
 * Parse a 4cade prelaunch .a file into a sequence of operations.
 */
export const parsePrelaunchScript = (source: string): ParsedPrelaunch | undefined => {
  const ops: PrelaunchOp[] = []
  let entry: PrelaunchEntry | undefined
  let hasDecompress = false
  let pendingLdaVal: number | undefined
  let parsingResetVector = false
  let sawMachineStatus = false
  let sawCheatsMask = false
  let skippingCheatBlock = false
  let skippedForwardHelperRegion = false
  let skipInstalledRoutineSetupLines = 0
  let skipStackCallbackSetupLines = 0

  if (source.includes("!pseudopc")) return undefined

  const sourceLines = source.split(/\r?\n/)
  const firstStatementIndex = sourceLines.findIndex((rawLine) => {
    const line = rawLine.replace(/;.*$/, "").trim()
    return line.length > 0 && !line.startsWith("!") && !line.startsWith("*=")
  })
  const forwardMainMatch = firstStatementIndex >= 0
    ? sourceLines[firstStatementIndex].replace(/;.*$/, "").trim()
      .match(/^jmp\s+([a-z_][a-z0-9_.]*)$/i)
    : undefined
  let lines = sourceLines
  if (forwardMainMatch) {
    const mainLabel = forwardMainMatch[1].toLowerCase()
    const mainLabelIndex = sourceLines.findIndex((rawLine, index) => {
      if (index <= firstStatementIndex) return false
      const line = rawLine.replace(/;.*$/, "").trim().replace(/:$/, "").toLowerCase()
      return line === mainLabel
    })
    if (mainLabelIndex < 0) return undefined
    lines = sourceLines.slice(mainLabelIndex + 1)
    skippedForwardHelperRegion = true
  }

  const sourceWithoutComments = source
    .split(/\r?\n/)
    .map((line) => line.replace(/;.*$/, ""))
    .join("\n")
  const hasCanonicalResetVector =
    /lda\s+#<reset\b[\s\S]*?sta\s+\$3F2\b[\s\S]*?sta\s+\$FFFC\b[\s\S]*?lda\s+#>reset\b[\s\S]*?sta\s+\$3F3\b[\s\S]*?sta\s+\$FFFD\b[\s\S]*?eor\s+#\$A5\b[\s\S]*?sta\s+\$3F4\b/i.test(sourceWithoutComments) &&
    /^\s*reset\b:?\s*\n\s*\+READ_ROM_NO_WRITE\b\s*\n\s*inc\s+\$3F4\b\s*\n\s*jmp\s+\(\s*\$FFFC\s*\)/im.test(sourceWithoutComments)
  const hasReadRam2ResetHandler =
    /^\s*reset\b:?\s*\n\s*\+READ_RAM2_NO_WRITE\b\s*\n\s*jmp\s+\(\s*\$FFFC\s*\)/im.test(sourceWithoutComments)
  const dualCallbackSetup = sourceWithoutComments.match(
    /lda\s+#<callback1\b\s*\n\s*sta\s+\$([0-9a-f]{2,4})\b\s*\n\s*lda\s+#>callback1\b\s*\n\s*sta\s+\$([0-9a-f]{2,4})\b\s*\n\s*lda\s+#<callback2\b\s*\n\s*sta\s+\$([0-9a-f]{2,4})\b\s*\n\s*lda\s+#>callback2\b\s*\n\s*sta\s+\$([0-9a-f]{2,4})\b/i,
  )
  const hasDualArithmeticCallbackBodies =
    /^\s*callback1\b:?\s*\n\s*sec\b\s*\n\s*sbc\s+#8\b\s*\n\s*cmp\s+#2\b\s*\n\s*bcc\s+\+\s*\n\s*-\s*jmp\s+\$AE0A\b\s*\n\s*\+\s*jmp\s+\$ADF9\b/im.test(sourceWithoutComments) &&
    /^\s*callback2\b:?\s*\n\s*sec\b\s*\n\s*sbc\s+#8\b\s*\n\s*cmp\s+#2\b\s*\n\s*bcs\s+-\s*\n\s*jmp\s+\$AE21\b/im.test(sourceWithoutComments)
  const singleRtsRoutineSetup = sourceWithoutComments.match(
    /lda\s+#<([a-z_][a-z0-9_.]*)\b\s*\n\s*sta\s+\$([0-9a-f]{2,4})\b\s*\n\s*lda\s+#>\1\b\s*\n\s*sta\s+\$([0-9a-f]{2,4})\b/i,
  )
  const singleRtsRoutineSymbol = singleRtsRoutineSetup?.[1].toLowerCase()
  const hasSingleRtsRoutine = singleRtsRoutineSymbol !== undefined && new RegExp(
    `^[ \\t]*${singleRtsRoutineSymbol}\\b:?[ \\t]+rts\\b`, "im",
  ).test(sourceWithoutComments)
  const stackEntryMatch = sourceWithoutComments.match(
    /lda\s+#\$([0-9a-f]{1,2})\b\s*\n\s*pha\b\s*\n\s*lda\s+#\$([0-9a-f]{1,2})\b\s*\n\s*pha\b\s*\n\s*rts\b/i,
  )
  const stackCallbackSetup = sourceWithoutComments.match(
    /lda\s+#>\(\s*callback\s*-\s*1\s*\)\s*\n\s*pha\b\s*\n\s*lda\s+#<\(\s*callback\s*-\s*1\s*\)\s*\n\s*pha\b\s*\n\s*sec\b\s*\n\s*php\b\s*\n\s*jmp\s+\$([0-9a-f]{2,4})\b/i,
  )

  // Callback detection state — handles decompressors that JMP to a routine
  // which calls back into the prelaunch code after decompression (e.g. Frogger).
  let callbackLoAddr: number | undefined
  let callbackHiAddr: number | undefined
  let callbackLoSymbol: string | undefined
  let callbackHiSymbol: string | undefined
  let pendingCallbackLo = false
  let pendingCallbackHi = false
  let inCallbackBody = false

  for (const rawLine of lines) {
    let line = rawLine.replace(/;.*$/, "").trim()
    if (!line) continue
    if (line.startsWith("!") || line.startsWith("*=")) continue

    if (skippingCheatBlock) {
      const endCheatBlock = line.match(/^\+\s*(.*)$/)
      if (!endCheatBlock) continue
      skippingCheatBlock = false
      line = endCheatBlock[1].trim()
      if (!line) continue
    } else {
      const localLabel = line.match(/^[+-]\s+(.+)$/)
      if (localLabel) line = localLabel[1].trim()
    }
    if (skipInstalledRoutineSetupLines > 0) {
      skipInstalledRoutineSetupLines--
      continue
    }
    if (skipStackCallbackSetupLines > 0) {
      skipStackCallbackSetupLines--
      continue
    }
    if (line.match(/^\+GET_MACHINE_STATUS(?:_LC_RW)?\b/i)) {
      sawMachineStatus = true
      continue
    }
    if (line.match(/^lda\s+MachineStatus\b/i)) {
      sawMachineStatus = true
      pendingLdaVal = undefined
      continue
    }
    if (sawMachineStatus && line.match(/^and\s+#CHEATS_ENABLED\b/i)) {
      sawCheatsMask = true
      continue
    }
    if (sawCheatsMask && line.match(/^beq\s+\+\s*$/i)) {
      skippingCheatBlock = true
      sawMachineStatus = false
      sawCheatsMask = false
      continue
    }

    if (parsingResetVector) {
      if (line.match(/^sta\s+\$3F4\b/i)) parsingResetVector = false
      continue
    }

    // Detect callback label (e.g. "callback" or "callback:" on its own line)
    if (line.match(/^callback\b:?$/i)) { inCallbackBody = true; continue }

    // In callback body: skip JSR and instruction-level lines (they may include
    // ProDOS MLI calls with inline parameters we can't reproduce).  Only process
    // recognized macros which provide essential cleanup (DISABLE_ACCEL, etc.).
    if (inCallbackBody) {
      if (line.match(/^rts\b/i)) break  // end of callback
      const stackCallbackEntry = stackCallbackSetup
        ? line.match(/^jmp\s+\$([0-9a-fA-F]{2,4})\b/i)
        : undefined
      if (stackCallbackEntry) {
        entry = parseInt(stackCallbackEntry[1], 16)
        break
      }
      // Only process + macros in callback body (they're handled below)
      if (!line.startsWith("+")) { pendingLdaVal = undefined; continue }
    }

    // 4cade macro expansions — must match acme macros in src/macros.a exactly.
    // LC bank 2 function addresses: EnableAccelerator=$DFB7, DisableAccelerator=$DFB4,
    // HideLaunchArtworkLC2=$DFAE (all in LC bank 2, stubbed to RTS in our relay).
    if (line.match(/^\+ENABLE_ACCEL_LC\b/)) { ops.push({ op: "rwRam2" }, { op: "call", addr: 0xDFB7 }); continue }
    if (line.match(/^\+ENABLE_ACCEL_AND_HIDE_ARTWORK_LC\b/)) { ops.push({ op: "rwRam2" }, { op: "call", addr: 0xDFB7 }, { op: "call", addr: 0xDFAE }); continue }
    if (line.match(/^\+ENABLE_ACCEL_AND_HIDE_ARTWORK\b/)) { ops.push({ op: "rwRam2" }, { op: "call", addr: 0xDFB7 }, { op: "call", addr: 0xDFAE }, { op: "readRom" }); continue }
    if (line.match(/^\+ENABLE_ACCEL\b/)) { ops.push({ op: "rwRam2" }, { op: "call", addr: 0xDFB7 }, { op: "readRom" }); continue }
    if (line.match(/^\+DISABLE_ACCEL_AND_HIDE_ARTWORK_LC\b/)) { ops.push({ op: "call", addr: 0xDFB4 }, { op: "call", addr: 0xDFAE }, { op: "readRom" }); continue }
    if (line.match(/^\+DISABLE_ACCEL_AND_HIDE_ARTWORK\b/)) { ops.push({ op: "rwRam2" }, { op: "call", addr: 0xDFB4 }, { op: "call", addr: 0xDFAE }, { op: "readRom" }); continue }
    if (line.match(/^\+DISABLE_ACCEL_LC\b/)) { ops.push({ op: "call", addr: 0xDFB4 }, { op: "readRom" }); continue }
    if (line.match(/^\+DISABLE_ACCEL\b/)) { ops.push({ op: "rwRam2" }, { op: "call", addr: 0xDFB4 }, { op: "readRom" }); continue }
    if (line.match(/^\+HIDE_ARTWORK_LC\b/)) { ops.push({ op: "call", addr: 0xDFAE }, { op: "readRom" }); continue }
    if (line.match(/^\+HIDE_ARTWORK\b/)) { ops.push({ op: "rdRam2" }, { op: "call", addr: 0xDFAE }, { op: "readRom" }); continue }
    if (line.match(/^\+READ_ROM_NO_WRITE\b/)) { ops.push({ op: "readRom" }); continue }
    if (line.match(/^\+READ_RAM2_WRITE_RAM2\b/)) { ops.push({ op: "rwRam2" }); continue }
    if (line.match(/^\+READ_RAM2_NO_WRITE\b/)) { ops.push({ op: "rdRam2" }); continue }
    if (hasReadRam2ResetHandler && line.match(/^\+RESET_VECTOR\s+reset\b/i)) {
      ops.push({ op: "reset_handler", mode: "rdRam2" })
      continue
    }
    const numericResetVector = line.match(/^\+RESET_VECTOR\s+\$([0-9a-f]+)\b/i)
    if (numericResetVector) {
      if (parseInt(numericResetVector[1], 16) !== 0x0100) return undefined
      ops.push({ op: "reset_vector_100" })
      continue
    }
    if (line.match(/^\+(?:FORCE_REBOOT|RESET_VECTOR)\b/i)) return undefined
    if (line.startsWith("+")) continue

    if (hasCanonicalResetVector && line.match(/^lda\s+#<reset\b/i)) {
      ops.push({ op: "reset_vector" })
      parsingResetVector = true
      pendingLdaVal = undefined
      continue
    }

    if (line.match(/^inc\s+\$0?3F4\b/i)) {
      ops.push({ op: "inc_reset_checksum" })
      pendingLdaVal = undefined
      continue
    }

    // Detect callback address setup: lda #<callback / lda #>callback
    const callbackLoMatch = line.match(/^lda\s+#<(\w+)/i)
    if (callbackLoMatch) {
      if (hasSingleRtsRoutine && singleRtsRoutineSetup &&
          callbackLoMatch[1].toLowerCase() === singleRtsRoutineSymbol) {
        ops.push({
          op: "inline_rts_vector",
          loAddr: parseInt(singleRtsRoutineSetup[2], 16),
          hiAddr: parseInt(singleRtsRoutineSetup[3], 16),
        })
        skipInstalledRoutineSetupLines = 3
        continue
      }
      if (skippedForwardHelperRegion) return undefined
      callbackLoSymbol = callbackLoMatch[1].toLowerCase()
      pendingCallbackLo = true
      pendingLdaVal = undefined
      continue
    }
    const callbackHiMatch = line.match(/^lda\s+#>(\w+)/i)
    if (callbackHiMatch) {
      if (skippedForwardHelperRegion) return undefined
      callbackHiSymbol = callbackHiMatch[1].toLowerCase()
      pendingCallbackHi = true
      pendingLdaVal = undefined
      continue
    }

    if (stackEntryMatch) {
      const stackEntryHigh = parseInt(stackEntryMatch[1], 16)
      const stackEntryLda = line.match(/^lda\s+#\$([0-9a-f]{1,2})\b/i)
      if (stackEntryLda && parseInt(stackEntryLda[1], 16) === stackEntryHigh) {
        const returnAddress = (stackEntryHigh << 8) | parseInt(stackEntryMatch[2], 16)
        ops.push({ op: "stack_entry", returnAddress })
        entry = -1
        break
      }
    }

    if (stackCallbackSetup && line.match(/^lda\s+#>\(\s*callback\s*-\s*1\s*\)/i)) {
      ops.push({ op: "stack_callback_jmp", addr: parseInt(stackCallbackSetup[1], 16) })
      skipStackCallbackSetupLines = 6
      pendingLdaVal = undefined
      continue
    }

    const ldaHexMatch = line.match(/^lda\s+#\$([0-9a-fA-F]{1,2})\b/i)
    if (ldaHexMatch) { pendingLdaVal = parseInt(ldaHexMatch[1], 16); continue }
    const ldaDecMatch = line.match(/^lda\s+#(\d+)\b/i)
    if (ldaDecMatch) { pendingLdaVal = parseInt(ldaDecMatch[1], 10) & 0xFF; continue }

    const staMatch = line.match(/^sta\s+\$([0-9a-fA-F]{2,4})\b/i)
    if (staMatch) {
      const addr = parseInt(staMatch[1], 16)
      if (pendingCallbackLo) { callbackLoAddr = addr; pendingCallbackLo = false; continue }
      if (pendingCallbackHi) { callbackHiAddr = addr; pendingCallbackHi = false; continue }
      if (pendingLdaVal !== undefined) {
        ops.push({ op: "patch", addr, val: pendingLdaVal })
        continue
      }
    }

    const jsrMatch = line.match(/^jsr\s+\$([0-9a-fA-F]{2,4})\b/i)
    if (jsrMatch) {
      pendingLdaVal = undefined
      const addr = parseInt(jsrMatch[1], 16)
      if (!hasDecompress) { hasDecompress = true; ops.push({ op: "decompress", addr }) }
      else { ops.push({ op: "call", addr }) }
      continue
    }
    if (line.match(/^jsr\s+[a-z_@]/i)) return undefined

    const indirectJmpMatch = line.match(/^jmp\s+\(\s*([^)]+?)\s*\)/i)
    if (indirectJmpMatch) {
      const target = indirectJmpMatch[1].trim()
      if (target.toLowerCase() === "ldrlo2") {
        entry = "loadAddress"
      } else {
        const targetMatch = target.match(/^\$([0-9a-fA-F]{1,4})$/)
        if (!targetMatch) return undefined
        entry = { indirect: parseInt(targetMatch[1], 16) }
      }
      break
    }

    const jmpMatch = line.match(/^jmp\s+\$([0-9a-fA-F]{2,4})\b/i)
    if (jmpMatch) {
      const addr = parseInt(jmpMatch[1], 16)
      // Callback-based decompress: JMP before any JSR decompress, with callback vector set
      if (!hasDecompress && callbackLoAddr !== undefined && callbackHiAddr !== undefined) {
        if (callbackLoSymbol !== "callback" || callbackHiSymbol !== "callback") return undefined
        ops.push({ op: "callback_vector", loAddr: callbackLoAddr, hiAddr: callbackHiAddr })
        ops.push({ op: "jmp_decompress", addr })
        hasDecompress = true
        continue  // don't break — callback body follows
      }
      entry = addr
      break
    }

    pendingLdaVal = undefined
  }

  // Callback-based prelaunches have no explicit entry — the decompressor handles it.
  // Use entry = -1 to signal this to the relay generator.
  if (entry === undefined && inCallbackBody) entry = -1
  if (entry === undefined) return undefined
  if (!hasDecompress && ops.length === 0) return undefined
  if (dualCallbackSetup && hasDualArithmeticCallbackBodies) {
    ops.push({
      op: "install_routine",
      loAddr: parseInt(dualCallbackSetup[1], 16),
      hiAddr: parseInt(dualCallbackSetup[2], 16),
      bytes: [0x38, 0xE9, 0x08, 0xC9, 0x02, 0x90, 0x03, 0x4C, 0x0A, 0xAE, 0x4C, 0xF9, 0xAD],
    })
    ops.push({
      op: "install_routine",
      loAddr: parseInt(dualCallbackSetup[3], 16),
      hiAddr: parseInt(dualCallbackSetup[4], 16),
      bytes: [0x38, 0xE9, 0x08, 0xC9, 0x02, 0x90, 0x03, 0x4C, 0x0A, 0xAE, 0x4C, 0x21, 0xAE],
    })
  }
  return { sequence: ops, entry }
}

/**
 * Extract the packed binary and its load address from a 4cade .po disk.
 * The main game binary is the first non-system file in the ProDOS directory.
 */
export const extractPackedBinary = (poData: Uint8Array): { data: Uint8Array; loadAddress: number } | undefined => {
  const files = extractAllBinFiles(poData)
  return files.length > 0 ? files[0] : undefined
}

/**
 * Extract ALL non-system BIN files from a 4cade .po disk.
 * Returns them in directory order. The first is the main packed binary;
 * additional entries are supplementary files (title screen, game code, etc.)
 * that the game's loader would read from disk via ProDOS MLI calls.
 */
export const extractAllBinFiles = (poData: Uint8Array): Array<{ data: Uint8Array; loadAddress: number; name: string }> => {
  const results: Array<{ data: Uint8Array; loadAddress: number; name: string }> = []
  const blockSize = 512
  const block2off = 2 * blockSize
  if (poData.length < block2off + blockSize) return results

  const volByte = poData[block2off + 4]
  if (((volByte >> 4) & 0xF) !== 0xF) return results
  const entryLength = poData[block2off + 4 + 0x1F] || 0x27

  let dirBlock = 2
  for (let pass = 0; pass < 20 && dirBlock > 0; pass++) {
    const off = dirBlock * blockSize
    if (off + blockSize > poData.length) break
    const startEntry = pass === 0 ? off + 4 + entryLength : off + 4
    for (let e = startEntry; e + entryLength <= off + blockSize; e += entryLength) {
      const st = (poData[e] >> 4) & 0xF
      if (st === 0 || st === 0xF) continue
      const nameLen = poData[e] & 0xF
      if (nameLen === 0) continue
      const name = String.fromCharCode(...poData.slice(e + 1, e + 1 + nameLen))
      if (name === "PRODOS" || name.endsWith(".SYSTEM")) continue

      const fileType = poData[e + 0x10]
      const keyBlock = poData[e + 0x11] | (poData[e + 0x12] << 8)
      const eof = poData[e + 0x15] | (poData[e + 0x16] << 8) | (poData[e + 0x17] << 16)
      const auxType = poData[e + 0x1F] | (poData[e + 0x20] << 8)

      if (fileType !== 0x06) continue
      if (eof === 0) continue

      let fileData: Uint8Array | undefined
      if (st === 1) {
        fileData = poData.slice(keyBlock * blockSize, keyBlock * blockSize + eof)
      } else if (st === 2) {
        const idxOff = keyBlock * blockSize
        const blocks: number[] = []
        for (let i = 0; i < 256; i++) {
          const blk = poData[idxOff + i] | (poData[idxOff + 256 + i] << 8)
          if (blk === 0) break
          blocks.push(blk)
        }
        fileData = new Uint8Array(eof)
        let written = 0
        for (const blk of blocks) {
          const len = Math.min(blockSize, eof - written)
          fileData.set(poData.slice(blk * blockSize, blk * blockSize + len), written)
          written += len
        }
      } else if (st === 3) {
        const masterOff = keyBlock * blockSize
        const fileBytes = new Uint8Array(eof)
        let written = 0
        for (let mi = 0; mi < 128 && written < eof; mi++) {
          const idxBlock = poData[masterOff + mi] | (poData[masterOff + 256 + mi] << 8)
          if (idxBlock === 0) break
          const idxOff = idxBlock * blockSize
          for (let i = 0; i < 256 && written < eof; i++) {
            const blk = poData[idxOff + i] | (poData[idxOff + 256 + i] << 8)
            if (blk === 0) { written += blockSize; continue }
            const len = Math.min(blockSize, eof - written)
            fileBytes.set(poData.slice(blk * blockSize, blk * blockSize + len), written)
            written += len
          }
        }
        fileData = fileBytes
      }

      if (fileData) {
        results.push({ data: fileData, loadAddress: auxType, name })
      }
    }
    dirBlock = poData[off + 2] | (poData[off + 3] << 8)
  }
  return results
}
