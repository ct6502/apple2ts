import { doSetRom, getShr, memGet24, memSet24, memoryReset } from "./memory"

// $C036 bit 4 (SPEED_SHADOW_ALL). GS/OS brackets a block copy with
// $C035 = $57 / $C036 |= $10 (08:8A5F) so the destination bank's writes also
// land in the Mega II RAM the video scanner reads. Arkanoid (launched from
// MYCRATE) composes its playfield that way; without the bit the bricks and the
// erase blits never reached the screen, which kept a stale layer plus trails.
test("$C036 bit 4 mirrors banked writes into Mega II", () => {
  doSetRom("APPLE2GS")
  memoryReset()

  // Slot-5-style shadow state: SHR/AUXHGR inhibit clear, IOLC inhibit set;
  // $C029 = $C1 (SHR on, aux linear, bank latch). The registers are written
  // through bank $E0, as GS/OS does with long addressing: once IOLC is
  // inhibited, a bank-$00 store to $C0xx is plain RAM on this machine.
  memSet24(0x00C029, 0xc1)
  memSet24(0xe0c035, 0x57)
  memSet24(0xe0c036, 0x84)

  // Without the bit a bank-$09 store stays in fast RAM. (Bit 7 of $C029 is on,
  // so the byte in Mega II aux is the linearized one.)
  memSet24(0x092000, 0x77)
  expect(memGet24(0x092000)).toBe(0x77)
  expect(getShr()[0]).toBe(0)

  // With it, an odd bank addresses Mega II aux: $2000 maps to linear $2000.
  memSet24(0xe0c036, 0x94)
  memSet24(0x092000, 0x5a)
  expect(memGet24(0x092000)).toBe(0x5a)
  expect(getShr()[0]).toBe(0x5a)

  // An even bank addresses Mega II main for the HGR window.
  memSet24(0xe0c035, 0x00)
  memSet24(0x0a2000, 0x3c)
  expect(memGet24(0x0a2000)).toBe(0x3c)
  expect(memGet24(0xe02000)).toBe(0x3c)

  // Restoring $C036 stops the shadowing again.
  memSet24(0xe0c036, 0x84)
  memSet24(0x092001, 0x42)
  expect(memGet24(0x092001)).toBe(0x42)
  expect(getShr()[1]).toBe(0)
})
