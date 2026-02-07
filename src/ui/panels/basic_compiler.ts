// Applesoft BASIC keywords and functions
const KEYWORDS = new Set([
  "REM", "PRINT", "INPUT", "FOR", "NEXT", "IF", "THEN", "GOTO", "GOSUB", 
  "RETURN", "DIM", "LET", "END", "HOME", "TEXT", "GR", "HGR", "HCOLOR", 
  "PLOT", "HPLOT", "CALL", "POKE", "PEEK", "DATA", "READ", "RESTORE", 
  "NEW", "LIST", "RUN", "STOP", "HTAB", "VTAB", "SPEED", "FLASH", 
  "INVERSE", "NORMAL", "COLOR", "POP", "ONERR", "RESUME", "RECALL", 
  "STORE", "GET", "TO", "STEP", "AND", "OR", "NOT", "AT", "TAB", "SPC",
  "FN", "DEF", "MOD"
])

const FUNCTIONS = new Set([
  "INT", "ABS", "SGN", "RND", "SQR", "LOG", "EXP", "SIN", "COS", "TAN", 
  "ATN", "LEN", "VAL", "ASC", "CHR$", "LEFT$", "RIGHT$", "MID$", "STR$"
])

// Applesoft BASIC compiler. Throws errors for invalid syntax.
export const BasicCompiler = (program: string) => {
  if (program.trim() === "") {
    throw new Error("Program is empty")
  }
  
  const lines = program.split(/\r?\n/).filter(line => line.trim() !== "")
  const lineNumbers = new Set<number>()
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lineNum = i + 1
    
    // Check for line number at start
    const lineNumberMatch = line.match(/^(\d+)\s+(.*)/)
    if (!lineNumberMatch) {
      throw new Error(`Line ${lineNum}: Missing line number`)
    }
    
    const [, lineNumberStr, restOfLine] = lineNumberMatch
    const lineNumber = parseInt(lineNumberStr)
    
    if (lineNumber < 0 || lineNumber > 63999) {
      throw new Error(`Line ${lineNum}: Line number ${lineNumber} out of range (0-63999)`)
    }
    
    if (lineNumbers.has(lineNumber)) {
      throw new Error(`Line ${lineNum}: Duplicate line number ${lineNumber}`)
    }
    lineNumbers.add(lineNumber)
    
    // Parse the rest of the line
    const tokens = tokenizeLine(restOfLine)
    
    if (tokens.length === 0) {
      throw new Error(`Line ${lineNum}: Empty statement after line number`)
    }
    
    // Skip validation if line is a REM statement
    if (tokens[0].toUpperCase() === "REM") {
      continue
    }
    
    // Validate tokens
    validateTokens(tokens, lineNum, lineNumber)
  }
  
  return
}

// Simple tokenizer
function tokenizeLine(line: string): string[] {
  const tokens: string[] = []
  let i = 0
  
  // Check if line starts with REM - if so, treat rest as a single comment
  const trimmed = line.trimStart()
  if (trimmed.toUpperCase().startsWith("REM")) {
    tokens.push("REM")
    const commentStart = line.indexOf("REM") + 3
    if (commentStart < line.length) {
      tokens.push(line.substring(commentStart))
    }
    return tokens
  }
  
  while (i < line.length) {
    const char = line[i]
    
    // Skip whitespace
    if (/\s/.test(char)) {
      i++
      continue
    }
    
    // String literal
    if (char === "\"") {
      let j = i + 1
      while (j < line.length && line[j] !== "\"") {
        j++
      }
      tokens.push(line.substring(i, j + 1))
      i = j + 1
      continue
    }
    
    // Number
    if (/\d/.test(char)) {
      let j = i
      while (j < line.length && /[\d.]/.test(line[j])) {
        j++
      }
      tokens.push(line.substring(i, j))
      i = j
      continue
    }
    
    // Identifier or keyword
    if (/[A-Za-z]/.test(char)) {
      let j = i
      while (j < line.length && /[A-Za-z0-9$%]/.test(line[j])) {
        j++
      }
      tokens.push(line.substring(i, j))
      i = j
      continue
    }
    
    // Operators and punctuation
    tokens.push(char)
    i++
  }
  
  return tokens
}

// Validate tokens
function validateTokens(tokens: string[], lineNum: number, lineNumber: number): void {
  const firstToken = tokens[0].toUpperCase()
  
  // Check if first token is a valid keyword
  if (!KEYWORDS.has(firstToken) && !FUNCTIONS.has(firstToken) && firstToken !== "?") {
    // Could be a variable assignment (LET is optional)
    if (!/^[A-Za-z][A-Za-z0-9]*[$%]?$/.test(tokens[0])) {
      throw new Error(`Line ${lineNum} (${lineNumber}): Invalid command or variable name '${tokens[0]}'`)
    }
  }
  
  // Check for unmatched quotes
  for (const token of tokens) {
    if (token.startsWith("\"") && !token.endsWith("\"")) {
      throw new Error(`Line ${lineNum} (${lineNumber}): Unmatched quote`)
    }
  }
  
  // Check for basic FOR/NEXT structure
  if (firstToken === "FOR") {
    if (tokens.length < 5 || tokens[2].toUpperCase() !== "=" || !tokens.some(t => t.toUpperCase() === "TO")) {
      throw new Error(`Line ${lineNum} (${lineNumber}): Invalid FOR statement syntax`)
    }
  }
  
  // Check GOTO/GOSUB has a line number
  if (firstToken === "GOTO" || firstToken === "GOSUB") {
    if (tokens.length < 2 || !/^\d+$/.test(tokens[1])) {
      throw new Error(`Line ${lineNum} (${lineNumber}): ${firstToken} requires a line number`)
    }
  }
  
  // Check IF has THEN or GOTO
  if (firstToken === "IF") {
    const hasThen = tokens.some(t => t.toUpperCase() === "THEN")
    const hasGoto = tokens.some(t => t.toUpperCase() === "GOTO")
    if (!hasThen && !hasGoto) {
      throw new Error(`Line ${lineNum} (${lineNumber}): IF statement missing THEN or GOTO`)
    }
  }
}
