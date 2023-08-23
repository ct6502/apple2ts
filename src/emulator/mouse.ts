// Mouse Driver for Apple2TS - Copyright 2023 Michael Morrison <codebythepound@gmail.com>

import { setSlotDriver, setSlotIODriver, memGet, memSet } from "./memory"
import { MouseEventSimple } from "./utility"
import { interruptRequest /*, doSetDebug*/ } from "./cpu6502"
import { s6502 } from "./instructions"

//  Custom ROM
const driver = new Uint8Array([
  0x60, 0x60, 0x60, 0x00, 0x00, 0x38, 0x00, 0x18, 0x00, 0x00, 0x00, 
  0x01, 0x20, 0x1d, 0x1d, 0x1d, 0x1d, 0x00, 0x28, 0x36, 0xb6, 0xc6, 
  0xaa, 0x92, 0xce, 0xd5, 0x23, 0x00, 0x21, 0xa2, 0x03, 0x38, 0x60, 
  0x18, 0x60, 0x9e, 0xb8, 0x04, 0x18, 0x60, 0xc9, 0x10, 0xb0, 0x09, 
  0x99, 0x85, 0xc0, 0xb9, 0x85, 0xc0, 0x9d, 0x38, 0x07, 0x60, 0xa4, 
  0x06, 0xa9, 0x60, 0x85, 0x06, 0x20, 0x06, 0x00, 0x84, 0x06, 0xba, 
  0xbd, 0x00, 0x01, 0xaa, 0x0a, 0x0a, 0x0a, 0x0a, 0xa8, 0xa9, 0x04, 
  0x99, 0x86, 0xc0, 0xb9, 0x84, 0xc0, 0x29, 0x0e, 0x38, 0xf0, 0xdd, 
  0x1d, 0xb8, 0x06, 0x9d, 0xb8, 0x06, 0x18, 0x60, 0xbd, 0xb8, 0x03, 
  0x99, 0x80, 0xc0, 0xbd, 0x38, 0x04, 0x99, 0x82, 0xc0, 0xbd, 0xb8, 
  0x04, 0x99, 0x81, 0xc0, 0xbd, 0x38, 0x05, 0x99, 0x83, 0xc0, 0x60, 
  0xb9, 0x80, 0xc0, 0x9d, 0xb8, 0x03, 0xb9, 0x82, 0xc0, 0x9d, 0x38, 
  0x04, 0xb9, 0x81, 0xc0, 0x9d, 0xb8, 0x04, 0xb9, 0x83, 0xc0, 0x9d, 
  0x38, 0x05, 0x60, 0x29, 0x01, 0x9d, 0xb8, 0x05, 0xda, 0xda, 0xa2, 
  0xc0, 0xa9, 0x9f, 0x48, 0x80, 0xc0, 0xfa, 0xa9, 0x06, 0x1d, 0xb8, 
  0x05, 0x99, 0x86, 0xc0, 0x60, 0xda, 0xa9, 0xaf, 0x48, 0x80, 0xb0, 
  0xa9, 0x08, 0x99, 0x86, 0xc0, 0x60, 0xa9, 0x01, 0x99, 0x86, 0xc0, 
  0xb9, 0x84, 0xc0, 0x29, 0xf1, 0x9d, 0xb8, 0x06, 0x18, 0x80, 0xb3, 
  0xa9, 0x02, 0x99, 0x86, 0xc0, 0x18, 0x80, 0xab, 0xa9, 0x05, 0x99, 
  0x86, 0xc0, 0x18, 0x60, 0xa9, 0x00, 0x99, 0x86, 0xc0, 0xb9, 0x85, 
  0xc0, 0x9d, 0x38, 0x07, 0x80, 0xd4, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 
  0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 
  0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 0xd6, 
  0xd6, 0xd6, 0xd6]);

