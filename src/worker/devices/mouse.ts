// Mouse Driver for Apple2TS - Copyright 2023 Michael Morrison <codebythepound@gmail.com>
// Now combined Mouse/Clock driver

import { setSlotDriver, setSlotIOCallback, memGet, memSet, memSetC000, memGetC000 } from "../memory"
import { MouseEventSimple } from "../../common/utility"
import { interruptRequest } from "../cpu6502"
import { s6502 } from "../instructions"
import { passShowAppleMouse } from "../worker2main"
import { handleClockRead } from "./clock"
import { parseAssembly } from ".././utility/assembler"

//  To be recognized as a clock, need the following bytes:
//  offset 0x00  = 0x08
//  offset 0x02  = 0x28
//  offset 0x04  = 0x58
//  offset 0x06  = 0x70
//  offset Cx08 = clock read
//  offset Cx0B = clock write
//
//  To be recognized as a mouse need
//  offset 0x05 = 0x38  Pascal signature bytes
//  offset 0x07 = 0x18  "
//  offset 0x0B = 0x01  "
//  offset 0x0C = 0x20  X,Y pointing device
//  offset 0xFB = 0xD6  Additional byte for mice

const mouseDriver = `
Cx00	php	        ; BASIC entry (handled in JS)  This will only work for mouse
Cx01	sei         ; Clock bytes required as above.
Cx02	plp
Cx03	rts
Cx04	db $00      ; $58 = Clock, disabled because it breaks A2osX https://github.com/ct6502/apple2ts/issues/67
Cx05	db $38      ; Pascal ID Byte
Cx06	db $70      ; Clock
Cx07	db $18      ; Pascal ID Byte
Cx08	rts         ; Clock Read Method - handled by JS
Cx09	db $00
Cx0a	db $00
Cx0b	db $01      ; Pascal Generic Signature  / Clock Write (method & value ignored)
Cx0c	db $20      ; $2x = Pascal XY Pointing Device, ID=x0 apple mouse
Cx0d	rts         ; init pascal (for clock need an RTS here)  could move methods to offset 60
Cx0e	db <PASCAL  ; read
Cx0f	db <PASCAL  ; write
Cx10	db <PASCAL  ; status
Cx11	db $00      ; Pascal optional routines follow
;
Cx12    db <SETMOUSE          ; $39
Cx13    db <SERVEMOUSE        ; $47
Cx14    db <READMOUSE         ; $C7
Cx15    db <CLEARMOUSE        ; $D7
Cx16    db <POSMOUSE          ; $BB
Cx17    db <CLAMPMOUSE        ; $A3
Cx18    db <HOMEMOUSE         ; $DF
Cx19    db <INITMOUSE         ; $E6
Cx1a    db <GETCLAMP          ; $26
Cx1b    db <UNDOCUMENTED      ; $22 applemouse has methods here
Cx1c    db <TIMEDATA          ; $24
Cx1d    db <UNDOCUMENTED      ; $22 not sure if some will call them 
Cx1e    db <UNDOCUMENTED      ; $22
Cx1f    db <UNDOCUMENTED      ; $22
;
; All methods (except SERVEMOUSE) entered with X = Cn, Y = n0
; 
; The interrupt status byte is defined as follows:
; 
; Bit 7 6 5 4 3 2 1 0
;     | | | | | | | |
;     | | | | | | | +---  Previously, button 1 was up (0) or down (1)
;     | | | | | | +-----  Movement interrupt
;     | | | | | +-------  Button 0/1 interrupt
;     | | | | +---------  VBL interrupt
;     | | | +-----------  Currently, button 1 is up (0) or down (1)
;     | | +-------------  X/Y moved since last READMOUSE
;     | +---------------  Previously, button 0 was up (0) or down (1)
;     +-----------------  Currently, button 0 is up (0) or down (1)
; 
; (Button 1 is not physically present on the mouse, and is probably only
; supported for an ADB mouse on the IIgs.)
; 
; The mode byte is defined as follows.
; 
; Bit 7 6 5 4 3 2 1 0
;     | | | | | | | |
;     | | | | | | | +---  Mouse off (0) or on (1)
;     | | | | | | +-----  Interrupt if mouse is moved
;     | | | | | +-------  Interrupt if button is pressed
;     | | | | +---------  Interrupt on VBL
;     | | | +-----------  Reserved
;     | | +-------------  Reserved
;     | +---------------  Reserved
;     +-----------------  Reserved
; 

SLOWX   EQU $0478-$c0 ; + Cs        Low byte of absolute X position
SLOWY   EQU $04F8-$c0 ; + Cs        Low byte of absolute Y position
SHIGHX  EQU $0578-$c0 ; + Cs        High byte of absolute X position
SHIGHY  EQU $05F8-$c0 ; + Cs        High byte of absolute Y position
STEMPA  EQU $0678-$c0 ; + Cs        Reserved and used by the firmware
STEMPB  EQU $06F8-$c0 ; + Cs        Reserved and used by the firmware
SBUTTON EQU $0778-$c0 ; + Cs        Button 0/1 interrupt status byte
SMODE   EQU $07F8-$c0 ; + Cs        Mode byte

LOWX   EQU $C081 ; + $s0        Low byte of absolute X position
HIGHX  EQU $C082 ; + $s0        High byte of absolute X position
LOWY   EQU $C083 ; + $s0        Low byte of absolute Y position
HIGHY  EQU $C084 ; + $s0        High byte of absolute Y position
BUTTON EQU $C085 ; + $s0        Button 0/1 interrupt status byte
MODE   EQU $C086 ; + $s0        Mode byte
CLAMP  EQU $C087 ; + $s0        Clamp value

CMD    EQU $C08A ; + $s0         Command reg
INIT   EQU $0    ;               initialize
READ   EQU $1    ;               read mouse and update regs, clear ints
CLEAR  EQU $2    ;               clear mouse and update regs, clear ints
GCLAMP EQU $3    ;               get mouse clamping
SERVE  EQU $4    ;               check/serve mouse int
HOME   EQU $5    ;               set to clamping window upper left
CLAMPX EQU $6    ;               clamp x values to x -> y
CLAMPY EQU $7    ;               clamp y values to x -> y
POS    EQU $8    ;               set positions
UNDOC  EQU $9    ;               calling an undocumented entry

PASCAL
    ldx #$03        ; return error for pascal

UNDOCUMENTED        ; $Cn22
    sec
    rts
                    ; Technote #2
TIMEDATA            ; $Cn24, A bit 0: 1 - 50hz, 0 = 60hz VBL
    clc
    rts
                    ; Technote #7
                    ; Return 8 clamping bytes one at a time to $578
GETCLAMP            ; $Cn26
    lda $478        ; index byte, starting at $4E according to technote
    sta CLAMP,y     ; indicates which byte in the order we want
    lda #GCLAMP
    sta CMD,y
    lda CLAMP,y
    sta $578
    clc             ; In this order: minXH, minYH, minXL, minYL
    rts             ;                maxXH, maxYH, maxXL, maxYL

SETMOUSE            ; $C039
    cmp #$10
    bcs return      ; invalid
    sta MODE,y      ; set mode
    lda MODE,y      ; reread to ensure valid
    sta SMODE,x
return 
    rts

SERVEMOUSE          ; $Cn47
    ldy $06
    lda #$60
    sta $06
    jsr $0006       ; start by finding our slot - not entered with X,Y set
    sty $06
    tsx
    lda $100,x
    tax             ; X = Cs
    asl
    asl
    asl
    asl
    tay             ; Y = s0

    lda #SERVE
    sta CMD,y

    lda BUTTON,y 
    and #$0e
    sec
    beq return      ; exit without changing anything

    ora SBUTTON,x
    sta SBUTTON,x
    clc             ; claim it
    rts

copyin 
    lda SLOWX,x
    sta LOWX,y
    lda SLOWY,x
    sta LOWY,y
    lda SHIGHX,x
    sta HIGHX,y
    lda SHIGHY,x
    sta HIGHY,y
    rts

copyout 
    lda LOWX,y
    sta SLOWX,x
    lda LOWY,y
    sta SLOWY,x
    lda HIGHX,y
    sta SHIGHX,x
    lda HIGHY,y
    sta SHIGHY,x
    rts

CLAMPMOUSE          ; $CnA3
    and #$1
    sta STEMPA,x
    phx
    phx
    ldx #$c0        ; note load from screen hole 0, not slot

    lda <cmcont-1
    pha
    bra copyin

cmcont 
    plx
    lda #CLAMPX     ; A = 1 for Y
    ora STEMPA,x
    sta CMD,y
    rts

POSMOUSE            ; $CnBB
    phx
    lda <pmcont-1
    pha
    bra copyin

pmcont 
    lda #POS
    sta CMD,y
    rts

READMOUSE           ; $CnC7
    lda #READ
    sta CMD,y

    lda BUTTON,y
    and #$F1        ; mask off interrupts
    sta SBUTTON,x
    clc
    bra copyout

CLEARMOUSE          ; $CnD7
    lda #CLEAR
    sta CMD,y
    clc
    bra copyout

HOMEMOUSE           ; $CnDF
    lda #HOME
    sta CMD,y
    clc
    rts

INITMOUSE           ; $CnE6
    lda #INIT
    sta CMD,y
    lda MODE,y
    sta SMODE,x
    bra READMOUSE   ; Ends at $CnF2

    ; should leave about 13 bytes
`

