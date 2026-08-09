import { stampMenuControls } from "./screenshot_utils"

describe("screenshot menu controls", () => {
  test("draws a spaced keyboard row with below-only shadows and straight-line arrows", () => {
    const operations: string[] = []
    const contextState = {
      fillStyle: "",
      lineCap: "",
      lineJoin: "",
      lineWidth: 0,
      strokeStyle: "",
      save: () => operations.push("save"),
      restore: () => operations.push("restore"),
      scale: (x: number, y: number) => operations.push(`scale:${x},${y}`),
      beginPath: () => operations.push("beginPath"),
      roundRect: (x: number, y: number, width: number, height: number, radius: number) =>
        operations.push(`roundRect:${x},${y},${width},${height},${radius}`),
      moveTo: (x: number, y: number) => operations.push(`moveTo:${x},${y}`),
      lineTo: (x: number, y: number) => operations.push(`lineTo:${x},${y}`),
      fillText: (text: string, x: number, y: number) => operations.push(`fillText:${text},${x},${y}`),
      fill: () => operations.push(`fill:${contextState.fillStyle}`),
      stroke: () => operations.push(`stroke:${contextState.strokeStyle}:${contextState.lineWidth}`),
    }
    const context = contextState as unknown as CanvasRenderingContext2D

    stampMenuControls(context, true, "", false)

    expect(operations).toContain("roundRect:10,10,36,23,4")
    expect(operations).toContain("fillText:ESC,28,21.5")
    expect(operations).toContain("roundRect:41,163,123,23,4")
    expect(operations).toContain("roundRect:41,162,123,23,4")
    expect(operations).toContain("roundRect:187,163,23,23,4")
    expect(operations).toContain("roundRect:187,162,23,23,4")
    expect(operations).toContain("roundRect:216,163,23,23,4")
    expect(operations).toContain("roundRect:216,162,23,23,4")
    expect(operations).toContain("moveTo:204,173.5")
    expect(operations).toContain("lineTo:193,173.5")
    expect(operations).toContain("moveTo:222,173.5")
    expect(operations).toContain("lineTo:233,173.5")
    expect(operations.filter(operation => operation === "stroke:#000:2")).toHaveLength(6)
    expect(context.lineCap).toBe("round")
    expect(context.lineJoin).toBe("round")
  })

  test("positions available initials on QWERTY rows", () => {
    const operations: string[] = []
    const contextState = {
      fillStyle: "",
      font: "",
      lineWidth: 0,
      strokeStyle: "",
      textAlign: "",
      textBaseline: "",
      save: () => undefined,
      restore: () => undefined,
      scale: () => undefined,
      beginPath: () => undefined,
      roundRect: (x: number, y: number, width: number, height: number) =>
        operations.push(`roundRect:${x},${y},${width},${height}`),
      moveTo: () => undefined,
      lineTo: () => undefined,
      fillText: (text: string, x: number, y: number) => operations.push(`fillText:${text},${x},${y}`),
      fill: () => undefined,
      stroke: () => undefined,
    }
    const context = contextState as unknown as CanvasRenderingContext2D

    stampMenuControls(context, true, "AQZ19")

    expect(operations).toContain("roundRect:0,58,27,23")
    expect(operations).toContain("fillText:1,13.5,69.5")
    expect(operations).toContain("roundRect:224,58,27,23")
    expect(operations).toContain("fillText:9,237.5,69.5")
    expect(operations).toContain("roundRect:0,83,27,23")
    expect(operations).toContain("fillText:Q,13.5,94.5")
    expect(operations).toContain("roundRect:42,133,27,23")
    expect(operations).toContain("fillText:Z,55.5,144.5")
    expect(operations.some(operation => operation.startsWith("fillText:ESC,"))).toBe(false)
    expect(operations.some(operation => operation.startsWith("fillText:SHIFT,"))).toBe(false)
    expect(operations).toContain("fillText:A,27.5,119.5")
    expect(operations.some(operation => operation.startsWith("fillText:ESC,"))).toBe(false)
    expect(operations).not.toContain("roundRect:41,162,123,23")
    expect(operations).not.toContain("roundRect:187,162,23,23")
    expect(operations).not.toContain("roundRect:216,162,23,23")
    expect(contextState.font).toBe("bold 15px sans-serif")
  })

  test("shows ESC and bottom controls but omits alphanumeric keys from the plain screenshot", () => {
    const operations: string[] = []
    const context = {
      fillStyle: "",
      lineWidth: 0,
      strokeStyle: "",
      save: () => undefined,
      restore: () => undefined,
      scale: () => undefined,
      beginPath: () => undefined,
      roundRect: (x: number, y: number, width: number, height: number) =>
        operations.push(`roundRect:${x},${y},${width},${height}`),
      moveTo: () => undefined,
      lineTo: () => undefined,
      fillText: (text: string, x: number, y: number) => operations.push(`fillText:${text},${x},${y}`),
      fill: () => undefined,
      stroke: () => undefined,
    } as unknown as CanvasRenderingContext2D

    stampMenuControls(context, true, "AZ", false)

    expect(operations).toContain("roundRect:10,10,36,23")
    expect(operations).toContain("fillText:ESC,28,21.5")
    expect(operations).toContain("roundRect:41,162,123,23")
    expect(operations).toContain("roundRect:187,162,23,23")
    expect(operations).toContain("roundRect:216,162,23,23")
    expect(operations.some(operation => operation.startsWith("fillText:SHIFT,"))).toBe(false)
    expect(operations.some(operation => operation.startsWith("fillText:A,"))).toBe(false)
  })

  test("omits ESC and arrow keys but keeps the spacebar on HGR1 for a single disk", () => {
    Object.defineProperty(globalThis, "Path2D", {
      configurable: true,
      value: class {
        constructor() {
          throw new Error("Arrow path should not be created")
        }
      },
    })
    const operations: string[] = []
    const context = {
      fillStyle: "",
      font: "",
      lineWidth: 0,
      strokeStyle: "",
      textAlign: "",
      textBaseline: "",
      save: () => undefined,
      restore: () => undefined,
      scale: () => undefined,
      beginPath: () => undefined,
      roundRect: () => operations.push("spacebar"),
      fillText: () => undefined,
      fill: () => undefined,
      stroke: () => undefined,
    } as unknown as CanvasRenderingContext2D

    stampMenuControls(context, false, "", false)

    expect(operations).toHaveLength(2)
  })
})