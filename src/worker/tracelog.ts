import { TraceSettingsDefault } from "../common/util_disassemble"

const traceSettings: TraceSettings = {
  numLines: TraceSettingsDefault.numLines,
  collapseLoops: TraceSettingsDefault.collapseLoops,
  ignoreRegisters: TraceSettingsDefault.ignoreRegisters,
}

export const setTraceSettings = (newTraceSettings: TraceSettings) => {
  traceSettings.numLines = newTraceSettings.numLines
  traceSettings.collapseLoops = newTraceSettings.collapseLoops
  traceSettings.ignoreRegisters = newTraceSettings.ignoreRegisters
}

let tracelog: Array<string> = []

// Search the previous traces for duplicates and replace all of the earlier
// duplicate lines with "..." to make it easier to see where we are in a loop.
// We need the entire chunk to be duplicated.
const lookForDuplicateTraces = () => {
  if (tracelog.length < 50) return
  // Remove the cycle count from the beginning, since that will always be different.
  const cut1 = 10
  const cut2 = traceSettings.ignoreRegisters ? 24 : 99
  const last = tracelog[tracelog.length - 1].slice(cut1, cut2)
  let pos = tracelog.length - 2
  const maxSearchBack = Math.max(tracelog.length - 20, 0)
  let match = -1
  while (pos >= maxSearchBack) {
    const line = tracelog[pos]
    if (line.slice(cut1, cut2) === last) {
      match = pos
      break
    }
    pos--
  }
  const matchLength = tracelog.length - match - 1
  // No match, or there isn't room for a full second match, so give up.
  if (match === -1 || (tracelog.length - 2 * matchLength) < 0) return
  for (let i = match - 1; i >= match - matchLength + 1; i--) {
    if (tracelog[i].slice(cut1, cut2) !== tracelog[i + matchLength].slice(cut1, cut2)) {
      return
    }
  }
  // Can safely remove the earlier chunk and replace with "..."
  const repeatPos = tracelog[match - matchLength].indexOf("repeated")
  const linesStr = `******** ${matchLength === 1 ? "1 line repeated" : `${matchLength} lines repeated`}`
  if (traceSettings.ignoreRegisters) {
    // Replace any differing characters in the repeated lines with "*"
    // to make it clear that they are different.
    for (let i = match - matchLength + 1; i < match; i++) {
      const line1 = tracelog[i]
      const line2 = tracelog[i + matchLength]
      tracelog[i + matchLength] = line2.slice(0, cut2) + line2.slice(cut2).split("").map((char, index) => {
        return (char !== line1[cut2 + index]) ? "*" : char
      }).join("")
    }
  }
  if (match >= matchLength && repeatPos > 0) {
    // Completely remove the earlier chunk, since we know it's a duplicate.
    tracelog.splice(match - matchLength + 1, matchLength)
    // Increment our repeat counter.
    const chunk = parseInt(tracelog[match - matchLength].slice(repeatPos + 9)) + 1
    tracelog[match - matchLength] = `${linesStr} ${chunk} times`
  } else {
    // Very first match for the chunk.
    tracelog[match] = `${linesStr} 1 time`
    // Remove the rest of the earlier chunk.
    tracelog.splice(match - matchLength + 1, matchLength - 1)
  }
  // Prepend "..." to the repeating lines.
  for (let i = match - matchLength + 1; i < tracelog.length; i++) {
    if (tracelog[i].startsWith("    ")) {
      tracelog[i] = "      .." + tracelog[i].slice(8)
    } else if (tracelog[i].startsWith("  ")) {
      tracelog[i] = "    ...." + tracelog[i].slice(8)
    } else if (tracelog[i].startsWith("..")) {
      tracelog[i] = "  ......" + tracelog[i].slice(8)
    } else {
      tracelog[i] = "........" + tracelog[i].slice(8)
    }
  }
}

export const updateTrace = (str: string) => {
  if (tracelog.length > traceSettings.numLines) {
    // Remove extra lines from the beginning of the array
    tracelog = tracelog.slice(tracelog.length - traceSettings.numLines)
  }
  tracelog.push(str)
  if (traceSettings.collapseLoops) {
    lookForDuplicateTraces()
  }
}

export const clearTracelog = () => {
  tracelog = []
}

export const getTracelog = () => {
  return tracelog
}