// We will store our state in the peripheral card I/O locations.
// That way we can save/restore the mouse state successfully.
let ADDR_MODE    = 0xC086    // + s0       Mode byte
let ADDR_CLAMPX1 = 0xC089    // + s0
let ADDR_CLAMPX2 = 0xC08B    // + s0
let ADDR_CLAMPX3 = 0xC08C    // + s0
let ADDR_CLAMPY1 = 0xC08D    // + s0
let ADDR_CLAMPY2 = 0xC08E    // + s0
let ADDR_CLAMPY3 = 0xC08F    // + s0

// See comments in the firmware code for the bit values for
// the interrupt status byte and mode byte.
enum MODE {
  MOUSE_OFF  = 0, // Mouse off
  MOUSE_ON   = 1, // Mouse on
  IRQ_MOVED  = 2, // Interrupt if mouse is moved
  IRQ_BUTTON = 4, // Interrupt if button is pressed
  IRQ_VBL    = 8, // Interrupt on VBL
}

enum IRQ_STATUS {
  BUTTON1_PREV = 0x01,    // Previously, button 1 was up (0) or down (1)
  MOVED_IRQ    = 0x02,    // Movement interrupt
  BUTTON_IRQ   = 0x04,    // Button 0/1 interrupt
  VBL_IRQ      = 0x08,    // VBL interrupt
  BUTTON1_CURR = 0x10,    // Currently, button 1 is up (0) or down (1)
  MOVED_CURR   = 0x20,    // X/Y moved since last READMOUSE
  BUTTON0_PREV = 0x40,    // Previously, button 0 was up (0) or down (1)
  BUTTON0_CURR = 0x80     // Currently, button 0 is up (0) or down (1)
}

