export type ControlValue<Context, Value> = Value | ((context: Context) => Value)

export type ControlKind = "action" | "choice" | "toggle" | "submenu"

export type ControlOptionMetadata<Context> = {
  label: ControlValue<Context, string>
  popupLabel?: ControlValue<Context, string>
  action?: (context: Context) => void
  preview?: (context: Context) => void
  useBrowserFont?: boolean
}

export type ControlMetadata<Context, Payload = unknown> = {
  id: string
  kind?: ControlKind
  parentId?: string | null
  tourTargets?: readonly string[]
  order?: number
  label: ControlValue<Context, string>
  separator?: boolean
  value?: ControlValue<Context, string | undefined>
  action?: (context: Context) => unknown
  keepMenuOpen?: boolean
  refreshAfterAction?: boolean
  children?: ControlValue<Context, readonly ControlMetadata<Context, Payload>[]>
  submenuTitle?: ControlValue<Context, string>
  dynamicChildren?: (
    context: Context,
    items?: readonly ResolvedControl<Payload>[],
    values?: number[],
  ) => readonly ControlMetadata<Context, Payload>[]
  options?: ControlValue<Context, readonly ControlOptionMetadata<Context>[]>
  optionIndex?: ControlValue<Context, number>
  defaultIndex?: ControlValue<Context, number | undefined>
  isVisible?: ControlValue<Context, boolean>
  selectable?: ControlValue<Context, boolean>
  bulkSelectable?: ControlValue<Context, boolean>
  selectableWhen?: {
    controlId: string
    optionIndexes: readonly number[]
  }
  valueOnly?: boolean
  hideOptionValue?: boolean
  revealOptionOnFirstHorizontalInput?: boolean
  textInput?: boolean
  textValue?: ControlValue<Context, string>
  onTextInput?: (context: Context, value: string) => readonly ControlMetadata<Context, Payload>[]
  onHorizontalInput?: (
    context: Context,
    direction: -1 | 1,
  ) => readonly ControlMetadata<Context, Payload>[] | undefined
  loadMoreOnNavigatePastEnd?: (context: Context) => Promise<readonly ControlMetadata<Context, Payload>[]>
  actionLabel?: ControlValue<Context, string | undefined>
  contextualActionLabel?: ControlValue<Context, string | undefined>
  contextualSubmenuTitleValue?: ControlValue<Context, string | undefined>
  submenuTitleValue?: (
    context: Context,
    items: readonly ResolvedControl<Payload>[],
    values: number[],
  ) => string | undefined
  refreshOptions?: (
    context: Context,
    index: number,
    items?: readonly ResolvedControl<Payload>[],
    values?: number[],
  ) => readonly ControlMetadata<Context, Payload>[]
  refreshParentOnOption?: boolean
  refreshTitle?: (context: Context) => string
  checkmarkIndex?: number
  indicator?: ControlValue<Context, string | undefined>
  payload?: Payload
  submit?: (context: Context, items: readonly ResolvedControl<Payload>[], values: number[]) => void
  isSubmitVisible?: (context: Context, items: readonly ResolvedControl<Payload>[], values: number[]) => boolean
}

export type ResolvedControlOption = {
  label: string
  popupLabel?: string
  action?: () => void
  preview?: () => void
  useBrowserFont?: boolean
}

