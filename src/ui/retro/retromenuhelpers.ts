import type { ControlOptionMetadata } from "../controls/controlregistry"
import type { RetroControlMetadata, RetroMenuContext } from "./retromenucontext"

export const choiceMetadata = (
  metadata: Omit<RetroControlMetadata, "options" | "optionIndex"> & {
    labels: (context: RetroMenuContext) => readonly string[]
    currentIndex: (context: RetroMenuContext) => number
    select: (context: RetroMenuContext, index: number) => void
    preview?: (context: RetroMenuContext, index: number) => void
  },
): RetroControlMetadata => {
  const { labels, currentIndex, select, preview, ...control } = metadata
  return {
    ...control,
    kind: control.kind ?? "choice",
    options: context => labels(context).map((label, index): ControlOptionMetadata<RetroMenuContext> => ({
      label,
      action: runtime => select(runtime, index),
      preview: preview ? runtime => preview(runtime, index) : undefined,
    })),
    optionIndex: currentIndex,
  }
}

export const toggleMetadata = (
  metadata: Omit<RetroControlMetadata, "kind" | "options" | "optionIndex" | "defaultIndex"> & {
    enabled: (context: RetroMenuContext) => boolean
    setEnabled: (context: RetroMenuContext, enabled: boolean) => void
    preview?: (context: RetroMenuContext, enabled: boolean) => void
  },
): RetroControlMetadata => {
  const { enabled, setEnabled, preview, ...control } = metadata
  return choiceMetadata({
    ...control,
    kind: "toggle",
    labels: context => [context.t("messages.off"), context.t("messages.on")],
    currentIndex: context => enabled(context) ? 1 : 0,
    select: (context, index) => setEnabled(context, index === 1),
    preview: preview ? (context, index) => preview(context, index === 1) : undefined,
    defaultIndex: 0,
  })
}