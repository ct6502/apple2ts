import { ControlMetadata, ControlRegistry, inferControlKind } from "./controlregistry"

type Context = { enabled: boolean }

const choice = (id: string, order?: number): ControlMetadata<Context> => ({
  id,
  order,
  label: id,
  options: [{ label: "Off" }, { label: "On" }],
  optionIndex: context => context.enabled ? 1 : 0,
})

describe("ControlRegistry", () => {
  test("rejects duplicate stable IDs", () => {
    expect(() => new ControlRegistry([choice("duplicate"), choice("duplicate")]))
      .toThrow("Duplicate control metadata id: duplicate")
  })

  test("defaults all unplaced controls to options in registration order", () => {
    const registry = new ControlRegistry([
      choice("choice"),
      { id: "action", label: "Action", action: () => undefined },
      { id: "submenu", label: "Submenu", children: [] },
    ])

    expect(registry.resolve({ enabled: false })).toEqual([])
    expect(registry.resolve({ enabled: false }, "options").map(item => item.id))
      .toEqual(["choice", "action", "submenu"])
  })

  test("honors explicit parent and order before registration order", () => {
    const registry = new ControlRegistry([
      { ...choice("last"), parentId: "display", order: 20 },
      { ...choice("middle-a"), parentId: "display", order: 10 },
      { ...choice("first"), parentId: "display", order: 0 },
      { ...choice("middle-b"), parentId: "display", order: 10 },
    ])

    expect(registry.resolve({ enabled: true }, "display").map(item => item.id))
      .toEqual(["first", "middle-a", "middle-b", "last"])
  })

  test("infers common control behavior from capabilities", () => {
    expect(inferControlKind({ id: "action", label: "Action", action: () => undefined })).toBe("action")
    expect(inferControlKind(choice("choice"))).toBe("choice")
    expect(inferControlKind({ ...choice("defaulted-choice"), defaultIndex: 0 })).toBe("choice")
    expect(inferControlKind({ ...choice("toggle"), kind: "toggle" })).toBe("toggle")
    expect(inferControlKind({ id: "submenu", label: "Submenu", children: [] })).toBe("submenu")
    expect(inferControlKind({ id: "dynamic", label: "Dynamic", dynamicChildren: () => [] })).toBe("submenu")
  })

  test("preserves separator metadata when resolving controls", () => {
    const registry = new ControlRegistry<Context>([{
      id: "other",
      label: "Other",
      separator: true,
      selectable: false,
    }])

    expect(registry.resolve({ enabled: false }, "options")[0]).toMatchObject({
      kind: "action",
      label: "Other",
      separator: true,
      selectable: false,
    })
  })

  test("resolves contextual visibility and selectability", () => {
    const registry = new ControlRegistry<Context>([
      { id: "visible", label: "Visible", isVisible: context => context.enabled },
      { id: "selectable", label: "Selectable", selectable: context => context.enabled },
    ])

    expect(registry.resolve({ enabled: false }, "options")).toEqual([
      expect.objectContaining({ id: "selectable", selectable: false }),
    ])
    expect(registry.resolve({ enabled: true }, "options")).toEqual([
      expect.objectContaining({ id: "visible" }),
      expect.objectContaining({ id: "selectable", selectable: true }),
    ])
  })

  test("refreshes an ordered parent while retaining the previewed index", () => {
    const registry = new ControlRegistry<Context>([
      { id: "options", parentId: null, label: "Options" },
      { ...choice("first", 0), refreshParentOnOption: true },
      choice("second", 1),
    ])
    const [first] = registry.resolve({ enabled: false }, "options")

    const refreshed = first.refreshOptions?.(1) ?? []
    expect(refreshed.map(item => item.id)).toEqual(["first", "second"])
    expect(refreshed[0].optionIndex).toBe(1)
  })
})