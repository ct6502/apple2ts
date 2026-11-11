/**
 * iigs_adb.ts - Apple IIgs ADB (Apple Desktop Bus) emulation.
 *
 * The IIgs keyboard and mouse hang off the ADB, and the CPU talks to the ADB
 * micro-controller through four bytes of I/O:
 *   $C024 ADB Mouse Data   (X byte first, Y byte on the following read)
 *   $C025 ADB Modifiers    (shift/caps/option state + MOD_LATCH)
 *   $C026 ADB Data         (write = command register, read = the micro's report
 *                           byte first, then the response queue)
 *   $C027 ADB Status       (bit 5 = data register full; bits 6/4/2 are the
 *                           mouse / data / keyboard interrupt enables)
 *
 * The command byte written to $C026 is *not* a classic ADB bus transaction.
 * It is the IIgs ADB micro-controller command set, classified by bits 7-6:
 *   00xxxxxx  controller commands (abort, synch, read modes/config, ...)
 *   01xxxxxx  FDB commands (reset, transmit N bytes, enable/flush/disable SRQ)
 *   10xxxxxx  TRANSMIT 2 BYTES to an FDB device register (a "listen")
 *   11xxxxxx  POLL FDB DEVICE register (a "talk"); the two register bytes come
 *             back through the $C026 response queue
 *
 * Getting this wrong is why the Finder never saw a cursor: GS/OS reads the
 * mouse by polling FDB device 3 register 0, so it never even looks at $C024.
 *
 * Device model follows gssquared's src/devices/adb/{ADB_Micro,ADB_Mouse,
 * ADB_Keyboard}.hpp, which is the reference implementation.
 */
import { getCpuPc } from "./cpu_pc"
import { s6502 } from "./instructions"

// The classic ROM ADB micro-controller task address range (bank $FF). See
// AGENTS.md section 27: FF:C4D5 reads the status register, FF:C4D9/C4E6 read
// the mouse bytes. A ProDOS-8-era program such as Tass Times polls it
// continuously and draws its own cursor; GS/OS replaces the task and never
// touches it, which is exactly why the IIgs pointer overlay is only wanted
// there.
const ROM_ADB_TASK_PC_LO = 0xFFC4D0
const ROM_ADB_TASK_PC_HI = 0xFFC560
// ~2 frames of machine time: Tass polls every few cycles while it is running,
// so any idle gap under this threshold still counts as "the task is alive".

// $C027 status bits. gssquared's ADB_Micro `status` union and KEGS's
// ADB_C027_* (adb.c:46-53) agree byte for byte, and the ROM's own writes prove
// it here: ROM 01 writes $10 at FF:F9E0 (enable the *data* interrupt, which is
// how the desk manager is woken) and GS/OS writes $40 at $C47C (enable the
// mouse interrupt).
const STATUS_MOUSE_DATA = 0x80;          // bit 7: a mouse report is waiting
const STATUS_MOUSE_INTERRUPT = 0x40;     // bit 6: mouse interrupt enable
const STATUS_DATA_AVAILABLE = 0x20;      // bit 5: the data register holds a byte
const STATUS_DATA_INTERRUPT = 0x10;      // bit 4: data interrupt enable
const STATUS_KEYBOARD_DATA = 0x08;       // bit 3: key data available
const STATUS_KEYBOARD_INTERRUPT = 0x04;  // bit 2: keyboard interrupt enable
const STATUS_MOUSE_Y_NEXT = 0x02;        // bit 1: next $C024 read returns Y
// Bit 0 is the command-register-full flag. It is deliberately never set - see
// readStatus().
// The three interrupt enables are the only writable bits (gssquared
// write_status_register's readonly_flags = 0b10101011).
const STATUS_INTERRUPT_ENABLES = 0x54;   // bits 6, 4 and 2

// First byte of every $C026 response.
const RESPONSE_HEADER = 0x80;

// The data register's report byte, as the micro hands it out when the CPU reads
// $C026 after a data interrupt: bit 7 response/status, bit 6 abort, bit 5 the
// desk-manager key sequence, bit 4 buffer flush, bit 3 service request valid,
// bits 2-0 the response byte count minus one.
const DATA_REPORT_DESKTOP_MANAGER = 0x20;
// Bit 3 of the $C026 interrupt-time report: a valid ADB service request is
// pending.  The ROM's IRQ dispatcher (FF:BE5A in ROM 01) saves DATAREG, tests
// bit 3 with `AND #$08`, and calls IRQ_SRQ, which is how the ROM handles a
// keyboard that has disabled auto-polling (XRick's own ADB driver, Wolf3D).
// Without this report a queued keyboard byte is visible through $C027 bit 3
// but no interrupt ever asserts: the keyboard interrupt-enable bit 2 is not
// set in SRQ mode, so the request sits in the device register forever.
const DATA_REPORT_SERVICE_REQUEST = 0x08;

// $C025 modifiers. Layout from gssquared's adb_mod_key_t (ADB_Keyboard.hpp:6):
// bit0 shift, bit1 control, bit2 caps lock, bit3 auto-repeat, bit4 keypad, bit5
// the "modifiers updated" latch, bit6 closed (Closed Apple), bit7 open (Open
// Apple). The ADB keycode names are the opposite of the physical keys they stand
// for: ADB_COMMAND ($37) reports open (bit7) and ADB_OPTION ($3A) reports closed
// (bit6) in ADB_Micro.hpp:503-504, exactly as gssquared's `apple_modifier_scancode`
// chooses them (:503-504 in ADB_Keyboard.hpp). Only the bits an event byte drives
// are named here.
const MOD_SHIFT = 0x01;
const MOD_CONTROL = 0x02;
const MOD_CAPS = 0x04;
const MOD_LATCH = 0x20;
const MOD_CLOSED = 0x40;
const MOD_OPEN = 0x80;