export type ResolvedControl<Payload = unknown> = {
  id: string
  parentId?: string | null
  kind: ControlKind
  tourTargets?: readonly string[]
  label: string
  separator?: boolean
  value?: string
  action?: () => unknown
  keepMenuOpen?: boolean
  refreshAfterAction?: boolean
  children?: ResolvedControl<Payload>[] | ((
    items?: readonly ResolvedControl<Payload>[],
    values?: number[],
  ) => ResolvedControl<Payload>[])
  submenuTitle?: string
  options?: ResolvedControlOption[]
  optionIndex?: number
  defaultIndex?: number
  selectable?: boolean
  bulkSelectable?: boolean
  selectableWhen?: {
    controlId: string
    optionIndexes: readonly number[]
  }
  valueOnly?: boolean
  hideOptionValue?: boolean
  revealOptionOnFirstHorizontalInput?: boolean
  textInput?: boolean
  textValue?: string
  onTextInput?: (value: string) => ResolvedControl<Payload>[]
  onHorizontalInput?: (direction: -1 | 1) => ResolvedControl<Payload>[] | undefined
  loadMoreOnNavigatePastEnd?: () => Promise<ResolvedControl<Payload>[]>
  actionLabel?: string
  contextualActionLabel?: string
  contextualSubmenuTitleValue?: string
  submenuTitleValue?: (items: readonly ResolvedControl<Payload>[], values: number[]) => string | undefined
  refreshOptions?: (
    index: number,
    items?: readonly ResolvedControl<Payload>[],
    values?: number[],
  ) => ResolvedControl<Payload>[]
  refreshTitle?: () => string
  checkmarkIndex?: number
  indicator?: string
  payload?: Payload
  submit?: (items: readonly ResolvedControl<Payload>[], values: number[]) => void
  isSubmitVisible?: (items: readonly ResolvedControl<Payload>[], values: number[]) => boolean
}

type RegisteredControl<Context, Payload> = {
  metadata: ControlMetadata<Context, Payload>
  registrationIndex: number
  parentId: string | null
  kind: ControlKind
}

const valueOf = <Context, Value>(value: ControlValue<Context, Value>, context: Context): Value =>
  typeof value === "function" ? (value as (context: Context) => Value)(context) : value

export const formatControlLabel = (label: string, separator = false) =>
  separator ? `—${label}—` : label

export const inferControlKind = <Context, Payload>(metadata: ControlMetadata<Context, Payload>): ControlKind => {
  if (metadata.kind) return metadata.kind
  if (metadata.children || metadata.dynamicChildren) return "submenu"
  if (metadata.options) return "choice"
  return "action"
}

const defaultParentId = <Context, Payload>(metadata: ControlMetadata<Context, Payload>) => {
  if (metadata.parentId !== undefined) return metadata.parentId
  return "options"
}

export class ControlRegistry<Context, Payload = unknown> {
  private readonly registrations: RegisteredControl<Context, Payload>[]

  constructor(metadata: readonly ControlMetadata<Context, Payload>[]) {
    const ids = new Set<string>()
    this.registrations = metadata.map((control, registrationIndex) => {
      if (ids.has(control.id)) throw new Error(`Duplicate control metadata id: ${control.id}`)
      ids.add(control.id)
      const kind = inferControlKind(control)
      return {
        metadata: control,
        registrationIndex,
        parentId: defaultParentId(control),
        kind,
      }
    })
  }

  getIds(parentId?: string | null): string[] {
    const registrations = parentId === undefined
      ? this.registrations
      : this.sortedRegistrations(parentId)
    return registrations.map(({ metadata }) => metadata.id)
  }

  resolve(context: Context, parentId: string | null = null): ResolvedControl<Payload>[] {
    return this.sortedRegistrations(parentId)
      .filter(({ metadata }) => metadata.isVisible === undefined || valueOf(metadata.isVisible, context))
      .map(registration => this.resolveControl(registration.metadata, context, registration.parentId))
  }

  private sortedRegistrations(parentId: string | null) {
    return this.registrations
      .filter(registration => registration.parentId === parentId)
      .sort((left, right) =>
        (left.metadata.order ?? Number.POSITIVE_INFINITY) -
          (right.metadata.order ?? Number.POSITIVE_INFINITY) ||
        left.registrationIndex - right.registrationIndex)
  }

