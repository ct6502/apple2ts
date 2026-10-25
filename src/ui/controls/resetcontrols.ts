import { ERROR_CODE } from "../../common/utility"
import { resetPreferences } from "../localstorage"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { setDialogMessageContext } from "../ui_utilities"

// Action for the "settings.reset" control declared in retrocontrolpanel.json.
// This lives outside configbuttons.tsx because the toolbar no longer has its own
// reset button: the retro control panel is the only surface that invokes it.
export const settingsResetBinding: Partial<RetroControlMetadata> = {
  action: context => {
    const { t } = context
    setDialogMessageContext({
      title: t("config.resetSettings"),
      message: t("config.resetSettingsText"),
      code: ERROR_CODE.QUESTION,
      actionCancel: () => {
        context.displayProps.updateDisplay()
      },
      actionConfirm: () => {
        resetPreferences(context.settingsOrigin)
        context.displayProps.updateDisplay()
      },
    })
    context.displayProps.updateDisplay()
  },
}
