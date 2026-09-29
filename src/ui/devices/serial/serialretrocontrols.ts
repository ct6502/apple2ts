// Retro control-panel bindings for the serial port choice, consumed by
// retromenucomposition.ts. The equivalent dropdown for the classic UI lives in
// the Machine Configuration popup menu (machineconfig.tsx).
import { changeSerialMode, getSerialMode } from "./serialhub"
import type { RetroControlMetadata, RetroMenuContext } from "../../retro/retromenucontext"
import { choiceBinding, controlsFromJson, type RetroControlBindings } from "../../retro/retrocontrolmetadata"

const serialNames = (context: RetroMenuContext) => [
  context.t("retroControl.builtinImageWriter"),
  context.t(getSerialMode() === 0 ? "retroControl.selectExternalPort" : "retroControl.externalPort"),
]

const serialBindings: RetroControlBindings = {
  printerPort: {
    ...choiceBinding({
      options: context => serialNames(context).map(label => ({ label })),
      currentIndex: getSerialMode,
      select: (context, index) => {
        changeSerialMode(index)
        context.displayProps.updateDisplay()
      },
    }),
    defaultIndex: 0,
  },
}

export const retroSerialControls: RetroControlMetadata[] = controlsFromJson("serial", serialBindings)