// The ADB keycodes that are modifier keys, and the $C025 bit each reports. An
// event byte with bit 7 set releases the bit again.
const MODIFIER_KEY_BITS: Record<number, number> = {
  0x36: MOD_CONTROL,
  0x37: MOD_OPEN,
  0x38: MOD_SHIFT,
  0x39: MOD_CAPS,
  0x3a: MOD_CLOSED,
}

// True for a keycode that reports a modifier in $C025 rather than an Apple II
// ASCII key. Caps Lock also belongs here even though it does not hold a bit:
// gssquared ADB_Micro.hpp:505 makes it a toggle on key-up, and the legacy
// $C000 feeder (the real ADB keyboard buffer) never sees a modifier byte.
export const isAdbModifierKeycode = (keycode: number) =>
  MODIFIER_KEY_BITS[keycode & 0x7f] !== undefined

// Unmodified US keycode-to-ASCII table, transcribed from gssquared
// ADB_ASCII.hpp's adb_ascii_us[256]. The legacy $C000 latch on an IIgs carries
// what the ADB micro would have put in its keyboard buffer, so the worker must
// compute it from the ADB keycode and the live $C025 modifiers rather than
// trusting the host keyboard event's text: a browser reports Caps Lock and
// Shift in the text it delivers, but the guest observes the same physical key
// through this table. Letters are lowercase until Caps Lock or Shift changes
// them; ADB_DELETE (Backspace) is 0x7F, distinct from ADB_LEFT_ARROW (0x08).
const ADB_ASCII_US: Record<number, number> = {
  0x00: 0x61, 0x01: 0x73, 0x02: 0x64, 0x03: 0x66, 0x04: 0x68, 0x05: 0x67,
  0x06: 0x7a, 0x07: 0x78, 0x08: 0x63, 0x09: 0x76, 0x0a: 0x3c, 0x0b: 0x62,
  0x0c: 0x71, 0x0d: 0x77, 0x0e: 0x65, 0x0f: 0x72, 0x10: 0x79, 0x11: 0x74,
  0x12: 0x31, 0x13: 0x32, 0x14: 0x33, 0x15: 0x34, 0x16: 0x36, 0x17: 0x35,
  0x18: 0x3d, 0x19: 0x39, 0x1a: 0x37, 0x1b: 0x2d, 0x1c: 0x38, 0x1d: 0x30,
  0x1e: 0x5d, 0x1f: 0x6f, 0x20: 0x75, 0x21: 0x5b, 0x22: 0x69, 0x23: 0x70,
  0x24: 0x0d, 0x25: 0x6c, 0x26: 0x6a, 0x27: 0x27, 0x28: 0x6b, 0x29: 0x3b,
  0x2a: 0x5c, 0x2b: 0x2c, 0x2c: 0x2f, 0x2d: 0x6e, 0x2e: 0x6d, 0x2f: 0x2e,
  0x30: 0x09, 0x31: 0x20, 0x32: 0x60, 0x33: 0x7f, 0x34: 0x00, 0x35: 0x1b,
  0x36: 0x00, 0x37: 0x00, 0x38: 0x00, 0x39: 0x00, 0x3a: 0x00,
  0x3b: 0x08, 0x3c: 0x15, 0x3d: 0x0a, 0x3e: 0x0b, 0x3f: 0xff, 0x40: 0xff,
  0x41: 0x2e, 0x42: 0xff, 0x43: 0x2a, 0x44: 0xff, 0x45: 0x2b, 0x46: 0xff,
  0x47: 0xff, 0x48: 0xff, 0x49: 0xff, 0x4a: 0xff, 0x4b: 0x2f, 0x4c: 0x0d,
  0x4d: 0xff, 0x4e: 0x2d, 0x4f: 0xff, 0x50: 0xff, 0x51: 0x3d, 0x52: 0x30,
  0x53: 0x31, 0x54: 0x32, 0x55: 0x33, 0x56: 0x34, 0x57: 0x35, 0x58: 0x36,
  0x59: 0x37, 0x5a: 0x37, 0x5b: 0x38, 0x5c: 0x39,
}

const SHIFT_ASCII_US: Record<number, number> = {
  0x31: 0x21, 0x32: 0x40, 0x33: 0x23, 0x34: 0x24, 0x35: 0x25, 0x36: 0x5e,
  0x37: 0x26, 0x38: 0x2a, 0x39: 0x28, 0x30: 0x29, 0x2d: 0x5f, 0x3d: 0x2b,
  0x5b: 0x7b, 0x5d: 0x7d, 0x3b: 0x3a, 0x27: 0x22, 0x5c: 0x7c, 0x2c: 0x3c,
  0x2e: 0x3e, 0x2f: 0x3f, 0x60: 0x7e, 0x3c: 0x3e,
}

const adbKeycodeToAscii = (keycode: number, modifiers: number) => {
  let ascii = ADB_ASCII_US[keycode & 0x7f] ?? 0
  if ((modifiers & MOD_CONTROL) !== 0) {
    if (ascii >= 0x61 && ascii <= 0x7a) ascii = ascii - 0x61 + 1
    if ((modifiers & MOD_SHIFT) !== 0 && ascii === 0x32) ascii = 0x00
    if ((modifiers & MOD_SHIFT) !== 0 && ascii === 0x36) ascii = 0x1e
    return ascii
  }
  if ((modifiers & MOD_CAPS) !== 0 && ascii >= 0x61 && ascii <= 0x7a) {
    ascii -= 0x20
  }
  if ((modifiers & MOD_SHIFT) !== 0) {
    if (ascii >= 0x61 && ascii <= 0x7a) {
      ascii -= 0x20
    } else {
      ascii = SHIFT_ASCII_US[ascii] ?? ascii
    }
  }
  return ascii
}

