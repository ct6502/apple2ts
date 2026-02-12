import { Buffer } from "buffer"
import { handleGetSaveState } from "../main2worker"
import { handleGetCapitalizeBasic } from "../ui_settings"

const APPLESOFT_TOKENS: string[] = [
  "end ", // 128
  "for ", // 129
  "next ", // 130
  "data ", // 131
  "input ", // 132
  "del ", // 133
  "dim ", // 134
  "read ", // 135
  "gr ", // 136
  "text ", // 137
  "pr# ", // 138
  "in# ", // 139
  "call ", // 140
  "plot ", // 141
  "hlin ", // 142
  "vlin ", // 143
  "hgr2 ", // 144
  "hgr ", // 145
  "hcolor= ", // 146
  "hplot ", // 147
  "draw ", // 148
  "xdraw ", // 149
  "htab ", // 150
  "home ", // 151
  "rot= ", // 152
  "scale= ", // 153
  "shload ", // 154
  "trace ", // 155
  "notrace ", // 156
  "normal ", // 157
  "inverse ", // 158
  "flash ", // 159
  "color= ", // 160
  "pop ", // 161
  "vtab ", // 162
  "himem: ", // 163
  "lomem: ", // 164
  "onerr ", // 165
  "resume ", // 166
  "recall ", // 167
  "store ", // 168
  "speed= ", // 169
  "let ", // 170
  "goto ", // 171
  "run ", // 172
  "if ", // 173
  "restore ", // 174
  "& ", // 175
  "gosub ", // 176
  "return ", // 177
  "rem ", // 178
  "stop ", // 179
  "on ", // 180
  "wait ", // 181
  "load ", // 182
  "save ", // 183
  "def ", // 184
  "poke ", // 185
  "print ", // 186
  "cont ", // 187
  "list ", // 188
  "clear ", // 189
  "get ", // 190
  "new ", // 191
  "tab ", // 192
  "to ", // 193
  "fn ", // 194
  "spc( ", // 195
  "then ", // 196
  "at ", // 197
  "not ", // 198
  "step ", // 199
  "+ ", // 200
  "- ", // 201
  "* ", // 202
  "/ ", // 203
  "; ", // 204
  "and ", // 205
  "or ", // 206
  "> ", // 207
  "= ", // 208
  "< ", // 209
  "sgn", // 210
  "int", // 211
  "abs", // 212
  "usr", // 213
  "fre", // 214
  "scrn(", // 215
  "pdl", // 216
  "pos", // 217
  "sqr", // 218
  "rnd", // 219
  "log", // 220
  "exp", // 221
  "cos", // 222
  "sin", // 223
  "tan", // 224
  "atn", // 225
  "peek", // 226
  "len", // 227
  "str$", // 228
  "val", // 229
  "asc", // 230
  "chr$", // 231
  "left$", // 232
  "right$", // 233
  "mid$", // 234
]


export const BasicRebuildFromMemory = (setprogramText: (v: string) => void) => {

  const useSaveStateCallback = (sState: EmulatorSaveState) => {
    const memString = sState.state6502.memory
    const memory = new Uint8Array(Buffer.from(memString, "base64"))
    const progStart = memory[0x67] + (memory[0x68] << 8)
    // If the program start is 0, then there's no program in memory, so just return.
    if (memory[progStart] === 0) {
      setprogramText("")
      return
    }
    const himem = memory[0x73] + (memory[0x74] << 8)
    // Decode the Applesoft BASIC program from memory. Each line starts with a 2 byte pointer to the next line, followed by a 2 byte line number, followed by the tokenized line, and ends with a 0 byte.
    let currentIndex = progStart
    let programText = ""
    while (currentIndex <= himem) {
      const nextLinePointer = memory[currentIndex] + (memory[currentIndex + 1] << 8)
      if (nextLinePointer === 0) {
        break
      }
      const lineNumber = memory[currentIndex + 2] + (memory[currentIndex + 3] << 8)
      if (lineNumber === 0) {
        break
      }
      const lineTokens: number[] = []
      let tokenIndex = currentIndex + 4
      let justDidSpace = false
      let withinQuotes = false
      let justDidParensOrEquals = false
      while (true) {
        const currentToken = memory[tokenIndex]
        if (currentToken === 0) break
        if (currentToken >= 128 && currentToken < 128 + APPLESOFT_TOKENS.length) {
          // This is a token, convert it to the corresponding string.
          let tokenString = APPLESOFT_TOKENS[currentToken - 128]
          if (handleGetCapitalizeBasic()) {
            tokenString = tokenString.toUpperCase()
          }
          const tokenChars = tokenString.split("")
          if (!justDidSpace && !justDidParensOrEquals) {
            lineTokens.push(32)
          }
          if (justDidParensOrEquals && (tokenChars[0] === "-" || tokenChars[0] === "+")) {
            tokenChars.pop()
          }
          lineTokens.push(...tokenChars.map(c => c.charCodeAt(0)))
          justDidSpace = lineTokens[lineTokens.length - 1] === 32
          withinQuotes = false
          justDidParensOrEquals = currentToken === 208
        } else {
          // This is a regular character, just add it to the line tokens.
          // Skip space character if we just did one.
          if (!justDidSpace || currentToken !== 32) {
            lineTokens.push(currentToken)
          }
          if (currentToken === 34) {
            withinQuotes = !withinQuotes
          }
          justDidParensOrEquals = currentToken === 40 && !withinQuotes
          // add space after semicolon or colon
          if ((currentToken === 59 || currentToken === 58) && !withinQuotes) {
            lineTokens.push(32)
            justDidSpace = true
          } else {
            justDidSpace = false
          }
        }
        tokenIndex++
      }
      const statements = lineTokens.map(t => String.fromCharCode(t)).join("").trim()
      const lineText = `${lineNumber} ${statements}`
      programText += lineText + "\n"
      currentIndex = nextLinePointer
    }
    setprogramText(programText)
  }

  // This has to be done via a callback since we don't normally pass all
  // the memory in the state.
  handleGetSaveState(useSaveStateCallback)
}