const driverCode = `

Cx00:	   rts	; no support for basic
Cx01:	db $00
Cx02:	db $00
Cx03:	db $00
Cx04:	db $00
Cx05:	db $38
Cx06:	db $00
Cx07:	db $18
Cx08:	db $00
Cx09:	db $00
Cx0a:	db $00
Cx0b:	db $01
Cx0c:	db $20
Cx0d:	db >PASCAL
Cx0e:	db >PASCAL
Cx0f:	db >PASCAL
Cx10:	db >PASCAL
Cx11:	db $00

; jump table for internal routines
Cx12:	db >SETMOUSE
Cx13:	db >SERVEMOUSE
Cx14:	db >READMOUSE
Cx15:	db >CLEARMOUSE
Cx16:	db >POSMOUSE
Cx17:	db >CLAMPMOUSE
Cx18:	db >HOMEMOUSE
Cx19:	db >INITMOUSE
Cx1a:	db >GETCLAMP
Cx1b:	db 0
Cx1c:	db >TIMEDATA

;
; All methods (except SERVEMOUSE) entered with X = Cn, Y = n0
;
; $0478 + slot        Low byte of absolute X position
; $04F8 + slot        Low byte of absolute Y position
; $0578 + slot        High byte of absolute X position
; $05F8 + slot        High byte of absolute Y position
; $0678 + slot        Reserved and used by the firmware
; $06F8 + slot        Reserved and used by the firmware
; $0778 + slot        Button 0/1 interrupt status byte
; $07F8 + slot        Mode byte
; 
; The interrupt status byte is defined as follows:
; 
; Bit 7 6 5 4 3 2 1 0
;     | | | | | | | |
;     | | | | | | | \---  Previously, button 1 was up (0) or down (1)
;     | | | | | | \-----  Movement interrupt
;     | | | | | \-------  Button 0/1 interrupt
;     | | | | \---------  VBL interrupt
;     | | | \-----------  Currently, button 1 is up (0) or down (1)
;     | | \-------------  X/Y moved since last READMOUSE
;     | \---------------  Previously, button 0 was up (0) or down (1)
;     \-----------------  Currently, button 0 is up (0) or down (1)
; 
; (Button 1 is not physically present on the mouse, and is probably only
; supported for an ADB mouse on the IIgs.)
; 
; 
; The mode byte is defined as follows.
; 
; Bit 7 6 5 4 3 2 1 0
;     | | | | | | | |
;     | | | | | | | \---  Mouse off (0) or on (1)
;     | | | | | | \-----  Interrupt if mouse is moved
;     | | | | | \-------  Interrupt if button is pressed
;     | | | | \---------  Interrupt on VBL
;     | | | \-----------  Reserved
;     | | \-------------  Reserved
;     | \---------------  Reserved
;     \-----------------  Reserved
; 

SLOWX   EQU $0478-$c0 ; + Cs        Low byte of absolute X position
SLOWY   EQU $04F8-$c0 ; + Cs        Low byte of absolute Y position
SHIGHX  EQU $0578-$c0 ; + Cs        High byte of absolute X position
SHIGHY  EQU $05F8-$c0 ; + Cs        High byte of absolute Y position
STEMPA  EQU $0678-$c0 ; + Cs        Reserved and used by the firmware
STEMPB  EQU $06F8-$c0 ; + Cs        Reserved and used by the firmware
SBUTTON EQU $0778-$c0 ; + Cs        Button 0/1 interrupt status byte
SMODE   EQU $07F8-$c0 ; + Cs        Mode byte

LOWX   EQU $c080 ; + s0        Low byte of absolute X position
HIGHX  EQU $c081 ; + s0        High byte of absolute X position
LOWY   EQU $c082 ; + s0        Low byte of absolute Y position
HIGHY  EQU $c083 ; + s0        High byte of absolute Y position
BUTTON EQU $c084 ; + s0        Button 0/1 interrupt status byte
MODE   EQU $c085 ; + s0        Mode byte

CMD    EQU $c086 ; + slot        Command reg
INIT   EQU $0    ;               initialize
READ   EQU $1    ;               read mouse and update regs, clear ints
CLEAR  EQU $2    ;               clear mouse and update regs, clear ints
GETCLAMP EQU $3  ;               get mouse clamping
SERVE  EQU $4    ;               check/serve mouse int
HOME   EQU $5    ;               set to clamping window upper left
CLAMPX EQU $6    ;               clamp x values to x -> y
CLAMPY EQU $7    ;               clamp y values to x -> y
POS    EQU $8    ;               set positions

PASCAL:
    ldx #$03        ; return error for pascal
    sec
    rts
                    ; Technote #2
TIMEDATA:           ; A bit 0: 1 - 50hz, 0 = 60hz VBL
    clc
    rts
                    ; Technote #7
GETCLAMP:           ; Return 8 clamping bytes one at a time to $578
    stz SHIGHX,x
    clc             ; In this order: minXH, minYH, minXL, minYL
    rts             ;                maxXH, maxYH, maxXL, maxYL
                    ; NOTE: values at $478 and $4f8 are ignored

SETMOUSE:
    cmp #$10
    bcs return      ; invalid
    sta MODE,y      ; set mode
    lda MODE,y      ; reread to ensure valid
    sta SMODE,x
return:
    rts

SERVEMOUSE:
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
    beq return;     ; exit without changing anything

    ora SBUTTON,x
    sta SBUTTON,x
    clc             ; claim it
    rts

copyin:
    lda SLOWX,x
    sta LOWX,y
    lda SLOWY,x
    sta LOWY,y
    lda SHIGHX,x
    sta HIGHX,y
    lda SHIGHY,x
    sta HIGHY,y
    rts

copyout:
    lda LOWX,y
    sta SLOWX,x
    lda LOWY,y
    sta SLOWY,x
    lda HIGHX,y
    sta SHIGHX,x
    lda HIGHY,y
    sta SHIGHY,x
    rts

CLAMPMOUSE:
    and #$1
    sta STEMPA,x
    phx
    phx
    ldx #$c0      ; note load from screen hole 0, not slot

    lda #>cmcont-1
    pha
    bra copyin

cmcont:
    plx
    lda #CLAMPX  ; a = 1 for Y
    ora STEMPA,x
    sta CMD,y
    rts

POSMOUSE:
    phx
    lda #>pmcont-1
    pha
    bra copyin

pmcont:
    lda #POS
    sta CMD,y
    rts

READMOUSE:
    lda #READ
    sta CMD,y

    lda BUTTON,y
    and #$F1        ; mask off interrupts
    sta SBUTTON,x
    clc
    bra copyout

CLEARMOUSE:
    lda #CLEAR
    sta CMD,y
    clc
    bra copyout

HOMEMOUSE:
    lda #HOME
    sta CMD,y
    clc
    rts

INITMOUSE:
    lda #INIT
    sta CMD,y

    lda MODE,y
    sta SMODE,x
    bra READMOUSE

    ; should be at offset $fb
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
    db $d6
`