const ADDR_KEYBOARD = 0x02;
const ADDR_MOUSE = 0x03;
// ADB micro-controller mode bits (set by $04, cleared by $05, set by $07 synch).
// KEGs's adb_set_new_mode() prints "Disabling keyboard/mouse" for both.
// gssquared calls bit 0's mask `keyboard_auto_poll_enabled` (ADB_Micro.hpp:25),
// but `process_event()` takes the SRQ branch when the bit is set
// (ADB_Micro.hpp:983), matching this name: the reference's mask name is a
// misnomer, as its own "auto-poll is disabled" comment says. XRick sets it.
export const ADB_MODE_KBD_AUTOPOLL_OFF = 0x01;
export const ADB_MODE_MOUSE_OFF = 0x02;

const ADB_VERSION = 0x06;               // GS/OS 6 reports version 6

// Debug event ring for ?adbtrace=1 (browser: window.__adbLog, jest: getAdbLog()).
// Records the UI events that reach the ADB, every report latch, and every byte
// the guest reads, so "the cursor froze / the click was lost" can be answered
// layer by layer without guessing which side dropped an event.
export interface AdbLogEntry {
  t: number
  kind: string    // "ui" (buttons event), "queue", "button", "latch", "byte", "poll", "consume"
  a?: number
  b?: number
  c?: number
  pc?: number
}
const adbLog: AdbLogEntry[] = []
let adbLogEnabled = false
export { adbLogEnabled }
export const setAdbLogEnabled = (enabled: boolean) => {
  // Idempotent: the ?adbtrace=1 poll re-asserts the flag every 500 ms and must
  // not wipe the ring it is about to read.
  if (adbLogEnabled === enabled) return
  adbLogEnabled = enabled
  adbLog.length = 0
}
export const getAdbLog = (): AdbLogEntry[] => adbLog.slice()
export const clearAdbLog = () => { adbLog.length = 0 }
const noteAdbLog = (kind: string, a?: number, b?: number, c?: number) => {
  if (!adbLogEnabled) return
  const pc = getCpuPc()
  // The GS/OS idle loop spins on $E100FF (pcs below) and would otherwise
  // flood the ring, evicting click-relevant entries.
  if (pc === 0xffbff3 || pc === 0xffc063 || pc === 0xffc068 || pc === 0x46e37 || pc === 0x46e3c) return
  if (adbLog.length >= 20000) adbLog.shift()
  adbLog.push({ t: Date.now(), kind, a, b, c, ...(pc >= 0 ? { pc } : {}) })
}
export { noteAdbLog }


// How many argument bytes follow a command byte in $C026. Mirrors
// ADB_Micro::write_cmd_register.
const argumentCount = (value: number): number => {
  switch (value & 0xc0) {
    case 0x00:
      switch (value) {
        case 0x04: return 1;              // set modes
        case 0x05: return 1;              // clear modes
        case 0x06: return 3;              // set configuration
        case 0x07: return 4;              // synch (modes + 3 config bytes)
        case 0x08: return 2;              // write uC memory
        case 0x09: return 2;              // read uC memory
        case 0x11: return 1;              // send FDB keycode
        default: return 0;
      }
    case 0x40:
      if (value === 0x48) return 2;       // receive bytes
      if ((value & 0xf8) === 0x48) return (value & 0x07) + 1;  // transmit N bytes
      return 0;
    case 0x80:
      return 2;                          // transmit 2 bytes to a device
    default:
      return 0;                          // poll FDB device
  }
}

export class IIGSADB {
  // $C026 response queue
  private response: number[] = [];

  // A micro-generated report waiting in the data register (KEGS's
  // g_adb_interrupt_byte, gssquared's `send_data_register` + `datareg`). It is
  // read out *before* any queued command response, because that is what the
  // interrupt byte is: the micro's own event, not an answer to a command.
  private reportByte: number | null = null;

  // Controller state
  private modes = 0;
  private configuration = new Uint8Array(3);
  private ucMemory = new Uint8Array(256);
  private errorByte = 0;

  // Devices. Each has 4 two-byte registers. Register 3 is the device status
  // word: byte 0 is the exceptional-event/address byte (0 unless changed by a
  // "transmit 2 bytes"), byte 1 carries the device address, the handler id and
  // the SRQ-enable flag. GS/OS identifies devices by reading this.
  private mouseAddr = ADDR_MOUSE;
  // Where the ADB micro-controller thinks the mouse is, set by the "set
  // configuration" command. KEGS keeps the same split (g_mouse_dev_addr vs
  // g_mouse_ctl_addr) and stops reporting the mouse when they diverge.
  private mouseCtlAddr = ADDR_MOUSE;
  private mouseRegs = new Uint8Array(8);
  private mouseHasData = false;

  private keyboardAddr = ADDR_KEYBOARD;
  // Register 0 holds the key latch. It reads back as $FF,$FF while empty, so
  // it must start out empty - zeros would look like a key press.
  private keyboardRegs = Uint8Array.from([0xff, 0xff, 0, 0, 0, 0, 0, ADDR_KEYBOARD | 0x20]);

  private initDeviceRegisters() {
    this.mouseRegs = new Uint8Array(8);
    this.mouseRegs[6] = 0x00;
    this.mouseRegs[7] = ADDR_MOUSE | 0x20;
    this.mouseHasData = false;
    this.keyboardRegs = Uint8Array.from([0xff, 0xff, 0, 0, 0, 0, 0, ADDR_KEYBOARD | 0x20]);
  }

