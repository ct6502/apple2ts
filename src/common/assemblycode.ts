// Nested loop
export const code = `
        ORG   $300
OVER    LDA   #$00
LOOPA   LDX   #$00
LOOPX   LDY   #$00
LOOPY   INY
        BNE   LOOPY
        INX
        BNE   LOOPX  ; do inner Y loop again, 256 times
        INC
        BNE   LOOPA  ; do inner X loop again, 256 times
        JMP   OVER   ; do outer loop forever
        RTS
`

// 300: A9 FF 85 06 85 07 85 08 E6 06 D0 06 E6 07 D0 02 E6 08 2C 00 C0 10 F1 2C 10 C0 A9 00 85 24 A5 08 20 DA FD A5 07 20 DA FD A5 06 20 DA FD 4C 00 03
export const codeCountKeyPressDelay = `
; ------------------------------------------------------------
; Keyboard counter demo for Apple II
; Counts keys pressed during a 1-second interval and prints them.
; ------------------------------------------------------------
KEYBD    = $C000      ; keyboard data latch
KBDSTRB  = $C010      ; keyboard strobe: reading any address here clears latch
PRBYTE   = $FDDA
HCUR     = $24        ; horizontal cursor position
        org $300
start:
        lda #$ff
        sta $06
        sta $07
        sta $08
nokey   inc $06
        bne cont
        inc $07
        bne cont
        inc $08
cont    bit KEYBD
        bpl nokey
; A key is waiting. Read the key to acknowledge it, then clear the strobe.
        bit KBDSTRB
        lda #$00
        sta HCUR
        lda $08
        jsr PRBYTE
        lda $07
        jsr PRBYTE
        lda $06
        jsr PRBYTE
        jmp start
`

export const codeMotor = `
        ORG   $300
        LDA   $C000
        LDX   $C010
        JSR   $F941
        JSR   $FD8E
        JMP   $0300
        JMP   ($0300,X)
        CMP   $C089,X  ; turn on the motor
        LDA   $C08E,X  ; enable read
READ1   LDA   $C08C,X  ; read a byte
        BPL   READ1     ; wait for the byte to be ready (high bit set)
        CMP   #$D5
        BNE   READ1
READ2   LDA   $C08C,X  ; read a byte
        BPL   READ2     ; wait for the byte to be ready (high bit set)
READ3   LDA   $C08C,X  ; read a byte
        BPL   READ3     ; wait for the byte to be ready (high bit set)
        CMP   $C088,X  ; turn off the motor        
        RTS
`

// Test a bunch of different addressing modes to see what they look like
// when you hover over them in the debug view.
export const codeAddressing = `
         ORG   $300
AGAIN    LDA   $C000
         BPL   AGAIN
         LDA   $C010
         JSR   $FCA8
         LDA   $C019
         BRK
         LDA   #$FE
         LDA   LOC1
         LDA   LOC1,X
         LDA   LOC3
         LDA   LOC3,X
         LDA   LOC3,Y
         LDA   (LOC1,X)
         LDA   (LOC1),Y
         LDA   (LOC1)
         JMP   LOC3
         JMP   (LOC2)
         JMP   (LOC2,X)
         STA   LOC1
LOC1     EQU   $04
LOC2     EQU   $0003
LOC3     EQU   $1234
         RTS
`

export const codeOrig = `
         ORG   $300
FREQ     EQU   $350
PLSWIDTH EQU   $352

         LDA   #$FF
         STA   FREQ
         LDA   #$80
         STA   PLSWIDTH
PLAY     LDA   $C030
         LDY   PLSWIDTH
PULSE    DEY
         BNE   PULSE
         LDA   $C030
         LDX   FREQ
COUNTDN  DEX
         BNE   COUNTDN
         JSR   READKB
         JMP   PLAY

INCR     INC   FREQ
         RTS

DECR     DEC   FREQ
         RTS

PULSEINC DEC   PLSWIDTH
         INC   FREQ
         RTS

PULSEDEC INC   PLSWIDTH
         DEC   FREQ
         RTS

READKB   LDA   $C000
         STA   $C010   
         CMP   #$88
         BEQ   INCR
         CMP   #$95
         BEQ   DECR
         CMP   #$C1
         BEQ   PULSEINC
         CMP   #$DA
         BEQ   PULSEDEC
         RTS
`
