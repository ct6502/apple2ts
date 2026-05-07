import { handleGetBasicMemory, handleGetZeroPage, passSetBinaryBlock, passSetStringVariable } from "../../main2worker"
import { useState } from "react"

enum TYPE {
  REAL = 0,
  STRING = 1,
  INTEGER = 2
}

const BasicVariablesView = () => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")

  const doSetEditValue = (name: string, value: string) => {
    if (name.endsWith("%")) {
      value = value.replace(/[^0-9-]/g, "")
    } else if (name.endsWith("$")) {
      // Limit string length to 255 characters, since that's the max that can be stored in BASIC memory.
      value = value.slice(0, 255)
    } else {
      // for floats only allow 0-9, decimal points, negative sign, e, and E
      value = value.replace(/[^0-9.\-eE]/g, "")
    }
    setEditValue(value)
  }

  const decodeFloat = (vardata: Uint8Array) => {
    let value = ""
    const expByte = vardata[2]
    const exponent = 2 ** (expByte - 0x80 - 1)
    const mantBytes = vardata.slice(3)
    const sign = (mantBytes[0] & 0x80) ? -1 : 1
    mantBytes[0] = mantBytes[0] & 0x7F
    // The mantissa bits represent a 31-bit fractional value with an implicit leading 1
    const mantissaBits = (mantBytes[0] << 24) | (mantBytes[1] << 16) | (mantBytes[2] << 8) | mantBytes[3]
    const mantissa = 1 + mantissaBits / (2 ** 31)
    // If exponent is zero, the number is zero regardless of mantissa and sign
    const numValue = (expByte !== 0) ? sign * mantissa * exponent : 0
    // Format the number with up to 10 significant digits, trimming trailing zeros
    // 123.4567891
    // If the absolute value of the number is an integer in the range 0 to
    // 999999999, it is printed as an integer. If the absolute value of the
    // number is greater than or equal to .1 and less than or equal to
    // 999999999, it is printed in fixed point notation, with no exponent.
    // Otherwise, scientific notation is used.
    if (numValue === Math.trunc(numValue) && Math.abs(numValue) <= 999999999) {
      value = numValue.toString()
    } else if (Math.abs(numValue) >= 0.1 && Math.abs(numValue) <= 999999999) {
      // Use replace to remove trailing zeroes
      value = numValue.toPrecision(9).replace(/\.?0+$/, "")
      // Check for numbers that might require a 10th digit for accuracy.
      // We don't use 10 digits by default because then other numbers,
      // like 0.9, would be shown as 0.8999999999.
      if (value.length >= 10) {
        value = numValue.toPrecision(10).replace(/\.?0+$/, "")
      }
    } else {
      // Use replace to remove trailing zeroes
      value = numValue.toExponential(8).replace(/\.?0+e/, "E")
    }
    return value
  }

  const decodeString = (vardata: Uint8Array) => {
    const strAddr = vardata[3] | (vardata[4] << 8)
    const strLen = vardata[2]
    return String.fromCharCode(...handleGetBasicMemory().slice(strAddr, strAddr + strLen))
  }

  const decodeInteger = (vardata: Uint8Array) => {
    let intValue = (vardata[2] << 8) | vardata[3]
    // Value is stored in two's complement, so convert if negative
    if (intValue >= 0x8000) {
      intValue -= 0x10000
    }
    return intValue.toString()
  }

  // Return 5 bytes representing the given integer value.
  const encodeInteger = (value: string) => {
    let intValue = parseInt(value)
    if (isNaN(intValue) || intValue < -32768 || intValue > 32767) {
      throw new Error("Invalid integer value")
    }
    if (intValue < 0) {
      intValue += 0x10000 // Convert to two's complement
    }
    const vardata = new Uint8Array(5)
    vardata[0] = (intValue >> 8) & 0xFF
    vardata[1] = intValue & 0xFF
    return vardata
  }

  // Return 5 bytes representing the given float value.
  const encodeFloat = (value: string) => {
    let numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return new Uint8Array(5)
    }
    if (numValue === 0) {
      return new Uint8Array(5) // All bytes are zero for zero value
    }
     // Clamp to range representable by Apple II BASIC
    numValue = Math.min(Math.max(numValue, -1.7e38), 1.7e38)
    if (Math.abs(numValue) < 3e-39) {
      numValue = 0 // Underflow to zero
    }
    const sign = numValue < 0 ? 0x80 : 0
    const absValue = Math.abs(numValue)
    let exponent = Math.floor(Math.log2(absValue))
    let mantissa = absValue / (2 ** exponent) + 5e-10
    // Normalize mantissa to be in the range [1, 2)
    while (mantissa < 1) {
      mantissa *= 2
      exponent--
    }
    while (mantissa >= 2) {
      mantissa /= 2
      exponent++
    }
    const expByte = exponent + 0x80 + 1
    const mantissaBits = Math.round((mantissa - 1) * (2 ** 31))
    const vardata = new Uint8Array(5)
    vardata[0] = expByte
    vardata[1] = (mantissaBits >> 24) & 0x7F | sign
    vardata[2] = (mantissaBits >> 16) & 0xFF
    vardata[3] = (mantissaBits >> 8) & 0xFF
    vardata[4] = mantissaBits & 0xFF
    return vardata
  }

  const getName = (vardata: Uint8Array) => {
    const nameByte1 = vardata[0]
    const nameByte2 = vardata[1]
    let name = String.fromCharCode(nameByte1 & 0x7F)
    if ((nameByte2 & 0x7F) !== 0) {
      name += String.fromCharCode(nameByte2 & 0x7F)
    }
    return name
  }
  const getVariables = () => {
    const memory = handleGetBasicMemory()
    const vars = []
    for (let addr = 0; addr < memory.length; addr += 7) {
      const vardata = memory.slice(addr, addr + 7)
      const nameByte1 = vardata[0]
      if (nameByte1 === 0) break // No more variables
      const nameByte2 = vardata[1]
      let name = getName(vardata)
      const type = (nameByte1 & 0x80) ? TYPE.INTEGER : ((nameByte2 & 0x80) ? TYPE.STRING : TYPE.REAL)
      let value = ""
      if (type === TYPE.REAL) {
        value = decodeFloat(vardata)
      } else if (type === TYPE.STRING) {
        name += "$"
        value = decodeString(vardata)
      } else if (type === TYPE.INTEGER) {
        name += "%"
        value = decodeInteger(vardata)
      }
      vars.push({ name, type, value })
    }
    const ROW_MIN = 12
    if (vars.length < ROW_MIN) {
      // Add some empty rows to make it look nicer
      for (let i = vars.length; i < ROW_MIN; i++) {
        vars.push({ name: "", type: TYPE.REAL, value: "" })
      }
    }
    return vars
  }

  const findVariableIndexByName = (findName: string) => {
    const memory = handleGetBasicMemory()
    for (let addr = 0; addr < memory.length; addr += 7) {
      const vardata = memory.slice(addr, addr + 7)
      const nameByte1 = vardata[0]
      if (nameByte1 === 0) break // No more variables
      const name = getName(vardata)
      if (name === findName) {
        return addr / 7
      }
    }
    return -1
  }

  const changeVariableValue = (name: string, newValue: string) => {
    // Strip off "%" or "$" from the name to get the variable name in memory
    const baseName = name.endsWith("%") || name.endsWith("$") ? name.slice(0, -1) : name
    const index = findVariableIndexByName(baseName)
    if (index === -1) {
      console.error("Variable not found:", name)
      return
    }
    const memory = handleGetBasicMemory()
    const vardata = memory.slice(index * 7, index * 7 + 7)
    const type = (vardata[0] & 0x80) ? TYPE.INTEGER : ((vardata[1] & 0x80) ? TYPE.STRING : TYPE.REAL)
    const zp = handleGetZeroPage()
    const varStart = zp[0x69] | (zp[0x6A] << 8)
    if (type === TYPE.REAL) {
      const newVardata = encodeFloat(newValue)
      passSetBinaryBlock(varStart + index * 7 + 2, newVardata)
    } else if (type === TYPE.STRING) {
      // We are going to let Applesoft BASIC change the string value.
      passSetStringVariable(name, newValue)
    } else if (type === TYPE.INTEGER) {
      const newVardata = encodeInteger(newValue)
      passSetBinaryBlock(varStart + index * 7 + 2, newVardata)
    }
  }

  return <div style={{
      height: "200px",
      overflowX: "auto",
      overflowY: "auto"
    }}>
    <table className="basic-vars default-font"
      style={{
        width: "250px",
      }}>
      <colgroup>
        <col style={{width: "50px"}} />
        <col style={{width: "210px"}} />
      </colgroup>
      <thead>
        <tr className="default-font">
          <th>Variable</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {
          getVariables().map((v, i) => (
            <tr className="use-monospace" key={i}>
              <td>{v.name.length > 0 ? v.name : "\u00A0"}</td>
              <td
                onDoubleClick={() => {
                  if (v.name.length > 0) {
                    setEditingIndex(i)
                    setEditValue(v.value)
                  }
                }}
              >
                {editingIndex === i ? (
                  <input
                    type="text"
                    value={editValue}
                    autoFocus
                    className="basic-vars-field"
                    onChange={(e) => doSetEditValue(v.name, e.target.value)}
                    onBlur={() => {
                      setEditingIndex(null)
                      changeVariableValue(v.name, editValue)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        e.stopPropagation()
                        setEditingIndex(null)
                        changeVariableValue(v.name, editValue)
                      } else if (e.key === "Escape") {
                        e.preventDefault()
                        e.stopPropagation()
                        setEditingIndex(null)
                      }
                    }}
                  />
                ) : (
                  v.value
                )}
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>

}

export default BasicVariablesView