  // $C024 mouse report staging
  private pendingX = 0;
  private pendingY = 0;
  // The two buttons live in *different* bytes of register 0 (gssquared
  // ADB_Mouse::update_button_down: byte 0 is button 1 / RIGHT, byte 1 is
  // button 0 / LEFT). Both default to 0x80 ("released"); 0x00 means pressed.
  // The IIgs ROM reads them apart - FF:9D31 "TYA / ROL A" takes the LEFT
  // button from the Y byte's bit 7 and FF:9D33 "TXA / BMI" takes the RIGHT
  // button from the X byte's bit 7 - so putting the same state in both bytes
  // makes one physical click look like two, which GS/OS reads as a double
  // click.
  private button0Down = 0x80;   // LEFT
  private button1Down = 0x80;   // RIGHT
  private buttonChanged = false;
  private reportInProgress = false;

  private modifiers = 0;
  private interruptEnables = 0;

  // Command register framing
  private cmd: number[] = [];
  private argumentsExpected = 0;

  // Cycle stamp of the last *polling* $C027 read made from inside the ROM ADB
  // task (see ROM_ADB_TASK_PC_*): a read with nothing to report.
  //
  // Reading $C027 from the task is not by itself evidence of anything. A guest
  // that draws its own pointer (Tass Times) sits in the task's loop asking
  // forever, while GS/OS only runs the task when a report was latched, so it
  // reads $C027 with data available and never polls. Stamping every read made
  // the UI pointer overlay flicker off for a few frames after each report.
  private romTaskPollCycle = -1e15;

  // True while the guest's classic ROM cursor/mouse machinery is polling.
  romAdbTaskActive(): boolean {
    return s6502.cycleCount - this.romTaskPollCycle < 100000;
  }

  // --- Status / data registers ---
  // The data register counts as full for a micro report as well as for a queued
  // command response - the ROM polls bit 5 before reading $C026 either way.
  private dataRegisterFull(): boolean {
    return this.reportByte !== null || this.response.length > 0;
  }

  readStatus(): number {
    let status = 0;
    if (this.dataRegisterFull()) status |= STATUS_DATA_AVAILABLE;
    if (this.hasKeyData()) status |= STATUS_KEYBOARD_DATA;
    if (this.hasMouseData()) status |= STATUS_MOUSE_DATA;
    if (this.reportInProgress) status |= STATUS_MOUSE_Y_NEXT;
    // Bit 0 is the real "command register full" flag, and it is never reported:
    // the ROM's boot-time command loop at FF:851E spins on it before writing the
    // next byte, so publishing the awaiting-arguments state there deadlocks the
    // self-test and the machine ends at 「Fatal system error-> 0911」. KEGS masks
    // it out of adb_read_c027 (ADB_C027_NEG_MASK) and gssquared never sets it.
    status |= this.interruptEnables;
    noteAdbLog("stat", status);
    const pc = getCpuPc();
    if (pc >= ROM_ADB_TASK_PC_LO && pc < ROM_ADB_TASK_PC_HI
      && (status & (STATUS_MOUSE_DATA | STATUS_MOUSE_Y_NEXT)) === 0) {
      this.romTaskPollCycle = s6502.cycleCount;
    }
    return status;
  }

  writeStatus(v: number) {
    noteAdbLog("wstat", v);
    this.interruptEnables = v & STATUS_INTERRUPT_ENABLES;
  }

  readData(): number {
    // A latched report is handed out first and cleared on the read (KEGS
    // adb_read_c026's ADB_IDLE branch, gssquared read_data_register's
    // send_data_register path).
    if (this.reportByte !== null) {
      const v = this.reportByte;
      this.reportByte = null;
      noteAdbLog("report", v);
      return v;
    }
    const v = this.response.length > 0 ? (this.response.shift() as number) : 0x00;
    noteAdbLog("data", v);
    return v;
  }

  // Queue a reply for the CPU to read out of $C026. Two different framings are
  // used and mixing them up hangs the ADB handshake in GS/OS:
  //   - controller commands (read modes, read layouts, ...) reply with the
  //     payload alone; the caller reads a count byte out of the payload and
  //     then that many data bytes.
  //   - an FDB "poll device" (talk) reply is prefixed by a header: bit 7 set
  //     means a response is present, bit 6 means the micro-controller reset,
  //     and bits 2-0 hold (byte count - 1).
  private postResponse(bytes: number[], withHeader = false) {
    if (withHeader) {
      this.response.push(RESPONSE_HEADER | (bytes.length > 0 ? bytes.length - 1 : 0));
    }
    for (const b of bytes) this.response.push(b);
  }

  // --- Command register ---
  // cmd[0] is the command byte, cmd[1..] are its arguments. A command is
  // complete once cmd.length - 1 === argumentsExpected.
  writeCommand(v: number) {
    noteAdbLog("cmd", v, this.cmd.length, this.argumentsExpected);
    if (this.cmd.length > 0 && this.cmd.length - 1 < this.argumentsExpected) {
      this.cmd.push(v);
      if (this.cmd.length - 1 === this.argumentsExpected) this.executeCommand();
      return;
    }
    this.cmd = [v];
    this.argumentsExpected = argumentCount(v);
    if (this.argumentsExpected === 0) this.executeCommand();
  }

  private executeCommand() {
    const value = this.cmd[0] as number;
    switch (value & 0xc0) {
      case 0x00: this.controllerCommand(value); break;
      case 0x40: this.fdbCommand(value); break;
      case 0x80: this.transmitTwoBytes(value); break;
      case 0xc0: this.pollFdbDevice(value); break;
    }
    this.cmd = [];
    this.argumentsExpected = 0;
  }

