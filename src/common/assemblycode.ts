export const code = `
        ORG   $300
        LDX   #$03
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