// We don't have enough room in the peripheral card I/O locations
// to store 8 bytes of X/Y clamping values (min low/high, max low/high).
// So instead, since the clamping limit is 0-1023 (10 bits), we will
// store the X clamping values in 3 bytes, with the upper 2 bits of the
// min value stored in the high nibble of the second byte, and the upper
// 2 bits of the max value stored in the low nibble of the second byte.
// Same thing for the Y clamping values.
const setClampValuesToAddr = (min: number, max: number,
  addr1: number, addr2: number, addr3: number) => {

  // Split min into two 8-bit values
  const minLow = min & 0xFF // Lower 8 bits
  const minHigh = (min >> 8) & 0x03 // Upper 2 bits

  // Split max into two 8-bit values
  const maxLow = max & 0xFF // Lower 8 bits
  const maxHigh = (max >> 8) & 0x03 // Upper 2 bits

  memSetC000(addr1, minLow)
  memSetC000(addr2, (minHigh << 4) | maxHigh)
  memSetC000(addr3, maxLow)
}

const getClampValuesFromAddr = (addr1: number, addr2: number, addr3: number) => {
  const minLow = memGetC000(addr1)
  const mixed = memGetC000(addr2)
  const maxLow = memGetC000(addr3)
  const minHigh = (mixed >> 4) & 0x03
  const maxHigh = mixed & 0x03
  return [minLow | (minHigh << 8), maxLow | (maxHigh << 8)]
}