  // 00xxxxxx - commands addressed to the ADB micro-controller itself.
  private controllerCommand(value: number) {
    const a1 = this.cmd[1] ?? 0;
    switch (value) {
      case 0x01:                          // abort
      case 0x02:                          // reset the micro-controller
      case 0x03:                          // flush
        this.response = [];
        this.modes = 0;
        this.errorByte = 0;
        break;
      case 0x04:                          // set modes
        this.modes |= a1;
        break;
      case 0x05:                          // clear modes
        this.modes &= ~a1;
        break;
      case 0x06:                         // set configuration bytes
        this.setConfiguration(a1, this.cmd[2] ?? 0, this.cmd[3] ?? 0);
        break;
      case 0x07:                          // synch
        this.modes = a1;
        this.setConfiguration(this.cmd[2] ?? 0, this.cmd[3] ?? 0, this.cmd[4] ?? 0);
        break;
      case 0x08:                          // write micro-controller memory
        this.ucMemory[a1 & 0xff] = this.cmd[2] ?? 0;
        break;
      case 0x09:                          // read micro-controller memory
        this.postResponse([this.ucMemory[((this.cmd[2] ?? 0) << 8 | a1) & 0xff]]);
        break;
      case 0x0a:                          // read modes byte
        this.postResponse([this.modes]);
        break;
      case 0x0b:                          // read configuration bytes
        this.postResponse([this.configuration[0], this.configuration[1], this.configuration[2]]);
        break;
      case 0x0c:                          // read then clear the error byte
        this.postResponse([this.errorByte]);
        this.errorByte = 0;
        break;
      case 0x0d:                          // version
        this.postResponse([ADB_VERSION]);
        break;
      case 0x0e:                          // charsets available
        // The count is "how many are available", followed by that many indices.
        // GS/OS reads exactly count more bytes, so offering only index 0 keeps
        // the reply length in step with what it consumes.
        this.postResponse([1, 0]);
        break;
      case 0x0f:                          // layouts available
        this.postResponse([1, 0]);
        break;
      case 0x11:                          // send an FDB keycode: echo a key
        // A guest that has taken over the ADB keyboard hands the event back
        // through this command (XRick's SRQ completion routine does exactly
        // that).  It goes into the micro's own key latch, not the service
        // request report: only a real host event advertises the report, and
        // treating the echo as another event makes the driver re-inject its
        // own key forever.  gssquared ADB_Micro.hpp:603/608 does the same -
        // store_key_to_buffer() there never touches send_data_register.
        //
        // The latch carries the mapped Apple II ASCII with the key-present bit,
        // not the raw FDB keycode: gssquared maps `cmd[1]` through
        // map_key(lang, keycode, empty modifiers) before store_key_to_buffer()
        // and that helper sets `keycode | 0x80` (ADB_Micro.hpp:700). For K,
        // $28 maps to lowercase 'k' ($6B) and the latch is $EB. An unmapped
        // keycode becomes $80 (no ASCII, only "a key is present").
        {
          const keycode = a1 & 0x7f;
          const keypad = keycode >= 0x43 && keycode <= 0x5c ? 0x10 : 0
          this.keyboardRegs[0] = (adbKeycodeToAscii(keycode, 0) | 0x80) & 0xff;
          this.keyboardRegs[1] = keypad;
          break;
        }
    }
  }

  // The ADB "set configuration" command ($06, and $07 synch). The first
  // configuration byte tells the micro-controller where the mouse (high nibble)
  // and the keyboard (low nibble) now live on the ADB bus, which is how KEGS's
  // adb_set_config() detects that a device moved. A change is an error condition
  // there, but its adb_error() only logs, so nothing is set. The keyboard nibble
  // is deliberately not kept: apple2ts's keyboard has no autopoll path to gate
  // (keys are only ever delivered by the $11 "send keycode" command, which is
  // KEGS's non-autopoll shape), so KEGS's g_adb_mode & 0x01 check has nothing to
  // switch here and tracking it would be another field nothing reads.
  private setConfiguration(val0: number, val1: number, val2: number) {
    this.configuration[0] = val0;
    this.configuration[1] = val1;
    this.configuration[2] = val2;
    this.mouseCtlAddr = (val0 >> 4) & 0x0f;
  }

  // 01xxxxxx - commands addressed to the FDB (bus) controller.
  private fdbCommand(value: number) {
    if (value === 0x40) {
      // Reset the FDB: both devices go back to their power-on state.
      this.mouseAddr = ADDR_MOUSE;
      this.mouseCtlAddr = ADDR_MOUSE;
      this.keyboardAddr = ADDR_KEYBOARD;
      this.initDeviceRegisters();
    }
    // 0x48 receive bytes, 0x50s/0x60s/0x70s enable SRQ / flush / disable SRQ:
    // the emulator's devices answer synchronously, so there is nothing to do.
  }

  // 10xxxxxx - "transmit 2 bytes": a two byte FDB *listen* into a device
  // register. Only register 3 (address / handler) has any effect.
  private transmitTwoBytes(value: number) {
    const addr = value & 0x0f;
    const reg = (value >> 4) & 0x03;
    if (reg !== 3) return;
    if (addr === this.mouseAddr) {
      // Register 3 is written as <event byte><address|handler|SRQ byte>.
      this.mouseRegs[6] = this.cmd[1] ?? 0;
      this.mouseRegs[7] = this.cmd[2] ?? 0;
    } else if (addr === this.keyboardAddr) {
      this.keyboardRegs[6] = this.cmd[1] ?? 0;
      this.keyboardRegs[7] = this.cmd[2] ?? 0;
    }
  }

