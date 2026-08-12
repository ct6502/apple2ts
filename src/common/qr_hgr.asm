; Apple II HGR QR runtime patches and 4x module renderer.
; Assembled by tools/generate-qr-hgr-assembly.mjs.

.cpu "6502"

.segment PATCHES { start: 0x6140, end: 0x614C }
.segment PATCHES

hgrInit:
        bne useHgrPage2
        jsr initHgrPage1
        rts
useHgrPage2:
        jsr initHgrPage2
        rts

invertPixel:
        jmp drawScaledPixel

.segment SHIMS { start: 0x6F00, end: 0x6F0D }
.segment SHIMS

; The monitor HGR routines leave mixed text enabled. Disable it after the
; requested page has been cleared and selected, before QR generation begins.
initHgrPage1:
        jsr $F3E2
        bit $C052
        rts

initHgrPage2:
        jsr $F3D8
        bit $C052
        rts

; Reads parameters from $7020-$7024, invokes QR.BIN at $6000 with interrupts
; disabled, then returns to Applesoft. This is the upstream demo convention.
.segment TRAMPOLINE { start: 0x7000, end: 0x701E }
.segment TRAMPOLINE
qrTrampoline:
        lda $7020
        sta $EB
        lda $7021
        sta $EC
        lda $7022
        sta $ED
        lda $7023
        sta $EE
        lda $7024
        sta $EF
        sei
        jsr $6000
        cli
        rts

QR_SIZE          = $00D7
QR_MODULE_X      = $00CF
QR_MODULE_Y      = $00CE
PIXEL_POINTER    = $06
SCALE            = 4
HGR_CENTER_X     = 140
HGR_CENTER_Y     = 96

.segment RENDERER { start: 0x8400, end: 0x8FFF }
.segment RENDERER
drawScaledPixel:
        lda QR_SIZE
        asl
        sta sizeTimesTwo

        lda #HGR_CENTER_X
        sec
        sbc sizeTimesTwo
        sta originX

        lda #HGR_CENTER_Y
        sec
        sbc sizeTimesTwo
        sta originY

        lda QR_MODULE_X
        asl
        asl
        clc
        adc originX
        sta outputX

        lda QR_MODULE_Y
        asl
        asl
        clc
        adc originY
        sta outputY

        lda #0
        sta scaleY

drawPixelRow:
        lda #0
        sta scaleX

drawPixelColumn:
        lda outputX
        clc
        adc scaleX
        sta pixelX

        lda outputY
        clc
        adc scaleY
        sta pixelY

        jsr setPixel

        inc scaleX
        lda scaleX
        cmp #SCALE
        bne drawPixelColumn

        inc scaleY
        lda scaleY
        cmp #SCALE
        bne drawPixelRow
        rts

setPixel:
        ldy pixelY
        lda rowLow,y
        sta PIXEL_POINTER
        lda rowHigh,y
        sta PIXEL_POINTER + 1

        ldy pixelX
        lda pixelMask,y
        sta mask
        lda pixelByte,y
        tay
        lda (PIXEL_POINTER),y
        eor mask
        sta (PIXEL_POINTER),y
        rts

sizeTimesTwo: .db 0
originX:      .db 0
originY:      .db 0
outputX:      .db 0
outputY:      .db 0
scaleX:       .db 0
scaleY:       .db 0
pixelX:       .db 0
pixelY:       .db 0
mask:         .db 0

rowLow:
.repeat 192 y
        .db ($2000 + (y & 7) * $400 + ((y / 8) & 7) * $80 + ((y / 64) & 3) * $28) & $FF
.end

rowHigh:
.repeat 192 y
        .db ($2000 + (y & 7) * $400 + ((y / 8) & 7) * $80 + ((y / 64) & 3) * $28) / $100
.end

pixelByte:
.repeat 280 x
        .db x / 7
.end

pixelMask:
.repeat 40
        .db 1, 2, 4, 8, 16, 32, 64
.end