const getClampX = () => {
  return getClampValuesFromAddr(ADDR_CLAMPX1, ADDR_CLAMPX2, ADDR_CLAMPX3)
}

const getClampY = () => {
  return getClampValuesFromAddr(ADDR_CLAMPY1, ADDR_CLAMPY2, ADDR_CLAMPY3)
}

const setClampX = (min: number, max: number) => {
  setClampValuesToAddr(min, max, ADDR_CLAMPX1, ADDR_CLAMPX2, ADDR_CLAMPX3)
}

const setClampY = (min: number, max: number) => {
  setClampValuesToAddr(min, max, ADDR_CLAMPY1, ADDR_CLAMPY2, ADDR_CLAMPY3)
}

const setMode = (value: number) => {
  memSetC000(ADDR_MODE, value)
  // console.log('Mouse mode set to', memGetC000(ADDR_MODE))
  // If Apple mouse is turned on, hide the browser mouse cursor
  passShowAppleMouse(value ? true  : false)
}

export const resetMouse = () => {
  mousex = 0
  mousey = 0
  setClampX(0, 1023)
  setClampY(0, 1023)
  setMode(MODE.MOUSE_OFF)
  bstatus = 0x00
  istatus = 0x00
  lastbstatus = 0x00
  lastmousex = 0
  lastmousey = 0
  tmpmousex = 0
  tmpmousey = 0
  servestatus = 0
  clampidx = 0
}

// Technically these should probably be saved in the save/restore state,
// perhaps in the peripheral card I/O locations, but everything seems to
// work fine if these are reset on a restore state.
let mousex = 0
let mousey = 0
let clampidx = 0
let bstatus = 0x00
let istatus = 0x00
let lastbstatus = 0x00
let lastmousex = 0
let lastmousey = 0
let tmpmousex = 0
let tmpmousey = 0
let servestatus = 0
let command = 0

let slot = 5
const CSWL = 0x36 // Character output SWitch
const CSWH = 0x37
const KSWL = 0x38 // Keyboard input SWitch
const KSWH = 0x39

const slotROM = () => {
  const driver = new Uint8Array(256).fill(0)
  const pcode = parseAssembly(0x0, mouseDriver.split("\n"))
  driver.set(pcode, 0)
  // d6 at FB is required for a mouse driver
  driver[0xFB] = 0xD6
  // I think this is a ROM version value, or a marker for first page of ROM
  driver[0xFF] = 0x01
  return driver
}

export const enableMouseCard = (enable = true, aslot = 5) => {
  if (!enable)
    return

  slot = aslot

  //console.log('AppleMouse compatible in slot', slot)
  const basicAddr = 0xC000 + slot * 0x100
  const clockReadAddr = 0xC000 + slot * 0x100 + 0x08
  setSlotDriver(slot, slotROM(), basicAddr, handleBasic)
  setSlotDriver(slot, slotROM(), clockReadAddr, handleClockRead)
  setSlotIOCallback(slot, handleAppleMouse)

  ADDR_MODE = 0xC080 + (ADDR_MODE & 0x0F) + slot * 0x10
  ADDR_CLAMPX1 = 0xC080 + (ADDR_CLAMPX1 & 0x0F) + slot * 0x10
  ADDR_CLAMPX2 = 0xC080 + (ADDR_CLAMPX2 & 0x0F) + slot * 0x10
  ADDR_CLAMPX3 = 0xC080 + (ADDR_CLAMPX3 & 0x0F) + slot * 0x10
  ADDR_CLAMPY1 = 0xC080 + (ADDR_CLAMPY1 & 0x0F) + slot * 0x10
  ADDR_CLAMPY2 = 0xC080 + (ADDR_CLAMPY2 & 0x0F) + slot * 0x10
  ADDR_CLAMPY3 = 0xC080 + (ADDR_CLAMPY3 & 0x0F) + slot * 0x10

  const [clampxmin, clampxmax] = getClampX()
  if (clampxmin === 0 && clampxmax === 0) {
    setClampX(0, 1023)
    setClampY(0, 1023)
  }
  const mode = memGetC000(ADDR_MODE)
  if (mode !== 0) {
    passShowAppleMouse(true)
  }
}