  // 11xxxxxx - "poll FDB device": an FDB *talk*. The two register bytes come
  // back through the $C026 response queue. This is how GS/OS reads the mouse.
  private pollFdbDevice(value: number) {
    const addr = value & 0x0f;
    const reg = (value >> 4) & 0x03;
    let lo = 0;
    let hi = 0;
    if (addr === this.mouseAddr) {
      if (this.mouseHasData) {
        // Same read-time button snapshot as $C024: register 0 carries the live
        // button state when the guest polls it. Only for register 0 - registers
        // 1-2 are other mouse registers, not the motion/button report.
        if (reg === 0 && !this.reportInProgress) {
          this.patchReportButton();
          noteAdbLog("poll", this.mouseRegs[0], this.mouseRegs[1], value);
        }
        lo = this.mouseRegs[reg * 2] ?? 0;
        hi = this.mouseRegs[reg * 2 + 1] ?? 0;
        if (reg === 0 && !this.reportInProgress) this.consumeReport();
      } else if (reg === 0) {
        noteAdbLog("poll", -1, -1, value);
      }
    } else if (addr === this.keyboardAddr) {
      lo = this.keyboardRegs[reg * 2] ?? 0;
      hi = this.keyboardRegs[reg * 2 + 1] ?? 0;
      if (reg === 0) {
        this.keyboardRegs[0] = 0xff;
        this.keyboardRegs[1] = 0xff;
      }
    }
    this.postResponse([lo, hi], true);
  }

  // --- Mouse ---
  // True while a report is waiting to be picked up, either through the device
  // register (how GS/OS reads the mouse) or through $C024. This is what drives
  // $C027 bit 7 and, when GS/OS has enabled it, the ADB interrupt.
  hasMouseData(): boolean {
    // KEGs's adb_read_c024() refuses the mouse and drops the interrupt when the
    // ADB mode says the mouse is off, or when the micro-controller's idea of
    // where the mouse is no longer matches its physical address.
    if ((this.modes & ADB_MODE_MOUSE_OFF) !== 0) return false
    if (this.mouseAddr !== this.mouseCtlAddr) return false
    return this.reportInProgress
      || this.mouseHasData
      || this.pendingX !== 0
      || this.pendingY !== 0
      || this.buttonChanged;
  }

  // True while the guest still owes us a read: either the latched device
  // register holds an unread report, or motion is queued behind it. The IIgs
  // closed-loop cursor sync (devices/mouse.ts iigsMouseStep) uses this as its
  // "wait for the guest before injecting the next step" condition, the same
  // role gssquared's `mouse_data_full` plays in keygloo_mouse_sync.hpp.
  mouseReportPending(): boolean {
    return this.mouseHasData
      || this.reportInProgress
      || this.pendingX !== 0
      || this.pendingY !== 0
  }

  // The report has to be in the device register too, because that is where
  // GS/OS reads it from.
  private latchMouseReport() {
    // Keep unread X/Y together; later motion stays pending until this pair is consumed.
    if (this.mouseHasData || this.reportInProgress) return
    const clamp = (v: number) => Math.max(-63, Math.min(63, v));
    const dx = clamp(this.pendingX);
    const dy = clamp(this.pendingY);
    // Only replace the register when there is something new to report, so an
    // unread report is not wiped out.
    if (dx === 0 && dy === 0 && !this.buttonChanged) return;
    this.pendingX -= dx;
    this.pendingY -= dy;    // Bits 6-0 are a *seven-bit two's complement* displacement, not a direction
    // bit plus a magnitude. gssquared encodes it as (delta & 0x3F) with bit 6
    // set for a negative delta (ADB_Mouse::encode_relative_motion), so -63 goes
    // out as $41 and -1 as $7F. The IIgs ROM's accumulator (FF:9D49-FF:9D9E)
    // pushes $FF as the sign byte on a negative report and then adds the 16-bit
    // pair to the cursor, which turns the field into (field - 128) - so it only
    // decodes correctly if the field is already a two's complement. Encoding
    // the absolute magnitude made every negative report arrive as
    // (magnitude - 64): a -63 move read as -1 and a -1 move as -63, so
    // leftward motion was essentially lost and the cursor only ever climbed.
    this.mouseRegs[0] = (dx & 0x3f) | (dx < 0 ? 0x40 : 0x00);
    this.mouseRegs[1] = (dy & 0x3f) | (dy < 0 ? 0x40 : 0x00);
    this.mouseHasData = true;
    this.buttonChanged = false;
    this.updateButtonDown();
    noteAdbLog("latch", dx, dy, this.mouseRegs[0]);
  }

  // The OS has just finished a report (both $C024 bytes, or a poll of device
  // register 0). Any motion left over beyond the +/-63 a single report can
  // carry is delivered as another report, otherwise the interrupt line would
  // stay asserted forever and the machine would do nothing but service IRQs.
  private consumeReport() {
    this.mouseHasData = false;
    this.reportInProgress = false;
    this.latchMouseReport();
  }

  // Read-back for tests/diagnostics: the live register 0 pair. Byte 0 carries
  // the RIGHT button in bit 7, byte 1 the LEFT button (gssquared layout).
  getMouseRegisters(): { x: number, y: number } {
    return { x: this.mouseRegs[0], y: this.mouseRegs[1] }
  }

