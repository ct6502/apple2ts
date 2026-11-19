import { DEFAULT_SLOT_CONFIG, DEFAULT_SLOT_CONFIG_GS } from "../common/utility"
import { getSlotOptions, sanitizeSlotConfig } from "../common/slot_options"
import { iigsSlotRegisterFor } from "../common/iigs_slots"
import { doSetRom, memGet24, memSet24, memoryReset, iigsSlotRegister, memGetSlotROM } from "./memory"
import { CPU65816 } from "./cpu65816"
import { doBoot, doSetMachineName, doSetRunMode, doSetSlotConfig, doSetVeraSlot, getSlotConfig, resetCpuSpeedForTesting } from "./motherboard"
import { s6502 } from "./instructions"
import * as worker2main from "./worker2main"
import { setIsTesting } from "./worker2main"
import { RUN_MODE } from "../common/utility"

describe("Apple IIgs Slot Management & Hardware Compatibility", () => {
  beforeEach(() => {
    setIsTesting()
  })

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

  test("switching a classic VERA layout to the IIgs drops stale VERA state", () => {
    doSetMachineName("APPLE2EE", false, false)
    doSetSlotConfig({ ...DEFAULT_SLOT_CONFIG, 2: "vera" })
    expect(getSlotConfig()[2]).toBe("vera")

    doSetMachineName("APPLE2GS", false, false)
    expect(getSlotConfig()).toEqual(DEFAULT_SLOT_CONFIG_GS)

    // A preference restored after the switch still carries a classic VERA slot.
    // It must sanitise to the GS built-in Modem Port instead of putting a VERA
    // card in slot 2, which has no hardware bus position on this machine.
    doSetSlotConfig({ ...DEFAULT_SLOT_CONFIG_GS, 2: "vera" })
    expect(getSlotConfig()[2]).toBe("gsModem")
    doSetVeraSlot(2)
    expect(getSlotConfig()[2]).toBe("gsModem")
  })

  test("classic machine switches keep the card layout and only change slot 3", () => {
    doSetMachineName("APPLE2EE", false, false)
    doSetSlotConfig({
      ...DEFAULT_SLOT_CONFIG,
      1: "ssc",
      2: "vera",
      3: "aux",
      4: "mockingboard",
    })
    doSetMachineName("APPLE2P", false, false)
    expect(getSlotConfig()[1]).toBe("ssc")
    expect(getSlotConfig()[2]).toBe("vera")
    expect(getSlotConfig()[4]).toBe("mockingboard")
    expect(getSlotConfig()[3]).toBe("videoterm")

    doSetMachineName("APPLE2EE", false, false)
    expect(getSlotConfig()[3]).toBe("aux")
  })

  test("Slot 4 Mockingboard works on Apple IIgs (I/O, 6522 VIA registers, IRQ triggering)", () => {
    doSetMachineName("APPLE2GS", false, false)
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

  test("CPU-visible $C400-$C4FF read back Mockingboard registers on the IIgs", () => {
    doSetMachineName("APPLE2GS", false, false)
    memoryReset()
    doSetRom("APPLE2GS")
    doSetSlotConfig({ ...DEFAULT_SLOT_CONFIG_GS, 4: "mockingboard" })
    const passSpy = jest.spyOn(worker2main, "passMockingboard")

    memSet24(0x00C403, 0xFF) // DDRA write through the CPU bus
    expect(memGetSlotROM(4, 0x03)).toBe(0xFF)
    expect(memGet24(0x00C403)).toBe(0xFF) // this is what a game reads back

    memSet24(0x00C403, 0x0F)
    expect(memGet24(0x00C403)).toBe(0x0F)

    // A register write must post sound params to the UI (slot 4, chip 0).
    memSet24(0x00C420, 0x10)
    memSet24(0x00C400, 0x06)
    expect(passSpy).toHaveBeenCalled()
    expect(passSpy.mock.calls.some(call => call[0].slot === 4 && call[0].chip === 0)).toBe(true)
    passSpy.mockRestore()
  })

  test("Slot 4 Mockingboard survives the ROM's SLTROMSEL boot writes and still answers CPU reads/writes", () => {
    jest.useFakeTimers()
    setIsTesting()
    try {
      doSetMachineName("APPLE2GS", false, false)
      doSetSlotConfig({ ...DEFAULT_SLOT_CONFIG_GS, 4: "mockingboard" })
      doBoot()
      doSetRunMode(RUN_MODE.RUNNING, false)
      for (let f = 0; f < 600; f++) jest.advanceTimersByTime(17)

      // The no-card ROM boot writes SLTROMSEL ($C02D) from its own slot scan
      // ($80, slot 4 bit clear) and leaves INTCXROM set, but the Control Panel
      // layout still assigns the card to slot 4: the card ROM must stay selected
      // and answer CPU reads/writes instead of the ROM's built-in slot firmware.
      const register = memGet24(0x00C02D)
      expect(register & (1 << 4)).toBe(1 << 4)
      expect(register).toBe(0x90)

      // And the CPU still reads/writes the card at $C400-$C4FF, not the ROM's
      // built-in slot firmware.
      memSet24(0x00C403, 0xFE)
      expect(memGetSlotROM(4, 0x03)).toBe(0xFE)
      expect(memGet24(0x00C403)).toBe(0xFE)

      // CPU-bus write through the latched WRITE command posts sound params.
      const passSpy = jest.spyOn(worker2main, "passMockingboard")
      memSet24(0x00C420, 0x0F) // ORA stash: register number 15
      memSet24(0x00C400, 0x07) // LATCH command
      memSet24(0x00C401, 0xB0) // ORA stash: byte to write
      memSet24(0x00C400, 0x06) // WRITE command
      expect(passSpy.mock.calls.some(call => call[0].slot === 4 && call[0].chip === 0) === true).toBe(true)
      passSpy.mockRestore()
    } finally {
      doSetRunMode(RUN_MODE.PAUSED, false)
      resetCpuSpeedForTesting()
      jest.useRealTimers()
    }
  })
})
