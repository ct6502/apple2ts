import { ControlRegistry } from "../controls/controlregistry"
import { retroConfigControls } from "../controls/configbuttons"
import { retroStateControls } from "../controls/controlbuttons"
import { retroDebugControls } from "../controls/debugbuttons"
import { createRetroLanguageControls } from "../controls/languageswitch"
import { retroSpeedControl } from "../controls/speeddropdown"
import { retroAudioControls } from "../devices/audio/audioconfig"
import { retroDiskControls } from "../devices/disk/diskinterface"
import { retroDisplayControls } from "../devices/displayconfig"
import { retroMachineControls } from "../devices/machineconfig"
import { retroSerialControls } from "../devices/serial/serialselect"
import type { RetroControlMetadata, RetroMenuContext } from "./retromenucontext"
import { retroSkinColorControls, retroSkinControl, retroSkinSeparator } from "./retroskincontrol"
import { retroTourControls } from "../tours/runtour"
import { retroGamepadControls } from "../devices/gamepadconfig"

const menuControls: RetroControlMetadata[] = [
  ...retroMachineControls,
  ...retroDiskControls,
  ...retroDisplayControls,
  ...retroAudioControls,
  {
    id: "options",
    parentId: null,
    order: 8.5,
    tourTargets: ["#tour-configbuttons"],
    label: context => context.t("retroControl.options"),
  },
  retroSpeedControl,
  ...retroConfigControls,
  ...retroGamepadControls,
  retroSkinSeparator,
  retroSkinControl,
  ...retroSkinColorControls,
  ...createRetroLanguageControls(),
  {
    id: "options.other",
    parentId: "options",
    order: 1000,
    label: context => context.t("retroControl.other"),
    separator: true,
    selectable: false,
  },
  ...retroStateControls,
  ...retroDebugControls,
  ...retroSerialControls,
  ...retroTourControls,
  {
    id: "quit",
    parentId: null,
    order: 10,
    label: context => context.t("retroControl.quit"),
    action: context => context.close(),
  },
]

export const retroMenuRegistry = new ControlRegistry<RetroMenuContext>(menuControls)