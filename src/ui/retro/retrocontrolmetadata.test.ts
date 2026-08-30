import { ControlRegistry } from "../controls/controlregistry"
import { controlFromJson, retroPanelControls } from "./retrocontrolmetadata"
import { createControlContext, type RetroMenuContext } from "./retromenucontext"

describe("retro control panel metadata", () => {
  const createContext = () => {
    const close = jest.fn()
    const context: RetroMenuContext = {
      ...createControlContext(undefined, key => `translated:${key}`, "en", () => undefined),
      close,
    }
    return { close, context }
  }

  it("binds JSON labels and hierarchy", () => {
    const registry = new ControlRegistry<RetroMenuContext>(retroPanelControls)
    const { context } = createContext()

    const root = registry.resolve(context, null)
    expect(root.map(control => control.id)).toEqual(["options", "quit"])
    expect(root.map(control => control.label)).toEqual([
      "translated:retroControl.options",
      "translated:retroControl.quit",
    ])
    expect(root[0].tourTargets).toEqual(["#tour-configbuttons"])

    const other = registry.resolve(context, "options")[0]
    expect(other.id).toBe("options.other")
    expect(other.label).toBe("translated:retroControl.other")
    expect(other.separator).toBe(true)
    expect(other.selectable).toBe(false)
  })

  it("binds the JSON close action", () => {
    const registry = new ControlRegistry<RetroMenuContext>(retroPanelControls)
    const { close, context } = createContext()

    registry.resolve(context, null).find(control => control.id === "quit")?.action?.()

    expect(close).toHaveBeenCalledTimes(1)
  })

  it("hydrates translation params from JSON", () => {
    const context = createControlContext(
      undefined,
      (key, params) => `${key}:${params?.slot ?? ""}`,
      "en",
      () => undefined,
    )
    const slotControl = controlFromJson("machine", "slots.3")
    const label = typeof slotControl.label === "function"
      ? slotControl.label(context)
      : slotControl.label

    expect(label).toBe("retroControl.slot:3")
  })

  it("hydrates template params into disk template ids", () => {
    const control = controlFromJson(
      "diskTemplates",
      "diskDrives.{{driveIndex}}.load.device",
      {},
      { driveIndex: 2 },
    )

    expect(control.id).toBe("diskDrives.2.load.device")
  })
})