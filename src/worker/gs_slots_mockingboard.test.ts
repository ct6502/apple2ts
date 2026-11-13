import { DEFAULT_SLOT_CONFIG_GS } from "../common/utility"
import { getSlotOptions, sanitizeSlotConfig } from "../common/slot_options"
import { iigsSlotRegisterFor } from "../common/iigs_slots"
import { doSetRom, memGet24, memSet24, memoryReset, iigsSlotRegister } from "./memory"
import { CPU65816 } from "./cpu65816"
import { doSetMachineName, doSetSlotConfig, getSlotConfig } from "./motherboard"
import { s6502 } from "./instructions"

describe("Apple IIgs Slot Management & Hardware Compatibility", () => {
  test("Apple IIgs slot options follow the Control Panel built-in functions", () => {
    // Slot 1: built-in Printer Port, or a Super Serial Card
    expect(getSlotOptions(1, "APPLE2GS")).toEqual([{ card: "gsPrinter" }, { card: "ssc" }])
    // Slot 2: built-in Modem Port
    expect(getSlotOptions(2, "APPLE2GS")).toEqual([{ card: "gsModem" }])
    // Slot 3: built-in 80-column / text firmware
    expect(getSlotOptions(3, "APPLE2GS")).toEqual([{ card: "gsText80" }])
    // Slot 4: built-in Mouse Port, or a Mockingboard
    expect(getSlotOptions(4, "APPLE2GS")).toEqual([{ card: "gsMouse" }, { card: "mockingboard" }])
    // Slot 5: built-in Smart Port (3.5" UniDisk)
    expect(getSlotOptions(5, "APPLE2GS")).toEqual([{ card: "gsSmartPort" }])
    // Slot 6: built-in Disk Port (5.25" Disk II)
    expect(getSlotOptions(6, "APPLE2GS")).toEqual([{ card: "gsDiskPort" }])
    // Slot 7: Your Card (empty) or the SmartPort hard drive card
    expect(getSlotOptions(7, "APPLE2GS")).toEqual([{ card: "none" }, { card: "smartport" }])
    // Classic machines are untouched by the IIgs model.
    expect(getSlotOptions(6, "APPLE2EE")).toEqual([{ card: "none" }, { card: "disk2" }])
  })

  test("DEFAULT_SLOT_CONFIG_GS assigns the built-in functions", () => {
    expect(DEFAULT_SLOT_CONFIG_GS).toEqual({
      1: "gsPrinter",
      2: "gsModem",
      3: "gsText80",
      4: "gsMouse",
      5: "gsSmartPort",
      6: "gsDiskPort",
      7: "smartport",
    })
  })

  test("$C02D sets a bit only for slots holding a card", () => {
    // Slot 3 never appears in SLTROMSEL; slot 7 holds the hard drive card.
    expect(iigsSlotRegisterFor(DEFAULT_SLOT_CONFIG_GS)).toBe(0x80)
    expect(iigsSlotRegisterFor({ ...DEFAULT_SLOT_CONFIG_GS, 1: "ssc" })).toBe(0x82)
    expect(iigsSlotRegisterFor({ ...DEFAULT_SLOT_CONFIG_GS, 4: "mockingboard" })).toBe(0x90)
    // An empty "Your Card" slot still selects card space, so the bit stays set.
    expect(iigsSlotRegisterFor({ ...DEFAULT_SLOT_CONFIG_GS, 7: "none" })).toBe(0x80)
    // Every built-in function leaves the motherboard firmware mapped; only
    // slot 7's (empty, "Your Card") card bit remains.
    expect(iigsSlotRegisterFor({
      1: "gsPrinter",
      2: "gsModem",
      3: "gsText80",
      4: "gsMouse",
      5: "gsSmartPort",
      6: "gsDiskPort",
      7: "none",
    })).toBe(0x80)
  })

  test("sanitizeSlotConfig maps old IIe / pre-Control-Panel values to GS functions", () => {
    const iieConfig = {
      1: "ssc" as const,
      2: "none" as const,
      3: "aux" as const,
      4: "vera" as const,
      5: "mouse" as const,
      6: "disk2" as const,
      7: "smartport" as const,
    }
    const sanitized = sanitizeSlotConfig(iieConfig, "APPLE2GS")
    expect(sanitized[1]).toBe("ssc")       // card allowed
    expect(sanitized[2]).toBe("gsModem")
    expect(sanitized[3]).toBe("gsText80")  // aux removed
    expect(sanitized[4]).toBe("gsMouse")   // vera removed
    expect(sanitized[5]).toBe("gsSmartPort") // mouse card removed
    expect(sanitized[6]).toBe("gsDiskPort")  // Disk II card is the built-in port
    expect(sanitized[7]).toBe("smartport")

    // Configurations saved before the slot rework:
    const legacy = { ...DEFAULT_SLOT_CONFIG_GS, 1: "none" as const, 5: "disk35" as const, 6: "disk2" as const }
    const migrated = sanitizeSlotConfig(legacy, "APPLE2GS")
    expect(migrated[1]).toBe("gsPrinter")
    expect(migrated[5]).toBe("gsSmartPort")
    expect(migrated[6]).toBe("gsDiskPort")
  })

  test("doSetMachineName('APPLE2GS') resets slots to DEFAULT_SLOT_CONFIG_GS", () => {
    doSetMachineName("APPLE2GS", false, false)
    expect(getSlotConfig()).toEqual(DEFAULT_SLOT_CONFIG_GS)
  })

  test("Slot 4 Mockingboard works on Apple IIgs (I/O, 6522 VIA registers, IRQ triggering)", () => {
    memoryReset()
    doSetRom("APPLE2GS")
    doSetSlotConfig({
      ...DEFAULT_SLOT_CONFIG_GS,
      4: "mockingboard",
    })

    const cpu = new CPU65816(memGet24, (addr, val) => memSet24(addr, val))
    cpu.reset()

    // $C02D bit 4 should be 1 (peripheral card in slot 4)
    expect((iigsSlotRegister & (1 << 4)) !== 0).toBe(true)

    // Write to Mockingboard VIA #1 ACR ($C40B) and Data Direction Register A ($C403)
    memSet24(0x00C40B, 0x00) // One-shot mode for Timer 1
    memSet24(0x00C403, 0xFF) // DDRA = output

    // Write to Timer 1 low ($C404) and high ($C405)
    memSet24(0x00C404, 0x10) // T1 low latch
    memSet24(0x00C405, 0x00) // T1 high latch & start timer

    // Enable Timer 1 interrupt in VIA #1 IER ($C40E)
    // Bit 7=1 (set), Bit 6=1 (Timer 1) -> 0xC0
    memSet24(0x00C40E, 0xC0)

    // Advance cycles so the timer expires
    s6502.cycleCount += 50
    // Trigger cycleCountCallbacks
    const { processCycleCountCallbacks } = require("./cpu6502")
    processCycleCountCallbacks()

    // Interrupt should now be requested
    expect(s6502.flagIRQ & (1 << 4)).not.toBe(0)

    // Clear CPU I flag to allow interrupt to fire
    cpu.P &= ~0x04 // clear Status816.I

    // The vector at $00:FFFE in Apple IIgs points to the hardware firmware IRQ routine ($C074)
    const expectedVector = memGet24(0x00FFFE) | (memGet24(0x00FFFF) << 8)
    expect(expectedVector).toBe(0xC074)

    // Process instruction should take the IRQ (returns 7 cycles)
    const cycles = cpu.processInstruction()
    expect(cycles).toBe(7)
    expect(cpu.PC).toBe(expectedVector)
    expect(cpu.P & 0x04).toBe(0x04) // I flag set by interrupt
  })
})