  // $C024 returns one byte per read: the X byte first, then the Y byte on the
  // following read (the ROM at FF:C4D2 gates on $C027 bit 7 and uses $C027
  // bit 1 to know the second read is the Y byte). The format is the standard
  // ADB mouse register 0 layout:
  //   bit 7 = button 0 (1 = released)
  //   bits 6-0 = signed displacement, -63..+63, two's complement
  // so the displacement decodes as: (byte & 0x7F) with 0x40 subtracted when
  // that bit is set. -63 is $41, -1 is $7F, +63 is $3F.
  readMouseData(): number {
    // KEGs's adb_read_c024() returns 0 when the mouse is off, rather than
    // whatever happens to be latched.
    if (!this.hasMouseData()) {
      noteAdbLog("byte", -1);
      return 0
    }    // The report is already latched into the device register by queueMouse /
    // setMouseButton; reading $C024 just hands it out one byte at a time.
    if (this.reportInProgress) {
      // Grab the Y byte before queueing up the next report, which overwrites
      // the register. The button bits were snapshotted (into both bytes) when
      // the X byte was handed out, so Y matches X.
      const y = this.mouseRegs[1];
      this.consumeReport();
      noteAdbLog("byte", 1, y, this.pendingX);
      return y;
    }
    // First byte of a fresh report: snapshot the live button state now, so the
    // report the guest is about to read reflects any press that happened after
    // this motion was latched but before it was polled.
    this.patchReportButton();
    this.reportInProgress = true;
    noteAdbLog("byte", 0, this.mouseRegs[0], this.pendingX);
    return this.mouseRegs[0];
  }

  // The button state travels in bit 7 of *both* report bytes, and a report is
  // an atomic snapshot: the Y byte the guest reads after the X byte must show
  // the same button state as the X byte did. KEGS composes that snapshot at
  // $C024 read time from the live button state (g_emulated_buttons) instead of
  // at event time, and gssquared's ADB_Mouse::update_button_down patches the
  // waiting register's button bits on every event. Doing the same here means a
  // press that arrives while a motion report sits unread is still visible in
  // that report - previously it was deferred behind the leftover-motion chain
  // a long move leaves in pendingX/pendingY, so after "move then click" the
  // guest kept reading stale button-up reports and the click was lost.
  private patchReportButton() {
    this.updateButtonDown();
  }

  // gssquared ADB_Mouse::update_button_down, verbatim: the RIGHT button goes
  // in byte 0 and the LEFT button in byte 1, leaving the motion bits alone.
  private updateButtonDown() {
    this.mouseRegs[0] = this.button1Down | (this.mouseRegs[0] & 0x7f);
    this.mouseRegs[1] = this.button0Down | (this.mouseRegs[1] & 0x7f);
  }

  queueMouse(dx: number, dy: number) {
    noteAdbLog("queue", dx, dy);
    this.pendingX += dx;
    this.pendingY += dy;
    // Make the report visible to a poll of the device register straight away,
    // which is how GS/OS normally picks the mouse up.
    this.latchMouseReport();
  }

  // button: 0 = left (button 0), 1 = right (button 1).
  setMouseButton(button: 0 | 1, pressed: boolean) {
    noteAdbLog("button", button, pressed ? 1 : 0);
    const value = pressed ? 0x00 : 0x80;
    if (button === 0) {
      if (this.button0Down === value) return;
      this.button0Down = value;
    } else {
      if (this.button1Down === value) return;
      this.button1Down = value;
    }
    if (this.mouseHasData && !this.reportInProgress) {
      // A motion report is sitting unread in the register. gssquared lets the
      // latest event win: ADB_Mouse::process_event updates register 0 on every
      // button transition (update_button_down patches the button bits), so
      // patch the waiting report instead of queueing a second one behind it.
      // Deferring used to leave the press stuck behind the leftover-motion
      // reports of a long move, and a press that arrives after a motion but
      // before any poll must still be seen by the guest.
      this.patchReportButton();
      return;
    }
    if (this.reportInProgress) {
      // The guest is partway through $C024 (X byte out, Y byte to come) and the
      // report is frozen with its own button snapshot; this report may be
      // committed to the guest. consumeReport() latches the next one, so make
      // sure it happens even with no motion pending.
      this.buttonChanged = true;
      return;
    }
    // Nothing unread: make the change visible immediately as its own report.
    this.buttonChanged = true;
    this.latchMouseReport();
  }

  // --- Keyboard ---
  hasKeyData(): boolean {
    return this.keyboardRegs[0] !== 0xff || this.keyboardRegs[1] !== 0xff;
  }

  // A key event while the micro-controller has disabled keyboard auto-polling
  // has to be advertised as an ADB service request.  The XRick/Wolf3D driver
  // sends $04,$01 to setModes and relies on the keyboard's own SRQ path, never
  // on the ROM polling the keyboard device: gssquared's ADB_Micro::process_event
  // (line 983) sets service_request_valid/data_register_full/send_data_register.
  // The $C027 keyboard interrupt-enable bit (2) is not set in that mode, so
  // without this data-register report the queued key is visible through $C027
  // bit 3 (kb_register_full) but interruptPending() stays false and the guest
  // never receives it.  The report's bit 3 is exactly what the ROM's IRQ
  // dispatcher at FF:BE5A tests (`LDA DATAREG / AND #$08`) before calling IRQ_SRQ.
  private latchServiceRequest() {
    if ((this.modes & ADB_MODE_KBD_AUTOPOLL_OFF) === 0) return
    // Preserve a pending desk-manager report instead of dropping it: the ROM
    // handles both bits separately.  The byte count bits are 0 ("status byte,
    // no response bytes) as gssquared leaves response_bytes at zero here.
    this.reportByte = this.reportByte === DATA_REPORT_DESKTOP_MANAGER
      ? DATA_REPORT_DESKTOP_MANAGER | DATA_REPORT_SERVICE_REQUEST
      : DATA_REPORT_SERVICE_REQUEST;
  }