let mousex = 0;
let mousey = 0;
let clampxmin = 0;
let clampymin = 0;
let clampxmax = 0x3ff;
let clampymax = 0x3ff;
let mode = 0x00;
let bstatus = 0x00;
let istatus = 0x00;
let lastbstatus = 0x00;
let lastmousex = 0;
let lastmousey = 0;

let tmpmousex = 0;
let tmpmousey = 0;

let servestatus = 0;

let command = 0;

let slot = 5;
const basicEntry = 0x00
const CSWL = 0x36 // Character output SWitch
const CSWH = 0x37
const KSWL = 0x38 // Keyboard input SWitch
const KSWH = 0x39

export const enableMouseCard = (enable = true, aslot = 5) => {
  if (!enable)
    return

  slot = aslot

  //console.log('AppleMouse compatible in slot', slot);
  const basicAddr = 0xc000 + slot * 0x100;
  setSlotDriver(slot, driver, basicAddr + basicEntry,  handleBasic);
  setSlotIODriver(slot, handleMouse)

  mode = 0x00;
  bstatus = 0x00;
  istatus = 0x00;
  servestatus = 0x00;
}

// The interrupt status byte is defined as follows:
// 
// Bit 7 6 5 4 3 2 1 0
//     | | | | | | | |
//     | | | | | | | \---  Previously, button 1 was up (0) or down (1)
//     | | | | | | \-----  Movement interrupt
//     | | | | | \-------  Button 0/1 interrupt
//     | | | | \---------  VBL interrupt
//     | | | \-----------  Currently, button 1 is up (0) or down (1)
//     | | \-------------  X/Y moved since last READMOUSE
//     | \---------------  Previously, button 0 was up (0) or down (1)
//     \-----------------  Currently, button 0 is up (0) or down (1)
// 
// (Button 1 is not physically present on the mouse, and is probably only
// supported for an ADB mouse on the IIgs.)
// 
// 
// The mode byte is defined as follows.
// 
// Bit 7 6 5 4 3 2 1 0
//     | | | | | | | |
//     | | | | | | | \---  Mouse off (0) or on (1)
//     | | | | | | \-----  Interrupt if mouse is moved
//     | | | | | \-------  Interrupt if button is pressed
//     | | | | \---------  Interrupt on VBL
//     | | | \-----------  Reserved
//     | | \-------------  Reserved
//     | \---------------  Reserved
//     \-----------------  Reserved
// 