export const onMouseVBL = () => {
  // make sure previous int was ACK'd
  if (servestatus)
  {
    //console.log('int missed servestatus 0x'+servestatus.toString(16))
    //return
  }

  // Bit 3 2 1 0
  //     | | | |
  //     | | | +---  Mouse off (0) or on (1)
  //     | | +-----  Interrupt if mouse is moved
  //     | +-------  Interrupt if button is pressed
  //     +---------  Interrupt on VBL
  const mode = memGetC000(ADDR_MODE)

  if (mode & MODE.MOUSE_ON)
  {
    let doint = false

    // mark vbl if enabled
    if (mode & MODE.IRQ_VBL)
    {
      servestatus |= MODE.IRQ_VBL
      doint = true
    }

    // mark button int if enabled
    if (mode & istatus & MODE.IRQ_BUTTON)
    {
      servestatus |= MODE.IRQ_BUTTON
      doint = true
    }

    // mark movement int if enabled
    if (mode & istatus & MODE.IRQ_MOVED)
    {
      servestatus |= MODE.IRQ_MOVED
      doint = true
    }

    if (doint)
    {
      //console.log('INT 0x'+servestatus.toString(16))
      interruptRequest(slot, true)
    }
  }
}

// Receives system mouse event messages from the UI thread
// and converts them to Apple II mouse card values.
export const MouseCardEvent = (event: MouseEventSimple) => {

  const mode = memGetC000(ADDR_MODE)

  if (mode & MODE.MOUSE_ON)
  {
    if (event.buttons >= 0)
    {
      // See comments in the firmware code for the bit values for
      // the interrupt status byte and mode byte.
      switch (event.buttons)
      {
        case 0x00:  // button 0 up
          bstatus &= ~IRQ_STATUS.BUTTON0_CURR
          break
        case 0x10:  // button 0 down
          bstatus |= IRQ_STATUS.BUTTON0_CURR
          break
        case 0x01:  // button 1 up
          bstatus &= ~IRQ_STATUS.BUTTON1_CURR
          break
        case 0x11:  // button 1 down
          bstatus |= IRQ_STATUS.BUTTON1_CURR
          break
      }
      // mark button int, only on btn down
      istatus |= (bstatus & IRQ_STATUS.BUTTON0_CURR) ? MODE.IRQ_BUTTON : 0x00
    }
    else {
      if (event.x >= 0 && event.x <= 1.0)
      {
        const [clampxmin, clampxmax] = getClampX()
        mousex = Math.round((clampxmax - clampxmin) * event.x + clampxmin)
        // mark movement int
        istatus |= MODE.IRQ_MOVED
      }
      if (event.y >= 0 && event.y <= 1.0)
      {
        const [clampymin, clampymax] = getClampY()
        mousey = Math.round((clampymax - clampymin) * event.y + clampymin)
        // mark movement int
        istatus |= MODE.IRQ_MOVED
      }
    }
    //console.log("XYB: ", mousex, " ", mousey, " ", bstatus.toString(16))
  }
}

let basicPos = 0
let basicString = ""
let CSWHSave = 0
let CSWLSave = 0

// entry: X: (anything)  Y: (anything)  A: (char.out) if CSW
// exit : X: (unchanged) Y: (unchanged) A: (char.in)  if KSW
const handleBasic = () => {
  const SLH = 0xC0 + slot

  if (memGet(CSWH) === SLH && memGet(CSWL) === 0x00) {
    // if CSW hook is set (or both are set), it was from PR#N, and is output
    basicWrite()
  } else if (memGet(KSWH) === SLH && memGet(KSWL) === 0x00) {
    // if KSW hook is set, it was from IN#N, and wants input
    basicRead()
  }
}

