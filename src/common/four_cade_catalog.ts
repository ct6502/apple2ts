import catalog from "./four_cade_catalog.json"

export type FourCadeEntry = {
  disk: string       // .po filename without extension (for GitHub fetch)
  prelaunch: string  // prelaunch .a filename without extension (for GitHub fetch)
}

export const FOUR_CADE_CATALOG: Record<string, FourCadeEntry> = catalog