// LOWX   EQU $c080 ; + s0        Low byte of absolute X position
// HIGHX  EQU $c081 ; + s0        High byte of absolute X position
// LOWY   EQU $c082 ; + s0        Low byte of absolute Y position
// HIGHY  EQU $c083 ; + s0        High byte of absolute Y position
// BUTTON EQU $c084 ; + s0        Button 0/1 interrupt status byte
// MODE   EQU $c085 ; + s0        Mode // byte
// 
// CMD    EQU $c086 ; + slot        Command reg
// INIT   EQU $0    ;               initialize
// READ   EQU $1    ;               read mouse and update regs, clear ints
// CLEAR  EQU $2    ;               clear mouse and update regs, clear ints
// CLAMP  EQU $3    ;               set mouse clamping
// SERVE  EQU $4    ;               check/serve mouse int
// HOME   EQU $5    ;               set to clamping window upper left
// CLAMPX EQU $6    ;               clamp x values to x -> y
// CLAMPY EQU $7    ;               clamp y values to x -> y
// POS    EQU $8    ;               set positions

export const onMouseVBL = () => {
  // make sure previous int was ACK'd
  if(servestatus)
  {
    //console.log('int missed servestatus 0x'+servestatus.toString(16));
    //return
  }

  // Bit 3 2 1 0
  //     | | | |
  //     | | | \---  Mouse off (0) or on (1)
  //     | | \-----  Interrupt if mouse is moved
  //     | \-------  Interrupt if button is pressed
  //     \---------  Interrupt on VBL
  if( mode & 0x01 )
  {
    var doint = false;

    // mark vbl if enabled
    if(mode & 0x08)
    {
      servestatus |= 0x08;
      doint = true;
    }

    // mark button int if enabled
    if(mode & istatus & 0x04)
    {
      servestatus |= 0x04;
      doint = true;
    }

    // mark movement int if enabled
    if(mode & istatus & 0x02)
    {
      servestatus |= 0x02;
      doint = true;
    }

    if(doint)
    {
      //console.log('INT 0x'+servestatus.toString(16));
      interruptRequest(slot, true);
    }
  }
}