const basicRead = () => {
  if (basicPos === 0) {
    // Hack to avoid echo.  Not sure if this is how they do it on the real
    // mouse card or not.  This sets the CSW to point to a RTS in our ROM
    // which will just drop the incoming characters until the end of the 
    // string when we restore it.
    const SLH = 0xC0 + slot
    CSWHSave = memGet(CSWH)
    CSWLSave = memGet(CSWL)
    memSet(CSWH, SLH) 
    memSet(CSWL, 0x03)
    const changed = (bstatus & IRQ_STATUS.BUTTON0_CURR) !== (lastbstatus & IRQ_STATUS.BUTTON0_CURR)
    let button = 0
    if (bstatus & IRQ_STATUS.BUTTON0_CURR) {
      button = changed ? 2 : 1
    } else {
      button = changed ? 3 : 4
    }
    // if keyboard was hit, mouse button value should be negative
    const kb = memGet(0xC000)
    if (kb & 0x80) {
      button = -button
    }
    lastbstatus = bstatus
    basicString = mousex.toString() + "," + mousey.toString() + "," + button.toString()
    //console.log("Mouse String: " + basicString)
  }

  if (basicPos >= basicString.length) {
    s6502.Accum = 0x8D
    basicPos = 0
    memSet(CSWH, CSWHSave) 
    memSet(CSWL, CSWLSave)
  } else {
    s6502.Accum = basicString.charCodeAt(basicPos) | 0x80
    basicPos++
  }
}

const basicWrite = () => {
  const byteOut = s6502.Accum
  //console.log("basic.write: " + byteOut.toString(16))

  switch (byteOut) {
    case 0x80:
      console.log("mouse off")
      // turn off mouse
      setMode(MODE.MOUSE_OFF)
      break
    case 0x81:
      console.log("mouse on")
      // turn on mouse
      setMode(MODE.MOUSE_ON)
      break
    default:
      break
  }
}

