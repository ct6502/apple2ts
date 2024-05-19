export const code = `
         ORG   $300
         LDA   #$00
         STA   $C073   ; set bank index to 0
         STA   $C009   ; turn on AUXZP
         STA   $C08B   ; turn on RDWRBSR1
         LDA   #$CD
         STA   $00C0   ; write zero page memory location
         STA   $FFC0   ; write banked RAM
         LDA   $00C0   ; load zero page memory location
         TAX
         LDA   $FFC0   ; read banked RAM
         TAY
         STA   $C008   ; turn off banked RAM
         STA   $C08A   ; OFFBSR1 = turn off RDWRBSR1
         BRK
`

export const codeTest = `
         ORG   $300
         LDA   #$FE
         LDA   $01
         LDA   $A0,X
         LDA   $1234
         LDA   $1234,X
         LDA   $1234,Y
         LDA   ($04,X)
         LDA   ($04),Y
         LDA   ($04)
         JMP   $1234
         JMP   ($0003)
         JMP   ($0003,X)
         STA   $C0
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