export const MouseCardEvent = (event: MouseEventSimple) => {

  if(mode & 0x01)
  {
    if(event.buttons>=0)
    {
      // Bit 7 6 5 4 3 2 1 0
      //     | | | | | | | |
      //     | | | | | | | \---  Previously, button 1 was up (0) or down (1)
      //     | | | | | | \-----  Movement interrupt
      //     | | | | | \-------  Button 0/1 interrupt
      //     | | | | \---------  VBL interrupt
      //     | | | \-----------  Currently, button 1 is up (0) or down (1)
      //     | | \-------------  X/Y moved since last READMOUSE
      //     | \---------------  Previously, button 0 was up (0) or down (1)
      //     \-----------------  Currently, button 0 is up (0) or down (1)
      // 
      //var obstatus = bstatus;
      switch(event.buttons)
      {
        case 0x00:  // button 0 up
          bstatus &= ~0x80;
          break;
        case 0x10:  // button 0 down
          bstatus |= 0x80;
          break;
        case 0x01:  // button 1 up
          bstatus &= ~0x10;
          break;
        case 0x11:  // button 1 down
          bstatus |= 0x10;
          break;
      }
      // mark button int, only on btn down
      istatus |= (bstatus&0x80) ? 0x04 : 0x00;
    }
    else {
      if(event.x>=0 && event.x<=1.0)
      {
        mousex = Math.round( (clampxmax-clampxmin) * event.x + clampxmin );
        // mark movement int
        istatus |= 0x02;
      }
      if(event.y>=0 && event.y<=1.0)
      {
        mousey = Math.round( (clampymax-clampymin) * event.y + clampymin );
        // mark movement int
        istatus |= 0x02;
      }
    }
    //console.log("XYB: ", mousex, " ", mousey, " ", bstatus.toString(16));
  }
}

let basicPos = 0
let basicString = ""

// entry: X: (anything)  Y: (anything)  A: (anything)
// exit : X: (unchanged) Y: (unchanged) A: (anything)
const handleBasic = () => {
  let SLH = 0xC0 + slot

  if (memGet(CSWH) === SLH && memGet(CSWL) === 0x00) {
    // if CSW hook is set (or both are set), it was from PR#N
    basicWrite()
  } else if (memGet(KSWH) === SLH && memGet(KSWL) === 0x00) {
    // if KSW hook is set, it was from IN#N
    basicRead()
  }
}

const basicRead = () => {
  if (basicPos === 0) {
    const changed = ((bstatus&0x80) !== (lastbstatus&0x80))?true:false;
    let button = 0
    if (bstatus&0x80) {
      button = changed ? 2 : 1
    } else {
      button = changed ? 3 : 4
    }
    lastbstatus = bstatus;
    basicString = mousex.toString() + "," + mousey.toString() + "," + button.toString()
    console.log("Mouse String: " + basicString)
  }
  //console.log("basic.read: " + basicPos)

  if (basicPos >= basicString.length) {
    s6502.Accum = 0x8D
    basicPos = 0
  }
  else {
    s6502.Accum = basicString.charCodeAt(basicPos) | 0x80
    basicPos++
  }
}

const basicWrite = () => {
  const byteOut = s6502.Accum
  console.log("basic.write: " + byteOut.toString(16))

  switch (byteOut) {
    case 0x80:
      console.log("mouse off")
      // turn off mouse
      mode = 0
      break;
    case 0x81:
      console.log("mouse on")
      // turn on mouse
      mode = 1
      break;
    default:
      break;
  }
}