const handleAppleMouse: AddressCallback = (addr:number, value: number): number => {

  // We don't care about memgets to our card firmware, only to our card I/O
  if (addr >= 0xC100) return -1

  const isRead = value < 0

  const REG = {
      CLOCK:    0x00,
      LOWX:     0x01,
      HIGHX:    0x02,
      LOWY:     0x03,
      HIGHY:    0x04,
      STATUS:   0x05,
      MODE:     0x06,
      CLAMP:    0x07,
      CLOCKMAGIC: 0x08,
      COMMAND:  0x0A,
  }

  const CMD = {
    INIT:   0,    //               initialize
    READ:   1,    //               read mouse and update regs, clear ints
    CLEAR:  2,    //               clear mouse and update regs, clear ints
    GCLAMP: 3,    //               get mouse clamping
    SERVE:  4,    //               check/serve mouse int
    HOME:   5,    //               set to clamping window upper left
    CLAMPX: 6,    //               clamp x values to x -> y
    CLAMPY: 7,    //               clamp y values to x -> y
    POS:    8,    //               set positions
  }

  switch (addr & 0x0F) {

    case REG.LOWX:
      if (isRead) {
        return mousex & 0xFF
      }
      tmpmousex = (tmpmousex & 0xFF00) | value
      tmpmousex &= 0xFFFF
      break

    case REG.HIGHX:
      if (isRead) {
        return (mousex >> 8) & 0xFF
      }
      tmpmousex = (((value << 8) | (tmpmousex & 0x00FF)))
      tmpmousex &= 0xFFFF
      break

    case REG.LOWY:
      if (isRead) {
        return mousey & 0xFF
      }
      tmpmousey = (tmpmousey & 0xFF00) | value
      tmpmousey &= 0xFFFF
      break

    case REG.HIGHY:
      if (isRead) {
        return (mousey >> 8) & 0xFF
      }
      tmpmousey = (((value << 8) | (tmpmousey & 0x00FF)))
      tmpmousey &= 0xFFFF
      break

    case REG.STATUS:
      return bstatus

    case REG.MODE:
      if (isRead) {
        return memGetC000(ADDR_MODE)
      }
      setMode(value)
      break

    case REG.CLAMP:
      if (isRead) {
        // returned In this order: minXH, minYH, minXL, minYL
        //                         maxXH, maxYH, maxXL, maxYL
        const [clampxmin, clampxmax] = getClampX()
        const [clampymin, clampymax] = getClampY()
        switch (clampidx)
        {
          case 0:
            return (clampxmin >> 8) & 0xFF
          case 1:
            return (clampymin >> 8) & 0xFF
          case 2:
            return clampxmin & 0xFF
          case 3:
            return clampymin & 0xFF
          case 4:
            return (clampxmax >> 8) & 0xFF
          case 5:
            return (clampymax >> 8) & 0xFF
          case 6:
            return clampxmax & 0xFF
          case 7:
            return clampymax & 0xFF
          default:
            console.log("AppleMouse: invalid clamp index: " + clampidx)
            return 0
        }
      }
      clampidx = 0x4E - value
      break
        
    case REG.CLOCK:
    case REG.CLOCKMAGIC:
      console.log("clock registers not implemented: C080, C088")
      return 0

    case REG.COMMAND:
      if (isRead) {
        return command
      }
      command = value
      switch (value)
      {
        case CMD.INIT:       // initialize
          console.log("cmd.init")
          mousex = 0
          mousey = 0
          lastmousex = 0
          lastmousey = 0
          setClampX(0, 1023)
          setClampY(0, 1023)
          bstatus = 0x00
          istatus = 0x00
          break
        case CMD.READ:       // read mouse and update regs, clear ints
          //console.log('cmd.read')
          // See comments in the firmware code for the bit values for
          // the interrupt status byte and mode byte.
          // clear ints & previous
          //let changed = (bstatus & IRQ_STATUS.BUTTON0_CURR) !== (lastbstatus & IRQ_STATUS.BUTTON0_CURR)
          istatus = 0x00
          bstatus &= ~0x6F
          bstatus |= (lastbstatus >> 1) & IRQ_STATUS.BUTTON0_PREV
          bstatus |= (lastbstatus >> 4) & IRQ_STATUS.BUTTON1_PREV
          lastbstatus = bstatus
          if (lastmousex !== mousex || lastmousey !== mousey)
          {
            bstatus |= IRQ_STATUS.MOVED_CURR
            lastmousex = mousex
            lastmousey = mousey
              //changed = true
          }
          //if (changed)
          //{
            //console.log("XYB: ", mousex, " ", mousey, " ", bstatus.toString(16))
          //}
          break
        case CMD.CLEAR:      // clear mouse and update regs, clear ints
          console.log("cmd.clear")
          mousex = 0
          mousey = 0
          lastmousex = 0
          lastmousey = 0
          break
        case CMD.SERVE:      // check/serve mouse int
          // set int flags
          //console.log('cmd.serve')
          bstatus &= ~(IRQ_STATUS.MOVED_IRQ | IRQ_STATUS.BUTTON_IRQ | IRQ_STATUS.VBL_IRQ)
          bstatus |= servestatus
          servestatus = 0x00
          // deassert
          interruptRequest(slot, false)
          break
        case CMD.HOME:       // set to clamping window upper left
          {
            const [clampxmin] = getClampX()
            const [clampymin] = getClampY()
            mousex = clampxmin
            mousey = clampymin
          }
          break
        case CMD.CLAMPX:     // clamp x values to x -> y
          {
            const clampxmin = (tmpmousex > 32767) ? tmpmousex - 65536 : tmpmousex
            const clampxmax = tmpmousey
            setClampX(clampxmin, clampxmax)
            console.log(clampxmin + " -> " + clampxmax)
          }
          break
        case CMD.CLAMPY:     // clamp y values to x -> y
          {
            const clampymin = (tmpmousex > 32767) ? tmpmousex - 65536 : tmpmousex
            const clampymax = tmpmousey
            setClampY(clampymin, clampymax)
            console.log(clampymin + " -> " + clampymax)
          }
          break
        case CMD.GCLAMP:     //
          console.log("cmd.getclamp")
          break
        case CMD.POS:        // set positions
          // console.log('cmd.pos')
          mousex = tmpmousex
          mousey = tmpmousey
          break
      }
      break

    default:
        console.log("AppleMouse unknown IO addr", addr.toString(16))
        break
  }

  return value
}
