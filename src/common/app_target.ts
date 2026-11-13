// Which deployable site this bundle is being built for. The same source tree
// backs apple2ts.com (classic Apple II / IIe) and apple2gts.com (Apple IIgs),
// so target-specific defaults and metadata are selected at build time.
//
// Set BUILD_TARGET to "apple2ts" or "apple2gts". Unset or unrecognised values
// fall back to apple2ts so ordinary `npm start`, Jest, and local builds keep
// working unchanged.

export type AppTarget = "apple2ts" | "apple2gts"

const GTS_TARGET = "apple2gts"
const TS_TARGET = "apple2ts"

export const parseAppTarget = (raw: string | undefined): AppTarget => {
  const normalized = (raw ?? "").trim().toLowerCase()
  if (normalized === GTS_TARGET || normalized === "gts" || normalized === "2gts") {
    return GTS_TARGET
  }
  if (normalized === TS_TARGET || normalized === "ts" || normalized === "2ts") {
    return TS_TARGET
  }
  return TS_TARGET
}

export const getAppName = (target: AppTarget): string =>
  target === GTS_TARGET ? "Apple2GTS" : "Apple2TS"

export const getAppTitle = (target: AppTarget): string =>
  target === GTS_TARGET
    ? "Apple2GTS - Apple IIgs Emulator in TypeScript"
    : "Apple2TS - Apple II Emulator in TypeScript"

export const getAppDescription = (target: AppTarget): string =>
  target === GTS_TARGET
    ? "A pure-TypeScript Apple IIgs emulator: 65816 at 2.8 MHz, Ensoniq DOC, ADB, and Super Hi-Res graphics."
    : "Apple II Emulator in TypeScript"

export const getAppDomain = (target: AppTarget): string =>
  target === GTS_TARGET ? "apple2gts.com" : "apple2ts.com"

export const getAppFavicon = (target: AppTarget): string =>
  target === GTS_TARGET ? "favicon-gts.svg" : "favicon.png"

export const getAppDefaultMachine = (target: AppTarget): MACHINE_NAME =>
  target === GTS_TARGET ? "APPLE2GS" : "APPLE2EE"

export const getAppManifestName = (target: AppTarget): string =>
  target === GTS_TARGET ? "Apple2GTS" : "Apple2TS"

export const getAppManifestDescription = (target: AppTarget): string =>
  target === GTS_TARGET
    ? "Pure-TypeScript Apple IIgs emulator with a 2.8 MHz 65816, Ensoniq DOC, ADB input, and Super Hi-Res graphics. Written in TypeScript and hosted on GitHub Pages. Chris Torrence, CT6502"
    : "Apple II Emulator in TypeScript. Emulates an enhanced Apple IIe with 128k of memory, a hard drive, two floppy disk drives, and gamepad support. Written in TypeScript, using the React JS library, and hosted on Github Pages. Chris Torrence, CT6502"

export const APP_TARGET = parseAppTarget(process.env.BUILD_TARGET)

export const IS_APPLE2GTS = APP_TARGET === GTS_TARGET

export const APP_NAME = getAppName(APP_TARGET)
export const APP_TITLE = getAppTitle(APP_TARGET)
export const APP_DESCRIPTION = getAppDescription(APP_TARGET)
export const APP_DOMAIN = getAppDomain(APP_TARGET)
export const APP_FAVICON = getAppFavicon(APP_TARGET)
export const APP_DEFAULT_MACHINE = getAppDefaultMachine(APP_TARGET)
export const APP_MANIFEST_NAME = getAppManifestName(APP_TARGET)
export const APP_MANIFEST_DESCRIPTION = getAppManifestDescription(APP_TARGET)