const handleMouse = (addr:number, value: number): number => {

  const isRead = value < 0

  const REG = {
      LOWX:     0x00,
      HIGHX:    0x01,
      LOWY:     0x02,
      HIGHY:    0x03,
      STATUS:   0x04,
      MODE:     0x05,
      COMMAND:  0x06,
  }

  const CMD = {
    INIT:   0,    //               initialize
    READ:   1,    //               read mouse and update regs, clear ints
    CLEAR:  2,    //               clear mouse and update regs, clear ints
    GETCLAMP: 3,  //               get mouse clamping
    SERVE:  4,    //               check/serve mouse int
    HOME:   5,    //               set to clamping window upper left
    CLAMPX: 6,    //               clamp x values to x -> y
    CLAMPY: 7,    //               clamp y values to x -> y
    POS:    8,    //               set positions
  }

  switch (addr & 0x0f) {
    case REG.LOWX:
        if (isRead === false) {
          tmpmousex = (tmpmousex & 0xff00) | value;
          console.log('lowx', tmpmousex);
        }
        else {
          return mousex & 0xff;
        }
      break;
    case REG.HIGHX:
        if (isRead === false) {
          tmpmousex = (((value<<8) | (tmpmousex & 0x00ff)));
          console.log('highx', tmpmousex);
        }
        else {
          return (mousex >> 8) & 0xff;
        }
      break;
    case REG.LOWY:
        if (isRead === false) {
          tmpmousey = (tmpmousey & 0xff00) | value;
          console.log('lowy', tmpmousey);
        }
        else {
          return mousey & 0xff;
        }
      break;
    case REG.HIGHY:
        if (isRead === false) {
          tmpmousey = (((value<<8) | (tmpmousey & 0x00ff)));
          console.log('highy', tmpmousey);
        }
        else {
          return (mousey >> 8) & 0xff;
        }
      break;
    case REG.STATUS:
      return bstatus;

    case REG.MODE:
        if (isRead === false) {
          mode = value;
          console.log('Mouse mode: 0x', mode.toString(16));
        }
        else {
          return mode;
        }
        break;

    case REG.COMMAND:
        if (isRead === false) {
          command = value;
          switch(value)
          {
            case CMD.INIT:       //               initialize
              console.log('cmd.init');
              mousex = 0;
              mousey = 0;
              lastmousex = 0;
              lastmousey = 0;
              clampxmin = 0;
              clampymin = 0;
              clampxmax = 0x3ff;
              clampymax = 0x3ff;
              bstatus = 0x00;
              istatus = 0x00;
              break;
            case CMD.READ:       //               read mouse and update regs, clear ints
              //console.log('cmd.read');
              // Bit 7 6 5 4 3 2 1 0
              //     | | | | | | | |
              //     | | | | | | | \---  Previously, button 1 was up (0) or down (1)
              //     | | | | | | \-----  Movement interrupt
              //     | | | | | \-------  Button 0/1 interrupt
              //     | | | | \---------  VBL interrupt
              //     | | | \-----------  Currently, button 1 is up (0) or down (1)
              //     | | \-------------  X/Y moved since last READMOUSE
              //     | \---------------  Previously, button 0 was up (0) or down (1)
              //     \-----------------  Currently, button 0 is up (0) or down (1)
              // clear ints & previous
              var changed = ((bstatus&0x80) !== (lastbstatus&0x80))?true:false;
              istatus = 0x00;
              bstatus &= ~0x6f;
              bstatus |= ((lastbstatus >> 1) & 0x40);
              bstatus |= ((lastbstatus >> 4) & 0x01);
              lastbstatus = bstatus;
              if(lastmousex !== mousex || lastmousey !== mousey)
              {
                bstatus |= 0x20;
                changed = true;
              }
              lastmousex = mousex;
              lastmousey = mousey;
              if(changed)
              {
                //console.log("XYB: ", mousex, " ", mousey, " ", bstatus.toString(16));
              }
              break;
            case CMD.CLEAR:      //               clear mouse and update regs, clear ints
              console.log('cmd.clear');
              mousex = 0;
              mousey = 0;
              lastmousex = 0;
              lastmousey = 0;
              break;
            case CMD.SERVE:      //               check/serve mouse int
              // set int flags
              //console.log('cmd.serve');
              bstatus &= ~0x0e;
              bstatus |= servestatus;
              servestatus = 0x00;
              // deassert
              interruptRequest(slot, false);
              break;
            case CMD.HOME:       //               set to clamping window upper left
              console.log('cmd.home');
              mousex = clampxmin;
              mousey = clampymin;
              break;
            //case CMD.CLAMP:      //               set mouse clamping
            //  break;
            case CMD.CLAMPX:     //               clamp x values to x -> y
              console.log('cmd.clampx');
              clampxmin = tmpmousex;
              clampxmax = tmpmousey;
              break;
            case CMD.CLAMPY:     //               clamp y values to x -> y
              console.log('cmd.clampy');
              clampymin = tmpmousex;
              clampymax = tmpmousey;
              break;
            case CMD.GETCLAMP:     //
              console.log('cmd.getclamp');
              break;
            case CMD.POS:        //               set positions
              console.log('cmd.pos');
              mousex = tmpmousex;
              mousey = tmpmousey;
              break;
          }
        }
        else
          return command;
      break;

    default:
        console.log('AppleMouse unknown IO addr', addr.toString(16));
        break;
  }

  return 0;
}
