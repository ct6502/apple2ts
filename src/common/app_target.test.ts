import {
  getAppDefaultMachine,
  getAppDescription,
  getAppDomain,
  getAppFavicon,
  getAppMachineNameOrDefault,
  getAppMachineNames,
  getAppName,
  getAppTitle,
  parseAppTarget,
} from "./app_target"

describe("deployment target parsing", () => {
  test("accepts the canonical apple2ts and apple2gts values", () => {
    expect(parseAppTarget("apple2ts")).toBe("apple2ts")
    expect(parseAppTarget("apple2gts")).toBe("apple2gts")
  })

  test("accepts target aliases and normalizes casing / whitespace", () => {
    expect(parseAppTarget(" 2gts ")).toBe("apple2gts")
    expect(parseAppTarget("gts")).toBe("apple2gts")
    expect(parseAppTarget("Apple2GTS")).toBe("apple2gts")
    expect(parseAppTarget("2ts")).toBe("apple2ts")
    expect(parseAppTarget("ts")).toBe("apple2ts")
    expect(parseAppTarget("Apple2TS")).toBe("apple2ts")
  })

  test("falls back to apple2ts when unset or unrecognised", () => {
    expect(parseAppTarget(undefined)).toBe("apple2ts")
    expect(parseAppTarget("")).toBe("apple2ts")
    expect(parseAppTarget("apple-2")).toBe("apple2ts")
  })
})

describe("target-specific metadata and defaults", () => {
  test("apple2ts keeps the classic Apple II identity", () => {
    expect(getAppName("apple2ts")).toBe("Apple2TS")
    expect(getAppDomain("apple2ts")).toBe("apple2ts.com")
    expect(getAppFavicon("apple2ts")).toBe("favicon.png")
    expect(getAppDefaultMachine("apple2ts")).toBe("APPLE2EE")
    expect(getAppTitle("apple2ts")).toContain("Apple II")
    expect(getAppDescription("apple2ts")).toBe("Apple II Emulator in TypeScript")
  })

  test("apple2gts selects the IIgs identity and machine", () => {
    expect(getAppName("apple2gts")).toBe("Apple2GTS")
    expect(getAppDomain("apple2gts")).toBe("apple2gts.com")
    expect(getAppFavicon("apple2gts")).toBe("favicon-gts.svg")
    expect(getAppDefaultMachine("apple2gts")).toBe("APPLE2GS")
    expect(getAppTitle("apple2gts")).toContain("Apple IIgs")
    expect(getAppDescription("apple2gts")).toContain("Apple IIgs")
  })
})

describe("target machine menus", () => {
  test("apple2ts offers only the classic machines in fixed order", () => {
    expect(getAppMachineNames("apple2ts")).toEqual(["APPLE2P", "APPLE2EU", "APPLE2EE"])
  })

  test("apple2gts offers only the IIgs", () => {
    expect(getAppMachineNames("apple2gts")).toEqual(["APPLE2GS"])
  })

  test("an unsupported machine falls back to the target default", () => {
    // Jest builds default to apple2ts, whose default is the enhanced IIe.
    expect(getAppMachineNameOrDefault("APPLE2GS")).toBe("APPLE2EE")
    expect(getAppMachineNameOrDefault("APPLE2EU")).toBe("APPLE2EU")
    expect(getAppMachineNameOrDefault(undefined)).toBe("APPLE2EE")

    expect(getAppMachineNameOrDefault("APPLE2GS", "apple2gts")).toBe("APPLE2GS")
    expect(getAppMachineNameOrDefault("APPLE2EE", "apple2gts")).toBe("APPLE2GS")
    expect(getAppMachineNameOrDefault("APPLE2EU", "apple2ts")).toBe("APPLE2EU")
  })
})
