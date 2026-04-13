import { handleGetBasicMemory } from "../../main2worker"

enum TYPE {
  REAL = 0,
  STRING = 1,
  INTEGER = 2
}

const BasicVariablesView = () => {

  const getVariables = () => {
    const memory = handleGetBasicMemory()
    const vars = []
    for (let addr = 0; addr < memory.length; addr += 7) {
      const vardata = memory.slice(addr, addr + 7)
      const nameByte1 = vardata[0]
      if (nameByte1 === 0) break // No more variables
      const nameByte2 = vardata[1]
      let name = String.fromCharCode(nameByte1 & 0x7F, nameByte2 & 0x7F)
      const type = (nameByte1 & 0x80) ? TYPE.INTEGER : ((nameByte2 & 0x80) ? TYPE.STRING : TYPE.REAL)
      let value = ""
      if (type === TYPE.REAL) {
        // Numeric variable
        const expByte = vardata[2]
//        const expsign = (expByte & 0x80) ? 1 : -1
        const exponent = 2 ** (expByte - 0x80 - 1)
        const mantBytes = vardata.slice(3)
        const sign = (mantBytes[0] & 0x80) ? -1 : 1
        mantBytes[0] = mantBytes[0] & 0x7F
        // The mantissa bits are fractional values starting with .5, .25, .125,...
        let mantissa = 1
        const mantissaBits = (mantBytes[0] << 24) | (mantBytes[1] << 16) | (mantBytes[2] << 8) | mantBytes[3]
        let fraction = 0.5
        for (let i = 0; i < 31; i++) {
          mantissa += mantissaBits & (1 << (30 - i)) ? fraction : 0
          fraction /= 2
        }
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
          value = numValue.toExponential(9).replace(/\.?0+e/, "E")
        }
      } else if (type === TYPE.STRING) {
        name += "$"
        const strAddr = vardata[3] | (vardata[4] << 8)
        const strLen = vardata[2]
        value = String.fromCharCode(...memory.slice(strAddr, strAddr + strLen))
      } else if (type === TYPE.INTEGER) {
        name += "%"
        const intValue = (vardata[2] << 8) | vardata[3]
        // Value is stored in two's complement, so convert if negative
        value = (intValue - (intValue >= 0x8000 ? 0x10000 : 0)).toString()
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
              <td>{v.value}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>

}

export default BasicVariablesView
