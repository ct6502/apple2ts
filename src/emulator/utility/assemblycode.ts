export const code = `
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