  private resolveControl(
    metadata: ControlMetadata<Context, Payload>,
    context: Context,
    parentId?: string | null,
  ): ResolvedControl<Payload> {
    const declaredChildren = metadata.children
      ? valueOf(metadata.children, context).map(child => this.resolveControl(child, context))
      : undefined
    const dynamicChildren = metadata.dynamicChildren
      ? (items?: readonly ResolvedControl<Payload>[], values?: number[]) =>
        metadata.dynamicChildren!(context, items, values).map(child => this.resolveControl(child, context))
      : undefined
    const registeredChildren = this.registrations.some(registration => registration.parentId === metadata.id)
      ? () => this.resolve(context, metadata.id)
      : undefined
    const children = dynamicChildren ?? declaredChildren ?? registeredChildren
    const resolvedOptions = metadata.options
      ? valueOf(metadata.options, context).map(option => ({
        label: valueOf(option.label, context),
        popupLabel: option.popupLabel === undefined ? undefined : valueOf(option.popupLabel, context),
        action: option.action ? () => option.action!(context) : undefined,
        preview: option.preview ? () => option.preview!(context) : undefined,
        useBrowserFont: option.useBrowserFont,
      }))
      : undefined

    return {
      id: metadata.id,
      parentId: parentId ?? null,
      kind: inferControlKind(metadata),
      tourTargets: metadata.tourTargets,
      label: valueOf(metadata.label, context),
      separator: metadata.separator,
      value: metadata.value === undefined ? undefined : valueOf(metadata.value, context),
      action: metadata.action ? () => metadata.action!(context) : undefined,
      keepMenuOpen: metadata.keepMenuOpen,
      refreshAfterAction: metadata.refreshAfterAction,
      children,
      submenuTitle: metadata.submenuTitle === undefined ? undefined : valueOf(metadata.submenuTitle, context),
      options: resolvedOptions,
      optionIndex: metadata.optionIndex === undefined ? undefined : valueOf(metadata.optionIndex, context),
      defaultIndex: metadata.defaultIndex === undefined ? undefined : valueOf(metadata.defaultIndex, context),
      selectable: metadata.selectable === undefined ? undefined : valueOf(metadata.selectable, context),
      bulkSelectable: metadata.bulkSelectable === undefined
        ? undefined
        : valueOf(metadata.bulkSelectable, context),
      selectableWhen: metadata.selectableWhen,
      valueOnly: metadata.valueOnly,
      hideOptionValue: metadata.hideOptionValue,
      revealOptionOnFirstHorizontalInput: metadata.revealOptionOnFirstHorizontalInput,
      textInput: metadata.textInput,
      textValue: metadata.textValue === undefined ? undefined : valueOf(metadata.textValue, context),
      onTextInput: metadata.onTextInput
        ? value => metadata.onTextInput!(context, value)
          .map(item => this.resolveControl(item, context))
        : undefined,
      onHorizontalInput: metadata.onHorizontalInput
        ? direction => metadata.onHorizontalInput!(context, direction)
          ?.map(item => this.resolveControl(item, context))
        : undefined,
      loadMoreOnNavigatePastEnd: metadata.loadMoreOnNavigatePastEnd
        ? async () => (await metadata.loadMoreOnNavigatePastEnd!(context))
          .map(item => this.resolveControl(item, context))
        : undefined,
      actionLabel: metadata.actionLabel === undefined ? undefined : valueOf(metadata.actionLabel, context),
      contextualActionLabel: metadata.contextualActionLabel === undefined
        ? undefined
        : valueOf(metadata.contextualActionLabel, context),
      contextualSubmenuTitleValue: metadata.contextualSubmenuTitleValue === undefined
        ? undefined
        : valueOf(metadata.contextualSubmenuTitleValue, context),
      submenuTitleValue: metadata.submenuTitleValue
        ? (items, values) => metadata.submenuTitleValue!(context, items, values)
        : undefined,
      refreshOptions: metadata.refreshParentOnOption && parentId !== undefined
        ? index => this.resolve(context, parentId).map(item => item.id === metadata.id
          ? { ...item, optionIndex: index }
          : item)
        : metadata.refreshOptions
          ? (index, items, values) => metadata.refreshOptions!(context, index, items, values)
            .map(child => this.resolveControl(child, context))
          : undefined,
      refreshTitle: metadata.refreshTitle ? () => metadata.refreshTitle!(context) : undefined,
      checkmarkIndex: metadata.checkmarkIndex,
      indicator: metadata.indicator === undefined ? undefined : valueOf(metadata.indicator, context),
      payload: metadata.payload,
      submit: metadata.submit ? (items, values) => metadata.submit!(context, items, values) : undefined,
      isSubmitVisible: metadata.isSubmitVisible
        ? (items, values) => metadata.isSubmitVisible!(context, items, values)
        : undefined,
    }
  }
}