
// export const code = ''
export const code2 = `
        ORG   $300
; set up Mockingboard
        LDA #$C0    ; enable Mockingboard
        STA $C030
        LDA #$80    ; select channel 0
        STA $C010
        LDA #$00    ; set frequency LSB to 0
        STA $C012
        LDA #$05    ; set frequency MSB to 5 (261 Hz)
        STA $C013
        LDA #$0F    ; set volume to maximum
        STA $C015

; play notes
        LDA #$80    ; start sound
        STA $C010
        LDX #20     ; loop for 20 cycles (approx. 1 second)
LOOP    DEX
        BNE LOOP
        LDA #$00    ; stop sound
        STA $C010

; end of program
        RTS
`
export const code = `
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