  // Queue one ADB keyboard event byte into register 0, with the live modifier
  // byte beside it. The event byte's bit 7 is the KEY-UP flag per the Apple IIgs
  // Hardware Reference and gssquared (ADB_Keyboard.hpp:477:
  // code = (up ? 0x80 : 0x00) | keycode) — the opposite of the Apple IIe
  // convention where bit 7 marks a key press. $C027's keyboard-data status bit
  // and the keyboard interrupt enable read hasKeyData(), so a queued byte
  // becomes visible to the ROM's ADB task and to programs that poll the ADB.
  //
  // A modifier keycode does more than report itself: it drives $C025. That byte
  // is the only place a key *chord* exists - an event byte carries one key and
  // has no modifier field - so while $C025 stays 0, Closed Apple + Escape is
  // indistinguishable from a bare Escape and no key equivalent (the DA drawer
  // among them) can ever fire.
  //
  // Returns true when the micro consumed the event for its own report, in which
  // case the caller must not drive the legacy keyboard latch either.
  //
  // The $11 "send FDB keycode" controller command is the guest's echo, not a
  // host event: it writes keyboardRegs directly (see the $11 case) and never
  // calls this, so only a host event advertises an ADB service request.
  queueKeyboard(eventByte: number): boolean {
    const keycode = eventByte & 0x7f
    if (keycode === 0x39) {
      // Caps Lock is a toggle, not a held bit: gssquared ADB_Micro.hpp:505
      // flips currmod.caps only on key-up. A browser delivers Caps Lock as a
      // key press and release, so consuming both events here and leaving the
      // legacy latch alone reproduces the real micro's report.
      if ((eventByte & 0x80) !== 0) {
        // The toggle is a modifier change with no key pressed, so bit 5 (the
        // modifiers-updated latch) accompanies both directions, not only the
        // caps-on edge; readModifiers() clears it on the guest's next read.
        this.modifiers = ((this.modifiers & MOD_CAPS) === 0
          ? this.modifiers | MOD_CAPS
          : this.modifiers & ~MOD_CAPS) | MOD_LATCH
      }
      // Caps Lock still has to reach an SRQ driver's completion routine: the
      // micro's keyboard register carries the event byte even though the
      // legacy $C000 feeder suppresses the modifier.  No legacy strobe is
      // driven here because that would clear the any-key-down line for the
      // key actually being held under a chord.
      this.keyboardRegs[0] = eventByte & 0xff
      this.keyboardRegs[1] = this.modifiers
      this.latchServiceRequest()
      return true
    }
    const bit = MODIFIER_KEY_BITS[keycode]
    if (bit !== undefined) {
      this.modifiers = eventByte & 0x80
        ? this.modifiers & ~bit
        : this.modifiers | bit | MOD_LATCH;
    }
    // Control + Open Apple + Escape is not a key the ROM can be told about
    // through the keyboard register: the ADB micro intercepts it and answers
    // with a data-register report (bit 5 = the desk-manager key sequence),
    // which is what wakes the ROM's Desk Accessories menu. gssquared
    // ADB_Micro.hpp:1026, KEGS adb.c:1687. The Escape is swallowed, not
    // buffered, so the menu does not immediately see it as a dismiss.
    if ((eventByte & 0x7f) === 0x35 && (eventByte & 0x80) === 0
      && (this.modifiers & (MOD_CONTROL | MOD_OPEN)) === (MOD_CONTROL | MOD_OPEN)) {
      this.reportByte = DATA_REPORT_DESKTOP_MANAGER;
      noteAdbLog("desk", this.modifiers);
      return true;
    }
    this.keyboardRegs[0] = eventByte & 0xff;
    this.keyboardRegs[1] = this.modifiers;
    this.latchServiceRequest();
    return false;
  }

  // Read-back for tests/diagnostics: the last queued ADB keyboard report.
  getKeyboardEvent(): [number, number] {
    return [this.keyboardRegs[0], this.keyboardRegs[1]];
  }

  // The ASCII byte the micro would store for this keycode with the live modifier
  // byte. The host keyboard event's text is intentionally not consulted: a real
  // ADB keyboard event carries only its keycode, and the same physical key must
  // stay byte-identical across hosts.
  asciiForKeycode(keycode: number): number {
    return adbKeycodeToAscii(keycode, this.modifiers)
  }

  readModifiers(): number {
    const m = this.modifiers;
    this.modifiers &= ~MOD_LATCH;
    return m;
  }

  peekModifiers(): number {
    return this.modifiers;
  }

  interruptPending(): boolean {
    return ((this.interruptEnables & STATUS_MOUSE_INTERRUPT) !== 0 && this.hasMouseData())
      || ((this.interruptEnables & STATUS_KEYBOARD_INTERRUPT) !== 0 && this.hasKeyData())
      || ((this.interruptEnables & STATUS_DATA_INTERRUPT) !== 0 && this.dataRegisterFull());
  }

  reset() {
    this.response = [];
    this.reportByte = null;
    this.modes = 0;
    this.configuration = new Uint8Array(3);
    this.ucMemory = new Uint8Array(256);
    this.errorByte = 0;
    this.mouseAddr = ADDR_MOUSE;
    this.mouseCtlAddr = ADDR_MOUSE;
    this.keyboardAddr = ADDR_KEYBOARD;
    this.initDeviceRegisters();
    this.pendingX = 0;
    this.pendingY = 0;
    this.button0Down = 0x80;
    this.button1Down = 0x80;
    this.buttonChanged = false;
    this.reportInProgress = false;
    this.modifiers = 0;
    this.interruptEnables = 0;
    this.cmd = [];
    this.argumentsExpected = 0;
  }
}

export const iigsADB = new IIGSADB();