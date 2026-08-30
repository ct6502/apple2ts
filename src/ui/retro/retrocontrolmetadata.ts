import panelConfig from "./retrocontrolpanel.json"
import type { ControlOptionMetadata } from "../controls/controlregistry"
import type { RetroControlMetadata, RetroMenuContext } from "./retromenucontext"

type JsonControlMetadata = {
  group: string
  id: string
  parentId?: string | null
  binding?: string
  labelParams?: Record<string, unknown>
  actionLabelParams?: Record<string, unknown>
  contextualActionLabelParams?: Record<string, unknown>
  submenuTitleParams?: Record<string, unknown>
  labelKey?: string
  actionLabelKey?: string
  contextualActionLabelKey?: string
  submenuTitleKey?: string
  [key: string]: unknown
}

export type RetroControlBindings = Record<string, Partial<RetroControlMetadata>>
export type RetroControlTemplateParams = Record<string, string | number | boolean>

type ChoiceBinding = {
  options: (context: RetroMenuContext) => readonly Omit<ControlOptionMetadata<RetroMenuContext>, "action" | "preview">[]
  currentIndex: (context: RetroMenuContext) => number
  select: (context: RetroMenuContext, index: number) => void
  preview?: (context: RetroMenuContext, index: number) => void
}

type ToggleBinding = {
  enabled: (context: RetroMenuContext) => boolean
  setEnabled: (context: RetroMenuContext, enabled: boolean) => void
  preview?: (context: RetroMenuContext, enabled: boolean) => void
}

export const choiceBinding = ({
  options,
  currentIndex,
  select,
  preview,
}: ChoiceBinding): Partial<RetroControlMetadata> => ({
  options: context => options(context).map((option, index): ControlOptionMetadata<RetroMenuContext> => ({
    ...option,
    action: runtime => select(runtime, index),
    preview: preview ? runtime => preview(runtime, index) : undefined,
  })),
  optionIndex: currentIndex,
})

export const toggleBinding = ({
  enabled,
  setEnabled,
  preview,
}: ToggleBinding): Partial<RetroControlMetadata> => choiceBinding({
  options: context => [
    { label: context.t("messages.off") },
    { label: context.t("messages.on") },
  ],
  currentIndex: context => enabled(context) ? 1 : 0,
  select: (context, index) => setEnabled(context, index === 1),
  preview: preview ? (context, index) => preview(context, index === 1) : undefined,
})

const interpolateString = (value: string, params: RetroControlTemplateParams) =>
  value.replace(/\{\{([^}]+)\}\}/g, (_match, key: string) => {
    const replacement = params[key]
    return replacement === undefined ? "" : String(replacement)
  })

const hydrateTemplate = (value: unknown, params: RetroControlTemplateParams): unknown => {
  if (typeof value === "string") return interpolateString(value, params)
  if (Array.isArray(value)) return value.map(item => hydrateTemplate(item, params))
  if (value && typeof value === "object") {
    const hydrated: Record<string, unknown> = {}
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
      hydrated[key] = hydrateTemplate(entry, params)
    })
    return hydrated
  }
  return value
}

const toTranslateParams = (params: Record<string, unknown> | undefined) => {
  if (!params) return undefined
  const translated: Record<string, string> = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) translated[key] = String(value)
  })
  return translated
}

const translatedParamValue = (
  key: string | undefined,
  params: Record<string, unknown> | undefined,
) => key
  ? (context: RetroMenuContext) => context.t(key, toTranslateParams(params))
  : undefined

const jsonControls = () => panelConfig.controls as unknown as JsonControlMetadata[]

const resolveJsonControl = (
  sourceControl: JsonControlMetadata,
  bindings: RetroControlBindings,
  templateParams: RetroControlTemplateParams,
) => {
  const control = hydrateTemplate(sourceControl, templateParams) as JsonControlMetadata
  const {
    group: _group,
    binding,
    labelKey,
    labelParams,
    actionLabelKey,
    actionLabelParams,
    contextualActionLabelKey,
    contextualActionLabelParams,
    submenuTitleKey,
    submenuTitleParams,
    ...metadata
  } = control
  void _group
  const executable = bindings[binding ?? control.id] ?? {}
  const label = translatedParamValue(labelKey, labelParams) ?? executable.label
  if (!label) throw new Error(`Control ${control.id} requires labelKey or a label binding`)
  return {
    ...metadata,
    ...executable,
    id: control.id,
    label,
    actionLabel:
      translatedParamValue(actionLabelKey, actionLabelParams) ??
      executable.actionLabel ??
      metadata.actionLabel,
    contextualActionLabel:
      translatedParamValue(contextualActionLabelKey, contextualActionLabelParams) ??
      executable.contextualActionLabel ??
      metadata.contextualActionLabel,
    submenuTitle:
      translatedParamValue(submenuTitleKey, submenuTitleParams) ??
      executable.submenuTitle ??
      metadata.submenuTitle,
  } as RetroControlMetadata
}

export const controlsFromJson = (
  group: string,
  bindings: RetroControlBindings = {},
  templateParams: RetroControlTemplateParams = {},
): RetroControlMetadata[] => jsonControls()
  .filter(control => control.group === group)
  .map(control => resolveJsonControl(control, bindings, templateParams))

export const controlFromJson = (
  group: string,
  id: string,
  bindings: RetroControlBindings = {},
  templateParams: RetroControlTemplateParams = {},
): RetroControlMetadata => {
  const control = jsonControls().find(item => item.group === group && item.id === id)
  if (!control) throw new Error(`Control ${id} not found in group ${group}`)
  return resolveJsonControl(control, bindings, templateParams)
}

const panelBindings: RetroControlBindings = {
  quit: {
    action: context => context.close(),
  },
}

export const retroPanelControls = controlsFromJson("panel", panelBindings)