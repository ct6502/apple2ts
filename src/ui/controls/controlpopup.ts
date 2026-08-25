import type { ResolvedControl } from "./controlregistry"

const optionItems = (control: ResolvedControl): PopupMenuItem[] =>
  control.options?.map((option, index) => ({
    label: option.popupLabel ?? option.label,
    isSelected: () => control.optionIndex === index,
    onClick: option.action,
  })) ?? []

export const controlsToPopupItems = (
  controls: readonly ResolvedControl[],
  includeChoiceHeadings = true,
): PopupMenuItem[] => controls.flatMap((control): PopupMenuItem[] => {
  if (control.separator) return [{ label: "-" }]
  if (control.kind === "toggle") {
    const nextIndex = control.optionIndex === 1 ? 0 : 1
    return [{
      label: control.label,
      isDisabled: control.selectable === false,
      isSelected: () => control.optionIndex === 1,
      onClick: control.options?.[nextIndex]?.action,
    }]
  }
  if (control.options) {
    return [
      ...(includeChoiceHeadings ? [{ label: control.label, isHeading: true }] : []),
      ...optionItems(control),
    ]
  }
  const children = typeof control.children === "function" ? control.children() : control.children
  return [{
    label: control.label,
    isDisabled: control.selectable === false,
    onClick: control.action,
    subMenu: children ? controlsToPopupItems(children) : undefined,
  }]
})

export const controlOptionsToPopupItems = (control: ResolvedControl): PopupMenuItem[] =>
  optionItems(control)