import { StreamLanguage, StringStream } from "@codemirror/language"
import { LanguageSupport } from "@codemirror/language"

interface BasicState {
  inString: boolean
  inRemark: boolean
}

// Applesoft BASIC tokenizer
const basicTokenizer = {
  startState: (): BasicState => ({ inString: false, inRemark: false }),
  
  token: (stream: StringStream, state: BasicState): string | null => {
    // Reset remark state at start of new line
    if (stream.sol()) {
      state.inRemark = false
    }
    
    // Handle strings
    if (state.inString) {
      if (stream.skipTo("\"")) {
        stream.next()
        state.inString = false
        return "string"
      }
      stream.skipToEnd()
      return "string"
    }
    
    // Handle REM statements
    if (state.inRemark) {
      stream.skipToEnd()
      return "comment"
    }
    
    // Skip whitespace
    if (stream.eatSpace()) return null
    
    // Line numbers at start
    if (stream.sol() && stream.match(/^\d+/)) {
      return "number"
    }
    
    // String literals
    if (stream.eat("\"")) {
      state.inString = true
      return "string"
    }
    
    // Keywords (case insensitive)
    if (stream.match(/^(REM|PRINT|INPUT|FOR|NEXT|IF|THEN|GOTO|GOSUB|RETURN|DIM|LET|END|HOME|TEXT|GR|HGR|HCOLOR|PLOT|HPLOT|CALL|POKE|PEEK|DATA|READ|RESTORE|NEW|LIST|RUN|STOP|HTAB|VTAB|SPEED|FLASH|INVERSE|NORMAL|COLOR|POP|ONERR|RESUME|RECALL|STORE|GET|TO|STEP|AND|OR|NOT|AT|TAB|SPC|FN|DEF|MOD|INT|ABS|SGN|RND|SQR|LOG|EXP|SIN|COS|TAN|ATN|LEN|VAL|ASC|CHR\$|LEFT\$|RIGHT\$|MID\$|STR\$)\b/i)) {
      const keyword = stream.current().toUpperCase()
      if (keyword === "REM") {
        state.inRemark = true
        return "comment"
      }
      return "keyword"
    }
    
    // Numbers
    if (stream.match(/^\d+\.?\d*/)) {
      return "number"
    }
    
    // Variables (including $ and % suffixes)
    if (stream.match(/^[A-Za-z][A-Za-z0-9]*[$%]?/)) {
      return "variable"
    }
    
    // Operators
    if (stream.match(/^[+*/=<>^-]/)) {
      return "operator"
    }
    
    // Everything else
    stream.next()
    return null
  },
  
  copyState: (state: BasicState): BasicState => ({ ...state })
}

/// A language provider that provides Applesoft BASIC parsing.
export const basicLanguage = StreamLanguage.define(basicTokenizer)

/// Applesoft BASIC language support.
export function basic() {
  return new LanguageSupport(basicLanguage)
}

