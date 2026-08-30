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
import { retroGamepadControls } from "../devices/gamepadconfig"
import { retroImageWriterControls } from "../devices/printer/imagewriter"
import { retroPanelControls } from "./retrocontrolmetadata"

const menuControls: RetroControlMetadata[] = [
  ...retroMachineControls,
  ...retroDiskControls,
  ...retroDisplayControls,
  ...retroAudioControls,
  ...retroPanelControls,
  retroSpeedControl,
  ...retroConfigControls,
  ...retroGamepadControls,
  ...retroImageWriterControls,
  retroSkinSeparator,
  retroSkinControl,
  ...retroSkinColorControls,
  ...createRetroLanguageControls(),
  ...retroStateControls,
  ...retroDebugControls,
  ...retroSerialControls,
]

export const retroMenuRegistry = new ControlRegistry<RetroMenuContext>(menuControls)