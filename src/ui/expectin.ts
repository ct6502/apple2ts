import { handleSetCPUState } from "./controller"
import { handleGetTextPageAsString, passPasteText } from "./main2worker"
import { RUN_MODE } from "../common/utility"

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function trim(str: string) {
  return str.replace(/(^[\r\n\s\x7F]+)|([\r\n\s\x7F]+$)/gm, "")
}

export class Expectin {
  json: ExpectinJSON
  cancel: boolean
  disconnectCallback?: () => void

  constructor(jsonString: string) {
    this.json = Convert.toExpectinJSON(jsonString)
    this.cancel = false
  }

  public async Run(disconnectCallback?: () => void) {
    if (disconnectCallback) {
      this.disconnectCallback = disconnectCallback
    }
    
    if (this.json.commands) {
      this.processCommands(this.json.commands)
    }
  }

  public async Cancel() {
    this.cancel = true
  }

  public IsRunning(): boolean {
    return !this.cancel
  }

  private async processCommands(commands: ExpectinCommand[], prevText: string = "") {
    for (const command of commands) {
      if (command.disconnect) {
        this.cancel = true
        if (this.disconnectCallback != undefined) {
          this.disconnectCallback()
        }
      } else if (command.emulator) {
        switch (command.emulator) {
          case "boot":
            handleSetCPUState(RUN_MODE.NEED_BOOT)
            break
          case "reset":
            handleSetCPUState(RUN_MODE.NEED_RESET)
            break
        }
      } else if (command.expect) {
        await command.expect.reduce(async (promise, expectCommand) => {
          if (expectCommand.match) {
            const escapedRegex = expectCommand.match.replace(/[/[\]]/g, "\\$&")
            const regex = new RegExp(escapedRegex, "gims")

            while (!this.cancel) {
              let newText

              do {
                await sleep(200)
                newText = trim(handleGetTextPageAsString())
              } while (newText === prevText)

              const i = newText.indexOf(prevText)
              const deltaText = i >= 0 ? newText.substring(i + prevText.length) : newText

              if (!regex.test(deltaText)) {
                prevText = newText
              } else {
                if (expectCommand.commands) {
                  prevText = await this.processCommands(expectCommand.commands, newText)
                }
                break
              }
            }
          }
        }, Promise.resolve())
      } else if (command.send) {
        passPasteText(command.send)
      } else if (command.sleep) {
        await sleep(command.sleep)
      }
    }

    return prevText
  }
}

// ************************************************************************************
// DO NOT MODIFY: The following code was auto-generated via https://app.quicktype.io
// ************************************************************************************

export type ExpectinJSON = {
    readonly commands?: ExpectinCommand[]
}

export type Expect = {
    readonly match?:    string
    readonly commands?: ExpectinCommand[]
}

export type ExpectinCommand = {
    readonly disconnect?: object
    readonly emulator?:   string
    readonly expect?:   Expect[]
    readonly send?:       string
    readonly sleep?:    number
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toExpectinJSON(json: string): ExpectinJSON {
        return cast(JSON.parse(json), r("ExpectinJSON"))
    }

    public static expectinJSONToJson(value: ExpectinJSON): string {
        return JSON.stringify(uncast(value, r("ExpectinJSON")), null, 2)
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
    const prettyTyp = prettyTypeName(typ)
    const parentText = parent ? ` on ${parent}` : ""
    const keyText = key ? ` for key "${key}"` : ""
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a) }).join(", ")}]`
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal
    } else {
        return typeof typ
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map: any = {}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ })
        typ.jsonToJS = map
    }
    return typ.jsonToJS
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map: any = {}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ })
        typ.jsToJSON = map
    }
    return typ.jsToJSON
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transform(val: any, typ: any, getProps: any, key: any = "", parent: any = ""): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val
        return invalidValue(typ, val, key, parent)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length
        for (let i = 0; i < l; i++) {
            const typ = typs[i]
            try {
                return transform(val, typ, getProps)
            } catch {
              // console.error(error)
            }
        }
        return invalidValue(typs, val, key, parent)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val
        return invalidValue(cases.map(a => { return l(a) }), val, key, parent)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent)
        return val.map(el => transform(el, typ, getProps))
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function transformDate(val: any): any {
        if (val === null) {
            return null
        }
        const d = new Date(val)
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent)
        }
        return d
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent)
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = {}
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key]
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined
            result[prop.key] = transform(v, prop.typ, getProps, key, ref)
        })
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref)
            }
        })
        return result
    }

    if (typ === "any") return val
    if (typ === null) {
        if (val === null) return val
        return invalidValue(typ, val, key, parent)
    }
    if (typ === false) return invalidValue(typ, val, key, parent)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ref: any = undefined
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref
        typ = typeMap[typ.ref]
    }
    if (Array.isArray(typ)) return transformEnum(typ, val)
    if (typeof typ === "object") {
        // eslint-disable-next-line no-prototype-builtins
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            // eslint-disable-next-line no-prototype-builtins
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            // eslint-disable-next-line no-prototype-builtins
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent)
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val)
    return transformPrimitive(typ, val)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function l(typ: any) {
    return { literal: typ }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function a(typ: any) {
    return { arrayItems: typ }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function u(...typs: any[]) {
    return { unionMembers: typs }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function o(props: any[], additional: any) {
    return { props, additional }
}

function r(name: string) {
    return { ref: name }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const typeMap: any = {
    "ExpectinJSON": o([
        { json: "commands", js: "commands", typ: u(undefined, a(r("ExpectinJSONCommand"))) },
    ], false),
    "ExpectinJSONCommand": o([
        { json: "emulator", js: "emulator", typ: u(undefined, "") },
        { json: "expect", js: "expect", typ: u(undefined, a(r("Expect"))) },
        { json: "sleep", js: "sleep", typ: u(undefined, 0) },
        { json: "send", js: "send", typ: u(undefined, "") },
        { json: "disconnect", js: "disconnect", typ: u(undefined, r("Disconnect")) },
    ], false),
    "Expect": o([
        { json: "match", js: "match", typ: u(undefined, "") },
        { json: "commands", js: "commands", typ: u(undefined, a(r("ExpectCommand"))) },
    ], false),
    "ExpectCommand": o([
        { json: "emulator", js: "emulator", typ: u(undefined, "") },
        { json: "sleep", js: "sleep", typ: u(undefined, 0) },
        { json: "send", js: "send", typ: u(undefined, "") },
        { json: "disconnect", js: "disconnect", typ: u(undefined, r("Disconnect")) },
    ], false),
    "Disconnect": o([
    ], false),
}
