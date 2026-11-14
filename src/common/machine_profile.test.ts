import {
  ALL_MACHINE_NAMES,
  CLASSIC_PROFILE,
  GS_PROFILE,
  getMachineBootDisk,
  getMachineCapabilities,
  getMachineProfile,
  getMachineTraits,
  getProfileCyclesPerRefresh,
  getProfileDefaultSlotConfig,
  getProfileSlotChoices,
  getProfileSpeedOptions,
} from "./machine_profile"
import { sanitizeSlotConfig } from "./slot_options"

describe("machine profiles", () => {
  test("classic and GS profiles are explicit and mutually exclusive", () => {
    expect(CLASSIC_PROFILE.profileName).toBe("classic_profile")
    expect(GS_PROFILE.profileName).toBe("gs_profile")
    expect(CLASSIC_PROFILE.machines).toEqual(["APPLE2P", "APPLE2EU", "APPLE2EE"])
    expect(GS_PROFILE.machines).toEqual(["APPLE2GS"])
    expect(ALL_MACHINE_NAMES).toEqual(["APPLE2P", "APPLE2EU", "APPLE2EE", "APPLE2GS"])
    expect(getMachineProfile("APPLE2EE")).toBe(CLASSIC_PROFILE)
    expect(getMachineProfile("APPLE2GS")).toBe(GS_PROFILE)
  })

  test("exact-model UI traits stay central instead of machine-id checks", () => {
    expect(getMachineTraits("APPLE2P")).toEqual({
      isApple2Plus: true,
      hasAltCharSet: false,
      hasLowerCase: false,
      hasMouseText: false,
      usesApple2PlusMap: true,
      hardwareKeyboardRepeats: false,
    })
    expect(getMachineTraits("APPLE2EU").hasMouseText).toBe(false)
    expect(getMachineTraits("APPLE2EU").hardwareKeyboardRepeats).toBe(true)
    expect(getMachineTraits("APPLE2EE").hasMouseText).toBe(true)
    expect(getMachineTraits("APPLE2GS").hasMouseText).toBe(true)
    expect(getMachineTraits("APPLE2GS").isApple2Plus).toBe(false)
  })

  test("GS has built-in slot functions and no VERA card", () => {
    const capabilities = getMachineCapabilities("APPLE2GS")
    expect(capabilities.isGS).toBe(true)
    expect(capabilities.hasBuiltinSlotFunctions).toBe(true)
    expect(capabilities.hasVeraCard).toBe(false)
    expect(capabilities.hasThreeInchBay).toBe(true)
    expect(capabilities.hasSuperHiRes).toBe(true)

    expect(getProfileSlotChoices(GS_PROFILE, "APPLE2GS", 2).map(o => o.card))
      .toEqual(["gsModem"])
    expect(getProfileSlotChoices(GS_PROFILE, "APPLE2GS", 4).map(o => o.card))
      .toEqual(["gsMouse", "mockingboard"])
  })

  test("classic slot 3 follows the exact machine variant", () => {
    expect(getProfileSlotChoices(CLASSIC_PROFILE, "APPLE2P", 3).map(o => o.card))
      .toEqual(["none", "videoterm", "vidhd"])
    const enhanced = getProfileSlotChoices(CLASSIC_PROFILE, "APPLE2EE", 3)
    expect(enhanced.filter(o => o.card === "aux").map(o => o.ramSizeKb))
      .toEqual([64, 512, 1024, 4096, 8192])
    expect(enhanced[enhanced.length - 1].card).toBe("vidhd")
  })

  test("stale classic VERA slot sanitizes away on the GS", () => {
    const stale = {
      1: "ssc",
      2: "vera",
      3: "aux",
      4: "vera",
      5: "mouse",
      6: "disk2",
      7: "smartport",
    } as SlotConfig
    expect(sanitizeSlotConfig(stale, "APPLE2GS")).toEqual({
      1: "ssc",
      2: "gsModem",
      3: "gsText80",
      4: "gsMouse",
      5: "gsSmartPort",
      6: "gsDiskPort",
      7: "smartport",
    })
    expect(sanitizeSlotConfig(stale, "APPLE2EE")).toEqual(stale)
  })

  test("CPU clock tables belong to the profile, not the scheduler", () => {
    const classic = getProfileSpeedOptions(CLASSIC_PROFILE)
    const gs = getProfileSpeedOptions(GS_PROFILE)
    expect(classic.map(o => o.mode)).toEqual([-2, -1, 0, 1, 2, 3, 4])
    expect(gs.map(o => o.mode)).toEqual([-2, -1, 0, 1, 2, 3, 4])
    expect(getProfileCyclesPerRefresh(CLASSIC_PROFILE, 0)).toBe(17030)
    expect(getProfileCyclesPerRefresh(CLASSIC_PROFILE, 1)).toBe(34060)
    expect(getProfileCyclesPerRefresh(GS_PROFILE, 1)).toBe(46727)
    expect(getProfileCyclesPerRefresh(GS_PROFILE, 2)).toBe(118486)
    expect(gs.find(o => o.mode === 0)?.label).toBe("1.02 MHz")
    expect(gs.find(o => o.mode === 1)?.label).toBe("2.8 MHz")
  })

  test("boot and disk bays are explicit per profile", () => {
    expect(getMachineBootDisk("APPLE2EE")).toMatchObject({
      driveIndices: {smartPort: [0, 1], floppy525: [2, 3], floppy35: []},
      diskPortSlot: 6,
      hardDriveSlot: 7,
      supports35Inch: false,
    })
    expect(getMachineBootDisk("APPLE2GS")).toMatchObject({
      driveIndices: {smartPort: [0, 1], floppy525: [2, 3], floppy35: [4, 5]},
      diskPortSlot: 6,
      hardDriveSlot: 7,
      supports35Inch: true,
    })
  })

  test("default slot layout is keyed by machine, including II+ slot 3", () => {
    expect(getProfileDefaultSlotConfig(CLASSIC_PROFILE, "APPLE2P")[3])
      .toBe("videoterm")
    expect(getProfileDefaultSlotConfig(CLASSIC_PROFILE, "APPLE2EE")[3])
      .toBe("aux")
    expect(getProfileDefaultSlotConfig(GS_PROFILE, "APPLE2GS")).toEqual({
      1: "gsPrinter",
      2: "gsModem",
      3: "gsText80",
      4: "gsMouse",
      5: "gsSmartPort",
      6: "gsDiskPort",
      7: "smartport",
    })
  })
})
