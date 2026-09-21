import fs from "fs"
import { enableVera, resetVera, initVera, sdcard_attach_image, sdcard_detach_image, sdcard_get_status } from "./vera"
import { video_step, video_get_framebuffer, video_reset } from "./video"
import { vera_spi_step, sdcard_set_write_protected, sdcard_clear_changes, sdcard_get_write_seq } from "./sdcard"
import { memGet, memSet } from "../../memory"
import { doBoot } from "../../motherboard"
import { s6502, setPC } from "../../instructions"
import { processInstruction } from "../../cpu6502"
import { getVeraSpriteDemoAssembly, getVeraMode7DemoAssembly, buildVeraDemo } from "./vera_demos"

describe("VERA Graphics & Sound Card Emulation on Apple II", () => {
  beforeAll(() => {
    // Mock worker postMessage for clean Jest execution
    if (typeof globalThis.postMessage === "function") {
      jest.spyOn(globalThis, "postMessage").mockImplementation(() => {})
    }
  })

  beforeEach(() => {
    doBoot()
    initVera()
    resetVera()
    video_reset()
    enableVera(true, 2)
  })

  test("I/O registers map correctly to Slot 2 ($C200-$C21F)", () => {
    // Write VRAM Address 0 ($00000) with Auto-Increment +1 (stride index 2 -> 2 << 3 = 0x10)
    memSet(0xC200, 0x00) // ADDR_L
    memSet(0xC201, 0x00) // ADDR_M
    memSet(0xC202, 0x10) // ADDR_H: Bank 0, Inc +1

    // Write sequence of bytes to DATA0 ($C203)
    memSet(0xC203, 0xAA)
    memSet(0xC203, 0xBB)
    memSet(0xC203, 0xCC)

    // Reset Address back to $00000 with Auto-Increment +1
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x00)
    memSet(0xC202, 0x10)

    // Read back via DATA0 ($C203)
    expect(memGet(0xC203, false)).toBe(0xAA)
    expect(memGet(0xC203, false)).toBe(0xBB)
    expect(memGet(0xC203, false)).toBe(0xCC)
  })

  test("Auto-increment with different stride values (+2, +4, +8)", () => {
    // VERA Stride Table:
    // Index 2 (0x10): +1
    // Index 4 (0x20): +2
    // Index 6 (0x30): +4
    // Index 8 (0x40): +8
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x00)
    memSet(0xC202, 0x30) // Stride index 6 -> Inc +4

    memSet(0xC203, 0x11) // Writes to $00000, next is $00004
    memSet(0xC203, 0x22) // Writes to $00004, next is $00008

    // Read without auto-increment (stride 0)
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x00)
    memSet(0xC202, 0x00)
    expect(memGet(0xC203, false)).toBe(0x11)

    memSet(0xC200, 0x04)
    memSet(0xC201, 0x00)
    memSet(0xC202, 0x00)
    expect(memGet(0xC203, false)).toBe(0x22)
  })

  test("Dual data ports DATA0 ($C203) and DATA1 ($C204) with CTRL.ADDRSEL", () => {
    // Setup ADDR0 pointing to $00100
    memSet(0xC205, 0x00) // CTRL = 0 (ADDR0 selected)
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x01)
    memSet(0xC202, 0x10) // Inc +1
    memSet(0xC203, 0x55) // Write $55 to $00100

    // Setup ADDR1 pointing to $00200
    memSet(0xC205, 0x01) // CTRL = 1 (ADDR1 selected)
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x02)
    memSet(0xC202, 0x10) // Inc +1
    memSet(0xC204, 0x99) // Write $99 to $00200

    // Verify $00100 still holds $55 and $00200 holds $99
    memSet(0xC205, 0x00) // select ADDR0
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x01)
    memSet(0xC202, 0x00)
    expect(memGet(0xC203, false)).toBe(0x55)

    memSet(0xC205, 0x01) // select ADDR1
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x02)
    memSet(0xC202, 0x00)
    expect(memGet(0xC204, false)).toBe(0x99)
  })

  test("Palette writing and reading at VRAM $1FA00", () => {
    // Point ADDR0 to $1FA00 (Palette Entry 0)
    memSet(0xC205, 0x00)
    memSet(0xC200, 0x00)
    memSet(0xC201, 0xFA)
    memSet(0xC202, 0x11) // Bank 1 ($10000 | $FA00), Auto-inc +1

    // Write Color 1: Red (12-bit RGB $0F00 -> Low=GB $00, High=0R $0F)
    memSet(0xC203, 0x00) // Entry 0 Low
    memSet(0xC203, 0x00) // Entry 0 High
    memSet(0xC203, 0x00) // Entry 1 Low (GB = $00)
    memSet(0xC203, 0x0F) // Entry 1 High (0R = $0F)

    // Read back Entry 1
    memSet(0xC200, 0x02)
    memSet(0xC201, 0xFA)
    memSet(0xC202, 0x11)
    expect(memGet(0xC203, false)).toBe(0x00)
    expect(memGet(0xC203, false)).toBe(0x0F)
  })

  test("executes Sprite Demo 6502 assembly and renders multi-sprite video frame (Demo 1)", () => {
    const startAddress = 0x2000
    const demo = buildVeraDemo(getVeraSpriteDemoAssembly, 2, startAddress)

    // Load compiled 6502 demo into Apple II memory at $2000
    demo.bytes.forEach((b, i) => {
      memSet(startAddress + i, b)
    })

    // Execute the demo from $2000 until RTS
    setPC(startAddress)
    let maxInstructions = 10000
    while (maxInstructions-- > 0) {
      if (s6502.PC === 0x0000 || memGet(s6502.PC) === 0x60 /* RTS */) {
        processInstruction()
        break
      }
      processInstruction()
    }

    // Verify Sprite 0 attributes in VRAM ($1FC00)
    // Byte 0: Shape addr low ($00)
    // Byte 1: Shape addr high ($08)
    // Byte 6: Z-depth ($0C)
    // Byte 7: Dimension & palette ($90)
    memSet(0xC200, 0x00)
    memSet(0xC201, 0xFC)
    memSet(0xC202, 0x11) // Bank 1, Inc +1
    expect(memGet(0xC203, false)).toBe(0x00)
    expect(memGet(0xC203, false)).toBe(0x08)

    // Step VERA video engine by 1 full video frame (~16666 cycles at 1MHz)
    video_step(1, 20000, false)

    // Inspect the 640x480 RGBA framebuffer for rendered sprite pixels
    const fb = video_get_framebuffer()
    expect(fb.length).toBe(640 * 480 * 4)

    // Verify that the frame is not completely blank (has rendered sprite pixels)
    let spritePixelCount = 0
    for (let i = 0; i < fb.length; i += 4) {
      const r = fb[i]
      const g = fb[i + 1]
      const b = fb[i + 2]
      if (r > 0 || g > 0 || b > 0) {
        spritePixelCount++
      }
    }

    expect(spritePixelCount).toBeGreaterThan(50)
  })

  test("executes Mode 7 256-Color Bitmap Demo and renders colored pixels (Demo 2)", () => {
    const startAddress = 0x2000
    const demo = buildVeraDemo(getVeraMode7DemoAssembly, 2, startAddress)

    // Load compiled 6502 demo into memory
    demo.bytes.forEach((b, i) => {
      memSet(startAddress + i, b)
    })

    // Execute the demo from $2000 until RTS
    setPC(startAddress)
    let maxInstructions = 20000
    while (maxInstructions-- > 0) {
      if (s6502.PC === 0x0000 || memGet(s6502.PC) === 0x60 /* RTS */) {
        processInstruction()
        break
      }
      processInstruction()
    }

    // Step VERA video engine by 1 full video frame
    video_step(1, 20000, false)

    // Inspect framebuffer
    const fb = video_get_framebuffer()
    expect(fb.length).toBe(640 * 480 * 4)

    // Count non-black, opaque pixels rendered from the 256-color palette
    let coloredPixelCount = 0
    for (let i = 0; i < fb.length; i += 4) {
      const r = fb[i]
      const g = fb[i + 1]
      const b = fb[i + 2]
      if (r > 0 || g > 0 || b > 0) {
        coloredPixelCount++
      }
    }

    expect(coloredPixelCount).toBeGreaterThan(1000)
  })

  test("VERA SD Card - attach, detach, and status reporting", () => {
    sdcard_detach_image()
    let st = sdcard_get_status()
    expect(st.attached).toBe(false)
    expect(st.name).toBe("")
    expect(st.size).toBe(0)

    const testImg = new Uint8Array(1024 * 1024) // 1MB
    testImg[0] = 0xEB
    testImg[1] = 0x58
    testImg[2] = 0x90
    sdcard_attach_image(testImg, "test_card.img")

    st = sdcard_get_status()
    expect(st.attached).toBe(true)
    expect(st.name).toBe("test_card.img")
    expect(st.size).toBe(1024 * 1024)

    sdcard_detach_image()
    expect(sdcard_get_status().attached).toBe(false)
  })

  test("VERA SD Card - SPI command sequence (CMD0, CMD8, ACMD41, CMD16, CMD17 read, CMD24 write)", () => {
    // 1MB test image with 2048 sectors (512 bytes each)
    const testImg = new Uint8Array(1024 * 1024)
    // Put test pattern in Sector 0
    testImg[0] = 0xEB
    testImg[1] = 0x58
    testImg[2] = 0x90
    testImg[510] = 0x55
    testImg[511] = 0xAA

    sdcard_attach_image(testImg, "sd.img")

    const spiSend = (val: number) => {
      memSet(0xC21E, val)
      vera_spi_step(4)
    }

    const spiRead = (): number => {
      memSet(0xC21E, 0xFF)
      vera_spi_step(4)
      return memGet(0xC21E, false)
    }

    // Select SD Card (CS = active low -> write 1 to register 0x1F)
    memSet(0xC21F, 0x01)
    expect(memGet(0xC21F, false) & 0x01).toBe(1)

    // CMD0: 40 00 00 00 00 95 (GO_IDLE_STATE)
    spiSend(0x40)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x95)
    const r1_cmd0 = spiRead()
    expect(r1_cmd0).toBe(0x01) // In idle state

    // CMD8: 48 00 00 01 AA 87 (SEND_IF_COND)
    spiSend(0x48)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x01)
    spiSend(0xAA)
    spiSend(0x87)
    const r1_cmd8 = spiRead()
    expect(r1_cmd8).toBe(0x01)
    const cmd8_b1 = spiRead()
    const cmd8_b2 = spiRead()
    const cmd8_b3 = spiRead()
    const cmd8_b4 = spiRead()
    expect([cmd8_b1, cmd8_b2, cmd8_b3, cmd8_b4]).toEqual([0x00, 0x00, 0x01, 0xAA])

    // CMD55 + ACMD41: Init
    spiSend(0x77) // CMD55
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x01)
    spiRead() // R1

    spiSend(0x69) // ACMD41
    spiSend(0x40)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x01)
    const r1_acmd41 = spiRead()
    expect(r1_acmd41).toBe(0x00) // Ready!

    // CMD16: Set block length 512
    spiSend(0x50)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x02)
    spiSend(0x00)
    spiSend(0xFF)
    const r1_cmd16 = spiRead()
    expect(r1_cmd16).toBe(0x00)

    // CMD17: Read Sector 0 (0x51 00 00 00 00 FF)
    spiSend(0x51)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0xFF)
    const r1_cmd17 = spiRead()
    expect(r1_cmd17).toBe(0x00)

    // Read start block token
    const token = spiRead()
    expect(token).toBe(0xFE)

    // Read 512 data bytes
    const sectorData = new Uint8Array(512)
    for (let i = 0; i < 512; i++) {
      sectorData[i] = spiRead()
    }
    // Read 2 CRC bytes
    spiRead()
    spiRead()

    expect(sectorData[0]).toBe(0xEB)
    expect(sectorData[1]).toBe(0x58)
    expect(sectorData[2]).toBe(0x90)
    expect(sectorData[510]).toBe(0x55)
    expect(sectorData[511]).toBe(0xAA)

    // CMD24: Write Sector 1 (0x58 00 00 00 01 FF)
    spiSend(0x58)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x00)
    spiSend(0x01)
    spiSend(0xFF)
    const r1_cmd24 = spiRead()
    expect(r1_cmd24).toBe(0x00)

    // Send start token 0xFE, 512 data bytes (fill with 0x77), 2 CRC bytes
    spiSend(0xFE)
    for (let i = 0; i < 512; i++) {
      spiSend(0x77)
    }
    spiSend(0xFF)
    spiSend(0xFF)

    const dataResp = spiRead()
    expect(dataResp).toBe(0x05) // Data accepted token

    // Verify backing buffer at sector 1 was updated
    expect(testImg[512]).toBe(0x77)
    expect(testImg[512 + 511]).toBe(0x77)

    sdcard_detach_image()
  })

  test("VERA SD Card - read real sd.img sectors (LBA 0 and LBA 0x0800)", () => {
    const sdImgPath = "C:/dev/a2vera/sd.img"
    if (!fs.existsSync(sdImgPath)) {
      return
    }
    const realImg = new Uint8Array(fs.readFileSync(sdImgPath))
    sdcard_attach_image(realImg, "sd.img")

    const spiSend = (val: number) => {
      memSet(0xC21E, val)
      vera_spi_step(4)
    }

    const spiRead = (): number => {
      memSet(0xC21E, 0xFF)
      vera_spi_step(4)
      return memGet(0xC21E, false)
    }

    // Select SD Card
    memSet(0xC21F, 0x01)

    // Init sequence: CMD0, CMD8, CMD55, ACMD41
    spiSend(0x40); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x95)
    expect(spiRead()).toBe(0x01)
    spiSend(0x48); spiSend(0x00); spiSend(0x00); spiSend(0x01); spiSend(0xAA); spiSend(0x87)
    for (let i = 0; i < 5; i++) spiRead()
    spiSend(0x77); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x01)
    spiRead()
    spiSend(0x69); spiSend(0x40); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x01)
    expect(spiRead()).toBe(0x00)

    // CMD17 read LBA 0: 0x51 00 00 00 00 FF
    spiSend(0x51); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0xFF)
    expect(spiRead()).toBe(0x00) // R1
    expect(spiRead()).toBe(0xFE) // start token

    const sec0 = new Uint8Array(512)
    for (let i = 0; i < 512; i++) {
      sec0[i] = spiRead()
    }
    spiRead(); spiRead() // CRC

    // Verify CMDR-DOS header
    expect(sec0[0]).toBe(0xEB)
    expect(sec0[1]).toBe(0x58)
    expect(sec0[2]).toBe(0x90)
    expect(String.fromCharCode(...sec0.subarray(3, 11))).toBe("CMDR-DOS")
    expect(sdcard_get_status().lba).toBe(0)

    // CMD17 read LBA 0x0800: 0x51 00 00 08 00 FF
    spiSend(0x51); spiSend(0x00); spiSend(0x00); spiSend(0x08); spiSend(0x00); spiSend(0xFF)
    expect(spiRead()).toBe(0x00)
    expect(spiRead()).toBe(0xFE)

    const sec800 = new Uint8Array(512)
    for (let i = 0; i < 512; i++) {
      sec800[i] = spiRead()
    }
    spiRead(); spiRead() // CRC

    expect(sec800[0]).toBe(0x6D)
    expect(sec800[1]).toBe(0xA3)
    expect(sec800[2]).toBe(0x6D)
    expect(sec800[3]).toBe(0xA3)
    expect(sdcard_get_status().lba).toBe(0x0800)

    sdcard_detach_image()
  })

  test("VERA SD Card - write protection and dirty status tracking (hasChanges, writeProtected, clearChanges)", () => {
    const testImg = new Uint8Array(1024 * 1024)
    sdcard_attach_image(testImg, "test.img")

    expect(sdcard_get_status().hasChanges).toBe(false)
    expect(sdcard_get_status().writeProtected).toBe(false)

    // Toggle write protection
    sdcard_set_write_protected(true)
    expect(sdcard_get_status().writeProtected).toBe(true)

    const spiSend = (val: number) => {
      memSet(0xC21E, val)
      vera_spi_step(4)
    }
    const spiRead = (): number => {
      memSet(0xC21E, 0xFF)
      vera_spi_step(4)
      return memGet(0xC21E, false)
    }

    // Select SD Card
    memSet(0xC21F, 0x01)

    // CMD0 + CMD8 + CMD55/ACMD41
    spiSend(0x40); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x95); spiRead()
    spiSend(0x48); spiSend(0x00); spiSend(0x00); spiSend(0x01); spiSend(0xAA); spiSend(0x87)
    for (let i = 0; i < 5; i++) spiRead()
    spiSend(0x77); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x01); spiRead()
    spiSend(0x69); spiSend(0x40); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x01); spiRead()

    // Attempt CMD24 write while write-protected: should be rejected
    spiSend(0x58); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x01)
    spiRead() // R1
    spiSend(0xFE) // start token
    for (let i = 0; i < 512; i++) spiSend(0x77)
    spiSend(0x00); spiSend(0x00) // CRC
    const rejectToken = spiRead() // data response
    expect(rejectToken).toBe(0x0D) // 0x0D: Data rejected due to write error / write protection

    // Sector 0 should NOT be modified because writeProtected is true
    expect(testImg[0]).toBe(0x00)
    expect(sdcard_get_status().hasChanges).toBe(false)

    // Remove write protection
    sdcard_set_write_protected(false)
    expect(sdcard_get_status().writeProtected).toBe(false)

    const seqBefore = sdcard_get_write_seq()

    // Perform CMD24 write
    spiSend(0x58); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x01)
    spiRead()
    spiSend(0xFE)
    for (let i = 0; i < 512; i++) spiSend(0x88)
    spiSend(0x00); spiSend(0x00)
    const acceptToken = spiRead()
    expect(acceptToken).toBe(0x05) // 0x05: Data accepted token

    // Sector 0 is modified and hasChanges is true
    expect(testImg[0]).toBe(0x88)
    expect(sdcard_get_status().hasChanges).toBe(true)
    expect(sdcard_get_write_seq()).toBeGreaterThan(seqBefore)

    // Clearing changes with an obsolete writeSeq does NOT clear changes
    sdcard_clear_changes(seqBefore)
    expect(sdcard_get_status().hasChanges).toBe(true)

    // Clearing changes with matching writeSeq clears changes
    sdcard_clear_changes(sdcard_get_write_seq())
    expect(sdcard_get_status().hasChanges).toBe(false)

    sdcard_detach_image()
  })

  test("VERA SD Card - CMD58 returns 5-byte R3 response (R1 + OCR[31:0]) before and after initialization", () => {
    const testImg = new Uint8Array(1024 * 1024)
    sdcard_attach_image(testImg, "test.img")

    const spiSend = (val: number) => {
      memSet(0xC21E, val)
      vera_spi_step(4)
    }
    const spiRead = (): number => {
      memSet(0xC21E, 0xFF)
      vera_spi_step(4)
      return memGet(0xC21E, false)
    }

    // Select SD Card
    memSet(0xC21F, 0x01)

    // CMD0 (GO_IDLE_STATE)
    spiSend(0x40); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x95)
    const r1_idle = spiRead()
    expect(r1_idle).toBe(0x01)

    // CMD58 (READ_OCR) before ACMD41: should return 01 C0 FF 80 00
    spiSend(0x7A); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x01)
    const r3_before = [spiRead(), spiRead(), spiRead(), spiRead(), spiRead()]
    expect(r3_before).toEqual([0x01, 0xC0, 0xFF, 0x80, 0x00])

    // CMD8
    spiSend(0x48); spiSend(0x00); spiSend(0x00); spiSend(0x01); spiSend(0xAA); spiSend(0x87)
    for (let i = 0; i < 5; i++) spiRead()

    // CMD55 + ACMD41 to initialize card
    spiSend(0x77); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x01); spiRead()
    spiSend(0x69); spiSend(0x40); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x01); spiRead()

    // CMD58 (READ_OCR) after ACMD41: should return 00 C0 FF 80 00
    spiSend(0x7A); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x01)
    const r3_after = [spiRead(), spiRead(), spiRead(), spiRead(), spiRead()]
    expect(r3_after).toEqual([0x00, 0xC0, 0xFF, 0x80, 0x00])

    sdcard_detach_image()
  })

  test("VERA SD Card - detaching or changing media resets SPI state", () => {
    const testImg1 = new Uint8Array(1024 * 1024)
    sdcard_attach_image(testImg1, "card1.img")

    const spiSend = (val: number) => {
      memSet(0xC21E, val)
      vera_spi_step(4)
    }
    const spiRead = (): number => {
      memSet(0xC21E, 0xFF)
      vera_spi_step(4)
      return memGet(0xC21E, false)
    }

    memSet(0xC21F, 0x01)

    // Send partial command bytes (simulate interrupted transfer)
    spiSend(0x40); spiSend(0x00); spiSend(0x00)

    // Detach card in the middle of transfer
    sdcard_detach_image()
    expect(sdcard_get_status().attached).toBe(false)

    // Attach second card
    const testImg2 = new Uint8Array(1024 * 1024)
    sdcard_attach_image(testImg2, "card2.img")
    expect(sdcard_get_status().attached).toBe(true)

    // SD Card should be cleanly reset and accept a fresh CMD0
    memSet(0xC21F, 0x01)
    spiSend(0x40); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x00); spiSend(0x95)
    expect(spiRead()).toBe(0x01)

    sdcard_detach_image()
  })
})

